import os
import zipfile
import re
import shutil
from typing import List, Dict, Any

class ProjectScanner:
    def __init__(self):
        # Directories are now handled per-request
        pass

    def extract_zip(self, zip_path: str, extract_dir: str) -> str:
        """
        Extracts the uploaded zip file to the specified extraction directory.
        Returns the path to the extracted folder.
        """
        if not os.path.exists(zip_path):
            raise FileNotFoundError(f"Zip file not found: {zip_path}")
            
        project_name = os.path.basename(zip_path).replace(".zip", "")
        target_path = os.path.join(extract_dir, project_name)
        
        # Clean up if exists (though main.py handles this too, double safety)
        if os.path.exists(target_path):
            shutil.rmtree(target_path)
        os.makedirs(target_path, exist_ok=True)
            
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(target_path)
            
        return target_path

    def _is_backend_file(self, filename: str) -> bool:
        valid_extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.java']
        return any(filename.endswith(ext) for ext in valid_extensions)

    def analyze_file_static(self, file_content: str, filename: str) -> List[Dict[str, Any]]:
        """
        Uses Regex to parse the code and extract API endpoint metadata.
        """
        endpoints = []
        
        # Regex patterns for Express.js
        # Matches: app.get('/path', ...), router.post('/path', ...)
        pattern = re.compile(r'(app|router)\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]', re.IGNORECASE)
        
        matches = pattern.findall(file_content)
        
        for match in matches:
            _, method, path = match
            method = method.upper()
            
            endpoints.append({
                "path": path,
                "method": method,
                "description": f"Detected {method} endpoint at {path}",
                "payload_schema": {} 
            })
            
        # Regex for FastAPI/Flask (Python)
        # @app.get("/path") or @app.route("/path", methods=["GET"])
        python_pattern = re.compile(r'@app\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]', re.IGNORECASE)
        py_matches = python_pattern.findall(file_content)
        for match in py_matches:
            method, path = match
            method = method.upper()
            endpoints.append({
                "path": path,
                "method": method,
                "description": f"Detected {method} endpoint at {path}",
                "payload_schema": {}
            })

        return endpoints

    def scan_project(self, zip_file_path: str, extract_dir: str) -> List[Dict[str, Any]]:
        """
        Orchestrates the scanning process: extracts zip, walks files, detects endpoints.
        """
        print(f"[Scanner] Starting scan for {zip_file_path}...")
        
        try:
            extracted_path = self.extract_zip(zip_file_path, extract_dir)
        except Exception as e:
            print(f"[Scanner] Extraction failed: {e}")
            raise e

        all_endpoints = []
        files_scanned = 0
        
        for root, dirs, files in os.walk(extracted_path):
            # Skip node_modules and hidden dirs
            if 'node_modules' in root or '.git' in root:
                continue
                
            for file in files:
                if self._is_backend_file(file):
                    file_path = os.path.join(root, file)
                    # print(f"[Scanner] Visiting file: {file_path}")
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            
                        files_scanned += 1
                        endpoints = self.analyze_file_static(content, file)
                        
                        if endpoints:
                            # Tag the source file for debugging/healing later
                            for ep in endpoints:
                                ep['source_file'] = file_path
                            all_endpoints.extend(endpoints)
                            
                    except Exception as e:
                        print(f"[Scanner] Could not read {file}: {e}")

        print(f"[Scanner] Scan complete. Scanned {files_scanned} files. Found {len(all_endpoints)} total endpoints.")
        return all_endpoints

if __name__ == "__main__":
    # Create a dummy scanner to test
    scanner = ProjectScanner()
    print("Scanner initialized. Ready to be called by API.")