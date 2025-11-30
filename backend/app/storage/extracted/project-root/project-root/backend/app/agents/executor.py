import subprocess
import os
import re
from typing import Dict, Any

class TestExecutor:
    def __init__(self):
        self.results_dir = "storage/results"
        os.makedirs(self.results_dir, exist_ok=True)

    def _parse_pytest_output(self, output: str) -> Dict[str, int]:
        summary = {"passed": 0, "failed": 0, "error": 0, "total": 0}
        
        # 1. Check for Syntax Errors or Collection Failures first
        if "SyntaxError" in output or "collected 0 items" in output or "ModuleNotFoundError" in output:
            summary["error"] = 1 # Flag this as a system error
            return summary

        # 2. Standard Regex for Pytest summary
        # Matches: "2 passed, 1 failed, 1 error in 0.12s"
        match = re.search(r'(\d+)\s+passed', output)
        if match: summary["passed"] = int(match.group(1))
        
        match = re.search(r'(\d+)\s+failed', output)
        if match: summary["failed"] = int(match.group(1))
        
        match = re.search(r'(\d+)\s+error', output)
        if match: summary["error"] = int(match.group(1))
        
        summary["total"] = summary["passed"] + summary["failed"] + summary["error"]
        return summary

    def _calculate_reward(self, summary: Dict[str, int], logs: str) -> float:
        reward = 0.0
        if summary["error"] > 0:
            return -10.0 # Heavy penalty if tests didn't even run
        reward += (summary["passed"] * 1.0)
        if "500 Internal Server Error" in logs:
            reward += 10.0
        reward -= (summary["failed"] * 5.0)
        return reward

    def run_test_suite(self, test_file_path: str) -> Dict[str, Any]:
        print(f"Executing tests in: {test_file_path}")
        
        if not os.path.exists(test_file_path):
            return {
                "status": "error", 
                "message": "Test file not found", 
                "summary": {"passed":0, "failed":0, "error":1},
                "logs": "File does not exist."
            }

        try:
            # Run pytest
            result = subprocess.run(
                ["pytest", test_file_path, "-v", "-rP"],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            logs = result.stdout + result.stderr
            summary = self._parse_pytest_output(logs)
            reward = self._calculate_reward(summary, logs)
            
            # If we have 0 total but logs exist, it's likely a collection error we missed
            if summary["total"] == 0 and len(logs) > 0:
                summary["error"] = 1
                reward = -5.0

            return {
                "status": "success" if result.returncode == 0 else "failure",
                "summary": summary,
                "reward": reward,
                "logs": logs, # SEND RAW LOGS TO FRONTEND
                "test_file": test_file_path
            }

        except Exception as e:
            return {"status": "error", "message": str(e), "reward": 0.0, "logs": str(e)}