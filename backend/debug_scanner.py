import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai
from app.agents.scanner import ProjectScanner

# Load env
load_dotenv()

# Read employees.js
file_path = r"c:\Users\Lenovo\Desktop\project-root\project-root\backend\storage\extracted\express-api\src\routes\employees.js"
with open(file_path, 'r') as f:
    content = f.read()

print(f"Read {len(content)} bytes from {file_path}")

scanner = ProjectScanner()

print("Analyzing file...")
try:
    endpoints = scanner.analyze_file_with_gemini(content, "employees.js")
    print(f"Endpoints found: {len(endpoints)}")
    print(endpoints)
except Exception as e:
    print(f"Error: {e}")
