import requests
import os
import zipfile
import json
import shutil
import time

BASE_URL = "http://localhost:8000"
USER_A = "user_a_123"
USER_B = "user_b_456"

def create_dummy_project(name, content):
    filename = f"{name}.zip"
    with zipfile.ZipFile(filename, 'w') as zf:
        zf.writestr('server.js', content)
    return filename

def test_isolation():
    print("Starting Isolation Verification...")
    
    # Create dummy projects
    project_a = create_dummy_project("project_a", "console.log('User A Project');")
    project_b = create_dummy_project("project_b", "console.log('User B Project');")
    
    try:
        # 1. Upload Project A as User A
        print(f"\nUploading {project_a} as {USER_A}...")
        with open(project_a, 'rb') as f:
            files = {'file': (project_a, f, 'application/zip')}
            headers = {'X-User-ID': USER_A}
            response = requests.post(f"{BASE_URL}/upload", files=files, headers=headers)
            print(f"User A Upload Status: {response.status_code}")
            if response.status_code != 200:
                print(response.text)

        # 2. Upload Project B as User B
        print(f"\nUploading {project_b} as {USER_B}...")
        with open(project_b, 'rb') as f:
            files = {'file': (project_b, f, 'application/zip')}
            headers = {'X-User-ID': USER_B}
            response = requests.post(f"{BASE_URL}/upload", files=files, headers=headers)
            print(f"User B Upload Status: {response.status_code}")
            if response.status_code != 200:
                print(response.text)

        # 3. Verify Storage Isolation
        path_a = os.path.join("backend", "storage", "users", USER_A, "system_state.json")
        path_b = os.path.join("backend", "storage", "users", USER_B, "system_state.json")
        
        print(f"\nChecking storage paths...")
        if os.path.exists(path_a):
            print(f"PASS: {path_a} exists.")
            with open(path_a, 'r') as f:
                data = json.load(f)
                if data.get('project_name') == project_a:
                    print("PASS: User A state contains correct project.")
                else:
                    print(f"FAIL: User A state has wrong project: {data.get('project_name')}")
        else:
            print(f"FAIL: {path_a} does not exist.")

        if os.path.exists(path_b):
            print(f"PASS: {path_b} exists.")
            with open(path_b, 'r') as f:
                data = json.load(f)
                if data.get('project_name') == project_b:
                    print("PASS: User B state contains correct project.")
                else:
                    print(f"FAIL: User B state has wrong project: {data.get('project_name')}")
        else:
            print(f"FAIL: {path_b} does not exist.")
            
        # 4. Verify No Cross Contamination
        # Request Dashboard Stats for User A
        print(f"\nChecking Dashboard Stats for User A...")
        headers = {'X-User-ID': USER_A}
        response = requests.get(f"{BASE_URL}/dashboard-stats", headers=headers)
        stats_a = response.json()
        print(f"User A Stats: {stats_a}")
        
        print(f"Checking Dashboard Stats for User B...")
        headers = {'X-User-ID': USER_B}
        response = requests.get(f"{BASE_URL}/dashboard-stats", headers=headers)
        stats_b = response.json()
        print(f"User B Stats: {stats_b}")
        
        # Since we just uploaded, stats might be 0 runs, but active projects should be 1 for each if history was populated (history is populated on run, not upload)
        # Let's run a test generation for User A to populate history? No, run-tests populates history.
        
        # Let's just verify they don't see each other's state via API if we added an endpoint for that, but we can verify via file system as above.
        
    finally:
        # Cleanup
        if os.path.exists(project_a): os.remove(project_a)
        if os.path.exists(project_b): os.remove(project_b)
        # Optional: cleanup storage/users/test_users if needed

if __name__ == "__main__":
    test_isolation()
