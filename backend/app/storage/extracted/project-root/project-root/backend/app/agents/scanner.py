import os
import zipfile
import json
import google.generativeai as genai
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables (Ensure GEMINI_API_KEY is in your .env file)
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class ProjectScanner:
    def __init__(self, upload_dir: str = "storage/uploads", extract_dir: str = "storage/extracted"):
        self.upload_dir = upload_dir
        self.extract_dir = extract_dir
        
        # Create directories if they don't exist
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.extract_dir, exist_ok=True)

        # We use a lightweight model for scanning to be fast and cost-effective
        self.model = genai.GenerativeModel('gemini-2.5-pro')

    def extract_zip(self, zip_path: str) -> str:
        """
        Unzips the uploaded project file.
        """
        project_name = os.path.splitext(os.path.basename(zip_path))[0]
        target_path = os.path.join(self.extract_dir, project_name)
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(target_path)
            
        return target_path

    def _is_backend_file(self, file_content: str, filename: str) -> bool:
        """
        Heuristic check: Does this file look like an Express/Node route file?
        """
        if not (filename.endswith('.js') or filename.endswith('.ts')):
            return False
            
        keywords = ['express', 'router', 'app.get', 'app.post', 'app.put', 'app.delete', 'module.exports']
        return any(keyword in file_content for keyword in keywords)

    def analyze_file_with_gemini(self, file_content: str, filename: str) -> List[Dict[str, Any]]:
        """
        Uses Gemini (Retriever Agent) to parse the code and extract API endpoint metadata.
        """
        prompt = f"""
        You are a Senior Backend Developer and QA Automation Engineer.
        Analyze the following Node.js/Express code file ({filename}).
        
        Identify all API endpoints defined in this file.
        Return ONLY a valid JSON array. Do not include markdown formatting like ```json.
        
        For each endpoint, provide:
        1. "path": The URL path (e.g., "/api/users"). If the file is a router, infer the full path if possible, or note it is relative.
        2. "method": GET, POST, PUT, DELETE, etc.
        3. "description": A short summary of what it does based on code comments or logic.
        4. "payload_schema": A JSON object describing the expected body/query parameters (keys and data types) required to test this successfully.
        
        If no endpoints are found, return an empty array [].

        Code Content:
        {file_content[:15000]} 
        """
        # Note: Slicing content to 15k chars to fit context window if files are huge, 
        # though Gemini 1.5 handles large context well.

        try:
            response = self.model.generate_content(prompt)
            # Clean response to ensure it's pure JSON
            cleaned_text = response.text.strip().replace("```json", "").replace("```", "")
            return json.loads(cleaned_text)
        except Exception as e:
            print(f"Error parsing file {filename} with Gemini: {e}")
            return []

    def scan_project(self, zip_file_path: str) -> List[Dict[str, Any]]:
        """
        Orchestrator: Unzips, finds files, and aggregates endpoints.
        """
        print(f"Scanning project: {zip_file_path}")
        extracted_path = self.extract_zip(zip_file_path)
        
        all_endpoints = []

        # Walk through the directory
        for root, _, files in os.walk(extracted_path):
            # Skip node_modules to save time and tokens
            if 'node_modules' in root:
                continue
                
            for file in files:
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                    if self._is_backend_file(content, file):
                        print(f"analyzing potential API file: {file}")
                        endpoints = self.analyze_file_with_gemini(content, file)
                        if endpoints:
                            # Tag the source file for debugging/healing later
                            for ep in endpoints:
                                ep['source_file'] = file_path
                            all_endpoints.extend(endpoints)
                            
                except Exception as e:
                    print(f"Could not read {file}: {e}")

        return all_endpoints

# Example usage for testing logic independently
if __name__ == "__main__":
    # Create a dummy scanner to test
    scanner = ProjectScanner()
    print("Scanner initialized. Ready to be called by API.")