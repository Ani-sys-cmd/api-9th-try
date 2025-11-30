import os
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class SelfHealingAgent:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-pro')

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
            You are an AI Test Repair Agent.
            
            **Context:**
            A Python 'pytest' script failed during execution. Your job is to fix the test code 
            so it passes, assuming the API is working correctly (aligning the test to the actual API behavior).
            
            **The Failing Test Code:**
            {current_test_code}
            
            **The Execution Logs (Failure Details):**
            {failure_logs}
            
            **Instructions:**
            1. Analyze the assertion error (e.g., expected 201 but got 200, or JSON key missing).
            2. Rewrite the Python code to handle the actual response found in the logs.
            3. Return ONLY the full corrected Python code. No markdown formatting.
            """

            response = self.model.generate_content(prompt)
            fixed_code = response.text.strip()

            # Clean formatting if Gemini adds markdown
            if fixed_code.startswith("```python"):
                fixed_code = fixed_code.replace("```python", "", 1)
            if fixed_code.endswith("```"):
                fixed_code = fixed_code.replace("```", "", 1)

            # Overwrite the test file with the healed version
            with open(test_file_path, "w") as f:
                f.write(fixed_code)

            return {
                "status": "healed",
                "message": "Test script updated successfully based on execution logs.",
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
            3. Return the response in JSON format:
               {{
                 "explanation": "A brief explanation of why the crash happened.",
                 "fixed_code_snippet": "The corrected function or code block."
               }}
            """

            response = self.model.generate_content(prompt)
            cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
            
            # Return the analysis to the Frontend (we do NOT auto-patch user code for safety)
            return {
                "status": "diagnosed",
                "analysis": cleaned_response
            }

        except Exception as e:
            return {"status": "error", "message": f"Diagnosis failed: {str(e)}"}

# Example logic
if __name__ == "__main__":
    healer = SelfHealingAgent()
    print("Healer Agent initialized.")