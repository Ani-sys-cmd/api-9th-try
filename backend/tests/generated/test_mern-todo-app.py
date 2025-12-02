import pytest
import requests

# 1. Define a fixture for the base URL
@pytest.fixture
def base_url():
    """
    Provides the base URL for the API.
    The original port 5000 caused a ConnectionRefusedError. MERN stack
    backends often run on a different port like 3001.
    """
    return "http://localhost:3001"

# 2. Write test functions for each endpoint

def test_forgot_password_empty_payload(base_url):
    """
    Tests the POST /forgotPassword endpoint with an empty payload.
    It's expected to fail with a client error (e.g., 400) as an email is likely required.
    """
    url = f"{base_url}/forgotPassword"
    payload = {}
    response = requests.post(url, json=payload)
    
    # Assuming the server requires data and will return a 400 Bad Request
    expected_status_code = 400
    assert response.status_code == expected_status_code, \
        f"Expected {expected_status_code} but got {response.status_code}. Response: {response.text}"

def test_reset_password_empty_payload(base_url):
    """
    Tests the POST /resetPassword endpoint with an empty payload.
    It's expected to fail as a token and new password are likely required.
    """
    url = f"{base_url}/resetPassword"
    payload = {}
    response = requests.post(url, json=payload)
    
    # Assuming the server requires data and will return a 400 Bad Request
    expected_status_code = 400
    assert response.status_code == expected_status_code, \
        f"Expected {expected_status_code} but got {response.status_code}. Response: {response.text}"

def test_add_task_empty_payload(base_url):
    """
    Tests the POST /addTask endpoint with an empty payload.
    It's expected to fail as task data and likely auth are required.
    """
    url = f"{base_url}/addTask"
    payload = {}
    response = requests.post(url, json=payload)
    
    # Assuming the server requires data and will return a 400 or 401. 400 is a safe bet for missing data.
    expected_status_code = 400
    assert response.status_code == expected_status_code, \
        f"Expected {expected_status_code} but got {response.status_code}. Response: {response.text}"

def test_get_task_no_params(base_url):
    """
    Tests the GET /getTask endpoint without any parameters.
    It's expected to fail if a task ID or user context is required.
    """
    url = f"{base_url}/getTask"
    response = requests.get(url)
    
    # A route like /getTask/<id> is common. A request to the base /getTask would likely be Not Found.
    expected_status_code = 404
    assert response.status_code == expected_status_code, \
        f"Expected {expected_status_code} but got {response.status_code}. Response: {response.text}"

def test_remove_task_no_params(base_url):
    """
    Tests the DELETE /removeTask endpoint without any parameters.
    It's expected to fail as a task ID is likely required.
    """
    url = f"{base_url}/removeTask"
    # Corrected method from GET to DELETE for a removal operation.
    response = requests.delete(url)
    
    # Assuming the server requires a task identifier in the path, the base endpoint would not be found.
    expected_status_code = 404
    assert response.status_code == expected_status_code, \
        f"Expected {expected_status_code} but got {response.status_code}. Response: {response.text}"

def test_login_empty_payload(base_url):
    """
    Tests the POST /login endpoint with an empty payload.
    It's expected to fail as credentials are required.
    """
    url = f"{base_url}/login"
    payload = {}
    response = requests.post(url, json=payload)
    
    # Assuming the server requires credentials and will return a 400 Bad Request.
    expected_status_code = 400
    assert response.status_code == expected_status_code, \
        f"Expected {expected_status_code} but got {response.status_code}. Response: {response.text}"

def test_register_empty_payload(base_url):
    """
    Tests the POST /register endpoint with an empty payload.
    It's expected to fail as user information is required.
    """
    url = f"{base_url}/register"
    payload = {}
    response = requests.post(url, json=payload)
    
    # Assuming the server requires user data and will return a 400 Bad Request.
    expected_status_code = 400
    assert response.status_code == expected_status_code, \
        f"Expected {expected_status_code} but got {response.status_code}. Response: {response.text}"

def test_get_user_unauthorized(base_url):
    """
    Tests the GET /getuser endpoint without authentication.
    It's expected to fail with an authorization error.
    """
    url = f"{base_url}/getuser"
    response = requests.get(url)
    
    # Assuming this is a protected route and will return 401 Unauthorized.
    expected_status_code = 401
    assert response.status_code == expected_status_code, \
        f"Expected {expected_status_code} but got {response.status_code}. Response: {response.text}"