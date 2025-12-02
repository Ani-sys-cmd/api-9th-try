import os
import json
from typing import Dict, Any
from dotenv import load_dotenv
from .llm_client import GeminiClient

# Load environment variables
load_dotenv()

class SelfHealingAgent:
    def __init__(self):
        self.client = GeminiClient()

    def heal_test_case(self, test_file_path: str, failure_logs: str) -> Dict[str, Any]:
        """
        Scenario A: The Test is Broken (False Positive).
        Reads the failing test file and the error logs, then asks Gemini to rewrite 
        the test code to match the actual API behavior.
        """
        print(f"Attempting to heal test file: {test_file_path}")

        try:
            with open(test_file_path, "r") as f:
                current_test_code = f.read()

            # Prompt for the Healer Agent
            prompt = f"""
            You are an Expert Python Test Engineer and Pytest Specialist.
            
            **Objective:**
            Fix the provided 'pytest' script so that ALL tests pass. The API implementation is considered the "Source of Truth" — if the test expects 200 but gets 201, CHANGE THE TEST to expect 201.
            
            **Input Data:**
            1. **Failing Test Code:**
            ```python
            {current_test_code}
            ```
            
            2. **Failure Report (JSON):**
            {failure_logs}
            
            **Critical Instructions:**
            1. **Analyze EVERY Failure:** Read the JSON report carefully. It lists every failed test function (`nodeid`), the error message, and the traceback.
            2. **Fix ALL Issues:** You must fix EVERY failure listed. Do not skip any. If 5 tests failed, 5 tests must be modified.
            3. **Adapt to Reality:** 
               - If the API returns a different status code (e.g., 422 instead of 400), update the assertion to match the reality.
               - If the API returns different JSON keys, update the test to check for the keys that actually exist.
               - If the API requires specific headers or payload formats that are missing, add them.
            4. **Preserve Structure:** Keep the existing imports and helper functions unless they are the cause of the error. Do not delete working tests.
            5. **Output Format:** Return ONLY the complete, valid, executable Python code. Do not include markdown blocks (```python ... ```) or explanations. Just the code.
            
            **Thinking Process (Internal):**
            - Identify which test function corresponds to `nodeid`.
            - Look at the `message` to understand *why* it failed.
            - Determine the necessary code change (e.g., `assert response.status_code == 200` -> `assert response.status_code == 201`).
            - Apply this logic to ALL failures.
            - Generate the final code.
            """

            # Use centralized client
            fixed_code = self.client.generate_content(prompt).strip()

            # Clean formatting if Gemini adds markdown
            if fixed_code.startswith("```python"):
                fixed_code = fixed_code.replace("```python", "", 1)
            if fixed_code.startswith("```"):
                fixed_code = fixed_code.replace("```", "", 1)
            if fixed_code.endswith("```"):
                fixed_code = fixed_code.replace("```", "", 1) # Only replace the last one
            
            # Extra cleanup for trailing backticks if the replace above missed (e.g. whitespace)
            fixed_code = fixed_code.strip("`").strip()

            # Overwrite the test file with the healed version
            with open(test_file_path, "w") as f:
                f.write(fixed_code)

            return {
                "status": "healed",
                "message": "Test script updated. All reported failures have been addressed.",
                "fixed_code": fixed_code
            }

        except Exception as e:
            return {"status": "error", "message": f"Healing failed: {str(e)}"}

    def diagnose_backend_bug(self, source_file_path: str, error_logs: str) -> Dict[str, Any]:
        """
        Scenario B: The Code is Broken (True Bug/500 Error).
        Reads the user's MERN (Node.js) source code and the stack trace, 
        then generates a fix explanation and code snippet.
        """
        print(f"Diagnosing backend bug in: {source_file_path}")

        try:
            if not os.path.exists(source_file_path):
                return {"status": "error", "message": "Source file not found locally."}

            with open(source_file_path, "r") as f:
                source_code = f.read()

            # Prompt for the Diagnosis Agent
            prompt = f"""
            You are a Senior Backend Developer.
            
            **Context:**
            An API endpoint crashed with a 500 Internal Server Error during testing.
            
            **The Backend Code (Node.js/Express):**
            {source_code}
            
            **The Error Logs/Stack Trace:**
            {error_logs}
            
            **Instructions:**
            1. Identify the root cause of the crash (e.g., undefined variable, unhandled promise, invalid database query).
            2. Provide a 'Suggested Fix' that corrects the code.
            3. Return the response in JSON format with the following keys:
               - explanation: A brief explanation of why the crash happened.
               - recommendation: A recommendation on how to fix it or prevent it.
               - solution: The corrected function or code block.
               
            Example JSON format:
            {{
              "explanation": "...",
              "recommendation": "...",
              "solution": "..."
            }}
            """

            # Use centralized client
            cleaned_response = self.client.generate_content(prompt).strip()
            
            # Remove markdown formatting if present
            if cleaned_response.startswith("```json"):
                cleaned_response = cleaned_response.replace("```json", "", 1)
            if cleaned_response.startswith("```"):
                 cleaned_response = cleaned_response.replace("```", "", 1)
            if cleaned_response.endswith("```"):
                cleaned_response = cleaned_response.replace("```", "", 1)
            
            cleaned_response = cleaned_response.strip()
            
            try:
                analysis_json = json.loads(cleaned_response)
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                analysis_json = {
                    "explanation": cleaned_response,
                    "recommendation": "Could not parse recommendation.",
                    "solution": "Could not parse solution."
                }
            
            # Return the analysis to the Frontend (we do NOT auto-patch user code for safety)
            return {
                "status": "diagnosed",
                "analysis": analysis_json
            }

        except Exception as e:
            return {"status": "error", "message": f"Diagnosis failed: {str(e)}"}

# Example logic
if __name__ == "__main__":
    healer = SelfHealingAgent()
    print("Healer Agent initialized.")