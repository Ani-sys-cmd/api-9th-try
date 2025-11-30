import os
import shutil
import json
import glob
from datetime import datetime
from typing import List, Dict, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, status, Header, Depends
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

# --- User Dependency ---
async def get_current_user_id(x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        # For backward compatibility or testing without auth, we could return a default
        # But for strict isolation, we should probably require it.
        # Let's allow a "default" user for now if header is missing to prevent total breakage during transition
        return "default_user"
    return x_user_id

# --- State Management ---
def get_user_session_path(user_id: str):
    # Changed to storage/sessions/<user_id>
    path = os.path.join("storage", "sessions", user_id)
    os.makedirs(path, exist_ok=True)
    return path

def get_user_upload_dir(user_id: str):
    path = os.path.join(get_user_session_path(user_id), "uploads")
    os.makedirs(path, exist_ok=True)
    return path

def get_user_extract_dir(user_id: str):
    path = os.path.join(get_user_session_path(user_id), "extracted")
    os.makedirs(path, exist_ok=True)
    return path

def get_state_file(user_id: str):
    return os.path.join(get_user_session_path(user_id), "system_state.json")

def load_state(user_id: str):
    state_file = get_state_file(user_id)
    if os.path.exists(state_file):
        try:
            with open(state_file, "r") as f:
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

def save_state(new_state, user_id: str):
    state_file = get_state_file(user_id)
    with open(state_file, "w") as f:
        json.dump(new_state, f, indent=4)

def cleanup_user_session(user_id: str):
    """Deletes the entire session directory for a user."""
    session_path = get_user_session_path(user_id)
    if os.path.exists(session_path):
        try:
            shutil.rmtree(session_path)
            print(f"Cleaned up session for user: {user_id}")
        except Exception as e:
            print(f"Error cleaning up session for {user_id}: {e}")

def cleanup_previous_uploads(user_id: str):
    """Deletes previous uploads and extracted files for a user within the session."""
    upload_dir = get_user_upload_dir(user_id)
    extract_dir = get_user_extract_dir(user_id)
    
    # Clean uploads
    if os.path.exists(upload_dir):
        for filename in os.listdir(upload_dir):
            file_path = os.path.join(upload_dir, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Failed to delete {file_path}. Reason: {e}")

    # Clean extracted
    if os.path.exists(extract_dir):
        for filename in os.listdir(extract_dir):
            file_path = os.path.join(extract_dir, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Failed to delete {file_path}. Reason: {e}")

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
async def upload_project(file: UploadFile = File(...), user_id: str = Depends(get_current_user_id)):
    try:
        # Cleanup previous session data
        cleanup_previous_uploads(user_id)
        
        uploads_dir = get_user_upload_dir(user_id)
        extract_dir = get_user_extract_dir(user_id)
        
        file_location = os.path.join(uploads_dir, file.filename)
        
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Pass specific extract_dir to scanner
        endpoints = scanner.scan_project(file_location, extract_dir)
        
        state = load_state(user_id)
        state["project_name"] = file.filename
        state["upload_path"] = file_location
        state["endpoints"] = endpoints
        save_state(state, user_id)

        return {
            "message": "Project scanned successfully",
            "endpoints_found": len(endpoints),
            "endpoints_data": endpoints
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-tests")
def generate_tests(request: GenerateRequest, user_id: str = Depends(get_current_user_id)):
    state = load_state(user_id)
    if not state.get("endpoints"):
        raise HTTPException(status_code=400, detail="No endpoints found. Please upload project first.")

    try:
        project_name = state["project_name"].replace(".zip", "")
        # Note: Generator might need updates if it hardcodes paths, but for now we pass the endpoints
        test_file_path = generator.generate_test_suite(
            project_name, 
            state["endpoints"], 
            request.base_url
        )
        
        state["test_file"] = test_file_path
        save_state(state, user_id)
        
        return {
            "message": "Test suite generated",
            "test_file_path": test_file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/run-tests")
def run_tests(user_id: str = Depends(get_current_user_id)):
    state = load_state(user_id)
    test_file = state.get("test_file")

    # FAIL-SAFE: If state is empty, try to find the file automatically
    if not test_file or not os.path.exists(test_file):
        print("DEBUG: State missing test_file, attempting auto-discovery...")
        found_file = find_test_file(state.get("project_name"))
        if found_file:
            test_file = found_file
            state["test_file"] = found_file
            save_state(state, user_id) # Repair the state
        else:
            raise HTTPException(status_code=400, detail="No test file found. Please generate tests first.")

    try:
        results = executor.run_test_suite(test_file)
        
        state["latest_results"] = results
        save_state(state, user_id)
        
        # Save to run history (Global history for now, or per user?)
        # User requested session-scoped uploads, but history might be persistent?
        # "The system keeps old extracted folders even when they are no longer needed."
        # "Make project uploads SESSION-SCOPED"
        # History is likely persistent per user, but let's store it in session for now as requested "A user only sees the project they uploaded DURING that session."
        # Wait, history usually persists. But the prompt says "When the user logs out, the project should be removed."
        # It doesn't explicitly say delete HISTORY. But it says "Logging out should delete the session folder completely."
        # If we store history in session folder, it gets deleted.
        # Let's assume history should persist in a separate "persistent" folder if we wanted it to, but based on "delete the session folder completely", maybe they want a clean slate?
        # Actually, usually history is persistent.
        # Let's keep history in `storage/users/<user_id>/run_history.json` (persistent) and project files in `storage/sessions/<user_id>` (ephemeral).
        
        # Persistent storage for history
        persistent_user_storage = os.path.join("storage", "users", user_id)
        os.makedirs(persistent_user_storage, exist_ok=True)
        history_file = os.path.join(persistent_user_storage, "run_history.json")
        
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
def heal_test(request: HealTestRequest, user_id: str = Depends(get_current_user_id)):
    try:
        result = healer.heal_test_case(request.test_file, request.failure_logs)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/diagnose-code")
def diagnose_code(request: DiagnoseRequest, user_id: str = Depends(get_current_user_id)):
    try:
        state = load_state(user_id)
        project_name = state.get("project_name", "server").replace(".zip", "")
        
        # Look in session extracted dir
        extract_dir = get_user_extract_dir(user_id)
        estimated_path = os.path.join(extract_dir, project_name, "server.js")
        
        # Check if file exists, if not try to find ANY .js file
        if not os.path.exists(estimated_path):
             js_files = glob.glob(os.path.join(extract_dir, project_name, "*.js"))
             if js_files:
                 estimated_path = js_files[0]

        target_file = request.source_file if request.source_file else estimated_path
        
        result = healer.diagnose_backend_bug(target_file, request.error_logs)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-github")
async def process_github(request: ProcessGitHubRequest, user_id: str = Depends(get_current_user_id)):
    """Process a GitHub repository - clone, zip, and scan for endpoints"""
    try:
        # Cleanup previous session data
        cleanup_previous_uploads(user_id)
        
        uploads_dir = get_user_upload_dir(user_id)
        extract_dir = get_user_extract_dir(user_id)
        
        # Clone and convert to ZIP
        zip_path = github_handler.clone_and_zip(request.github_url, request.token, uploads_dir)
        
        # Scan the project
        endpoints = scanner.scan_project(zip_path, extract_dir)
        
        # Extract project name from URL
        repo_name = request.github_url.rstrip('/').split('/')[-1]
        if repo_name.endswith('.git'):
            repo_name = repo_name[:-4]
        
        # Save state
        state = load_state(user_id)
        state["project_name"] = f"{repo_name}.zip"
        state["upload_path"] = zip_path
        state["endpoints"] = endpoints
        save_state(state, user_id)
        
        return {
            "message": "GitHub repository processed successfully",
            "project_name": f"{repo_name}.zip",
            "endpoints_found": len(endpoints),
            "endpoints_data": endpoints
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scan-project")
async def scan_project_manual(user_id: str = Depends(get_current_user_id)):
    """Manually trigger a re-scan of the current project"""
    try:
        state = load_state(user_id)
        upload_path = state.get("upload_path")
        
        if not upload_path or not os.path.exists(upload_path):
            raise HTTPException(status_code=400, detail="No project file found. Please upload a project first.")
            
        extract_dir = get_user_extract_dir(user_id)
        
        # Re-scan
        endpoints = scanner.scan_project(upload_path, extract_dir)
        
        # Update state
        state["endpoints"] = endpoints
        save_state(state, user_id)
        
        return {
            "message": "Project re-scanned successfully",
            "endpoints_found": len(endpoints),
            "endpoints_data": endpoints
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard-stats")
async def get_dashboard_stats(user_id: str = Depends(get_current_user_id)):
    """Get dashboard statistics from run history"""
    try:
        # Load run history from PERSISTENT storage
        persistent_user_storage = os.path.join("storage", "users", user_id)
        history_file = os.path.join(persistent_user_storage, "run_history.json")
        
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
async def get_history(user_id: str = Depends(get_current_user_id)):
    """Get test execution history"""
    try:
        # Load run history from PERSISTENT storage
        persistent_user_storage = os.path.join("storage", "users", user_id)
        history_file = os.path.join(persistent_user_storage, "run_history.json")
        
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

@app.post("/logout")
async def logout(user_id: str = Depends(get_current_user_id)):
    """Cleans up the user session on logout"""
    try:
        cleanup_user_session(user_id)
        return {"message": "Logged out and session cleaned up"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
