import os
import shutil
import pytest
from fastapi.testclient import TestClient
from app.main import app, get_current_user_id, get_user_session_path

client = TestClient(app)

# Mock user IDs
USER_A = "user_a_123"
USER_B = "user_b_456"

def test_session_isolation():
    # 1. Simulate Upload for User A
    # We need to override the dependency for User A
    app.dependency_overrides[get_current_user_id] = lambda: USER_A
    
    # Create a dummy zip file
    with open("test_project_a.zip", "w") as f:
        f.write("dummy content")
        
    with open("test_project_a.zip", "rb") as f:
        response = client.post("/upload", files={"file": ("test_project_a.zip", f, "application/zip")})
    
    # Check if storage/sessions/user_a_123/uploads/test_project_a.zip exists
    user_a_path = get_user_session_path(USER_A)
    assert os.path.exists(os.path.join(user_a_path, "uploads", "test_project_a.zip"))
    
    # 2. Simulate Upload for User B
    app.dependency_overrides[get_current_user_id] = lambda: USER_B
    
    with open("test_project_b.zip", "w") as f:
        f.write("dummy content B")
        
    with open("test_project_b.zip", "rb") as f:
        response = client.post("/upload", files={"file": ("test_project_b.zip", f, "application/zip")})
        
    # Check if storage/sessions/user_b_456/uploads/test_project_b.zip exists
    user_b_path = get_user_session_path(USER_B)
    assert os.path.exists(os.path.join(user_b_path, "uploads", "test_project_b.zip"))
    
    # Verify User A's file is NOT in User B's folder
    assert not os.path.exists(os.path.join(user_b_path, "uploads", "test_project_a.zip"))
    
    # 3. Test Logout Cleanup for User A
    app.dependency_overrides[get_current_user_id] = lambda: USER_A
    response = client.post("/logout")
    assert response.status_code == 200
    
    # Verify User A's session folder is gone
    assert not os.path.exists(user_a_path)
    
    # Verify User B's session folder still exists
    assert os.path.exists(user_b_path)
    
    # Cleanup
    if os.path.exists("test_project_a.zip"): os.remove("test_project_a.zip")
    if os.path.exists("test_project_b.zip"): os.remove("test_project_b.zip")
    if os.path.exists(user_b_path): shutil.rmtree(user_b_path)

if __name__ == "__main__":
    # Manually run if pytest not available
    try:
        test_session_isolation()
        print("Test Passed: Session Isolation and Cleanup verified.")
    except AssertionError as e:
        print(f"Test Failed: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
