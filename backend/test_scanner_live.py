import os
import zipfile
import json
from app.agents.scanner import ProjectScanner

# 1. Create a dummy server.js
dummy_code = """
const express = require('express');
const app = express();

// GET /api/users
app.get('/api/users', (req, res) => {
    res.json([{id: 1, name: 'John'}]);
});

// POST /api/users
app.post('/api/users', (req, res) => {
    res.status(201).send('Created');
});

app.listen(3000);
"""

os.makedirs("temp_test", exist_ok=True)
with open("temp_test/server.js", "w") as f:
    f.write(dummy_code)

# 2. Zip it
zip_path = "temp_test/project.zip"
with zipfile.ZipFile(zip_path, 'w') as zipf:
    zipf.write("temp_test/server.js", arcname="server.js")

print(f"Created dummy project at {zip_path}")

# 3. Run Scanner
import sys

# Redirect output to file
sys.stdout = open("scanner_debug.log", "w")
sys.stderr = sys.stdout

print("Initializing Scanner...")
scanner = ProjectScanner(upload_dir="temp_test/uploads", extract_dir="temp_test/extracted")

print("Scanning project...")
try:
    endpoints = scanner.scan_project(zip_path)
    print(f"Scan complete. Found {len(endpoints)} endpoints.")
    print(json.dumps(endpoints, indent=2))
except Exception as e:
    print(f"Scan failed: {e}")
    
sys.stdout.close()
