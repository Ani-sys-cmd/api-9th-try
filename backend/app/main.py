import os
import shutil
import json
import glob
from datetime import datetime
from typing import List, Dict, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import Agents
from app.agents.scanner import ProjectScanner
from app.agents.generator import TestGenerator
from app.agents.executor import TestExecutor
from app.agents.healer import SelfHealingAgent
from app.agents.rl_engine import RLEngine
from app.agents.github_handler import GitHubHandler

app = FastAPI(title="Agentic AI Tester", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agents
scanner = ProjectScanner()
generator = TestGenerator()
executor = TestExecutor()
healer = SelfHealingAgent()
rl_engine = RLEngine()
github_handler = GitHubHandler()

STATE_FILE = "system_state.json"

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except:
            pass
    return {
        "project_name": None,
        "upload_path": None,
        "endpoints": [],
        "test_file": None,
        "latest_results": None
    }

def save_state(new_state):
    with open(STATE_FILE, "w") as f:
        json.dump(new_state, f, indent=4)

# --- Helper to Find Test File if State is Broken ---
def find_test_file(project_name):
    # If project is "server.zip", look for "test_server.py"
    if not project_name: return None
    clean_name = project_name.replace(".zip", "")
    expected_path = os.path.join("tests", "generated", f"test_{clean_name}.py")
    
    if os.path.exists(expected_path):
        return expected_path
    
    # Fallback: Look for ANY python file in tests/generated
    files = glob.glob("tests/generated/*.py")
    if files:
        return files[0]
    return None

# --- Models ---
class GenerateRequest(BaseModel):
    base_url: str = "http://localhost:5000"

class ProcessGitHubRequest(BaseModel):
    github_url: str
    token: Optional[str] = None

class HealTestRequest(BaseModel):
    test_file: str
    failure_logs: str

class DiagnoseRequest(BaseModel):
    source_file: str
    error_logs: str

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"status": "System Operational"}

@app.post("/upload")
async def upload_project(file: UploadFile = File(...)):
    try:
        file_location = f"storage/uploads/{file.filename}"
        os.makedirs("storage/uploads", exist_ok=True)
        
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        endpoints = scanner.scan_project(file_location)
        
        state = load_state()
        state["project_name"] = file.filename
        state["upload_path"] = file_location
        state["endpoints"] = endpoints
        save_state(state)

        return {
            "message": "Project scanned successfully",
            "endpoints_found": len(endpoints),
            "endpoints_data": endpoints
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-tests")
def generate_tests(request: GenerateRequest):
    state = load_state()
    if not state.get("endpoints"):
        raise HTTPException(status_code=400, detail="No endpoints found. Please upload project first.")

    try:
        project_name = state["project_name"].replace(".zip", "")
        test_file_path = generator.generate_test_suite(
            project_name, 
            state["endpoints"], 
            request.base_url
        )
        
        state["test_file"] = test_file_path
        save_state(state)
        
        return {
            "message": "Test suite generated",
            "test_file_path": test_file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/run-tests")
def run_tests():
    state = load_state()
    test_file = state.get("test_file")

    # FAIL-SAFE: If state is empty, try to find the file automatically
    if not test_file or not os.path.exists(test_file):
        print("DEBUG: State missing test_file, attempting auto-discovery...")
        found_file = find_test_file(state.get("project_name"))
        if found_file:
            test_file = found_file
            state["test_file"] = found_file
            save_state(state) # Repair the state
        else:
            raise HTTPException(status_code=400, detail="No test file found. Please generate tests first.")

    try:
        results = executor.run_test_suite(test_file)
        
        state["latest_results"] = results
        save_state(state)
        
        # Save to run history
        history_file = "run_history.json"
        history = []
        if os.path.exists(history_file):
            try:
                with open(history_file, "r") as f:
                    history = json.load(f)
            except:
                history = []
        
        # Add new run to history
        history.append({
            "timestamp": datetime.now().isoformat(),
            "project_name": state.get("project_name", "Unknown"),
            "status": "passed" if results.get("status") == "success" else "failed",
            "reward": results.get("reward", 0),
            "summary": results.get("summary", {}),
            "test_file": test_file
        })
        
        # Keep only last 100 runs
        history = history[-100:]
        
        with open(history_file, "w") as f:
            json.dump(history, f, indent=2)
        
        # RL Update
        if state.get("endpoints"):
            for ep in state["endpoints"]:
                rl_engine.update_policy(ep['path'], "standard", results['reward'])

        return {
            "status": "Execution Complete",
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/heal-test")
def heal_test(request: HealTestRequest):
    try:
        result = healer.heal_test_case(request.test_file, request.failure_logs)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/diagnose-code")
def diagnose_code(request: DiagnoseRequest):
    try:
        state = load_state()
        project_name = state.get("project_name", "server").replace(".zip", "")
        
        # Heuristic to find the server file
        estimated_path = f"storage/extracted/{project_name}/server.js"
        
        # Check if file exists, if not try to find ANY .js file
        if not os.path.exists(estimated_path):
             js_files = glob.glob(f"storage/extracted/{project_name}/*.js")
             if js_files:
                 estimated_path = js_files[0]

        target_file = request.source_file if request.source_file else estimated_path
        
        result = healer.diagnose_backend_bug(target_file, request.error_logs)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-github")
async def process_github(request: ProcessGitHubRequest):
    """Process a GitHub repository - clone, zip, and scan for endpoints"""
    try:
        # Clone and convert to ZIP
        zip_path = github_handler.clone_and_zip(request.github_url, request.token)
        
        # Scan the project
        endpoints = scanner.scan_project(zip_path)
        
        # Extract project name from URL
        repo_name = request.github_url.rstrip('/').split('/')[-1]
        if repo_name.endswith('.git'):
            repo_name = repo_name[:-4]
        
        # Save state
        state = load_state()
        state["project_name"] = f"{repo_name}.zip"
        state["upload_path"] = zip_path
        state["endpoints"] = endpoints
        save_state(state)
        
        return {
            "message": "GitHub repository processed successfully",
            "project_name": f"{repo_name}.zip",
            "endpoints_found": len(endpoints),
            "endpoints_data": endpoints
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard-stats")
async def get_dashboard_stats():
    """Get dashboard statistics from run history"""
    try:
        # Load run history
        history_file = "run_history.json"
        if os.path.exists(history_file):
            with open(history_file, "r") as f:
                history = json.load(f)
        else:
            history = []
        
        # Calculate stats
        total_runs = len(history)
        passed_runs = sum(1 for run in history if run.get("status") == "passed")
        
        # Calculate average reward
        rewards = [run.get("reward", 0) for run in history if "reward" in run]
        avg_reward = sum(rewards) / len(rewards) if rewards else 0
        
        # Count unique projects
        unique_projects = len(set(run.get("project_name", "") for run in history))
        
        return {
            "total_runs": total_runs,
            "passed_runs": passed_runs,
            "avg_reward": avg_reward,
            "active_projects": unique_projects
        }
    except Exception as e:
        print(f"Error getting dashboard stats: {e}")
        return {
            "total_runs": 0,
            "passed_runs": 0,
            "avg_reward": 0,
            "active_projects": 0
        }

@app.get("/history")
async def get_history():
    """Get test execution history"""
    try:
        history_file = "run_history.json"
        if os.path.exists(history_file):
            with open(history_file, "r") as f:
                history = json.load(f)
            # Sort by timestamp, most recent first
            history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return {"history": history}
        else:
            return {"history": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

