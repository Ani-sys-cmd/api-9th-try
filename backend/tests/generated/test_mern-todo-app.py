import pytest
import requests

# 1. Define a fixture for the base URL
@pytest.fixture
def base_url():
    """Provides the base URL for the API."""
    return "http://localhost:3000"

# 2. Write test functions for each endpoint

def test_forgot_password(base_url):
    """
    Tests the POST /forgotPassword endpoint.
    Assumes a 200 OK response for a successful request.
    A real-world test might need a payload like {'email': 'user@example.com'}.
    """
    # FIX: Removed '/api' prefix from the URL. The previous path resulted in a 404 Not Found error.
    url = f"{base_url}/forgotPassword"
    payload = {}
    response = requests.post(url, json=payload)
    assert response.status_code == 200
    # Add more assertions here, e.g., checking the response body
    # assert "instruction" in response.json()["message"]

def test_reset_password(base_url):
    """
    Tests the POST /resetPassword endpoint.
    Assumes a 200 OK response for a successful request.
    A real-world test would need a token and a new password.
    """
    # FIX: Removed '/api' prefix from the URL. The previous path resulted in a 404 Not Found error.
    url = f"{base_url}/resetPassword"
    payload = {}
    response = requests.post(url, json=payload)
    assert response.status_code == 200
    # assert response.json()["message"] == "Password has been reset successfully."

def test_add_task(base_url):
    """
    Tests the POST /addTask endpoint.
    Assumes a 200 OK or 201 Created for a successful request.
    A real-world test would provide task details in the payload.
    """
    # FIX: Removed '/api' prefix from the URL. The previous path resulted in a 404 Not Found error.
    url = f"{base_url}/addTask"
    # Example of a more realistic payload:
    # payload = {"title": "My New Task", "description": "Details about the task"}
    payload = {}
    response = requests.post(url, json=payload)
    assert response.status_code in [200, 201]
    # assert "id" in response.json()

def test_get_task(base_url):
    """
    Tests the GET /getTask endpoint.
    Assumes a 200 OK for a successful request.
    """
    url = f"{base_url}/getTask"
    response = requests.get(url)
    assert response.status_code == 200
    # A more robust test would check if the response body is a list
    # assert isinstance(response.json(), list)

def test_remove_task(base_url):
    """
    Tests the GET /removeTask endpoint.
    Note: Using GET to modify/delete data is not a standard REST practice.
    DELETE or POST would be more conventional.
    """
    url = f"{base_url}/removeTask"
    response = requests.get(url)
    assert response.status_code == 200
    # assert response.json()["message"] == "Task removed successfully."

def test_login(base_url):
    """
    Tests the POST /login endpoint.
    Assumes a 200 OK for a successful request.
    A real-world test would require credentials in the payload.
    """
    # FIX: Removed '/api' prefix from the URL. The previous path resulted in a 404 Not Found error.
    url = f"{base_url}/login"
    # Example of a more realistic payload:
    # payload = {"email": "user@example.com", "password": "securepassword123"}
    payload = {}
    response = requests.post(url, json=payload)
    assert response.status_code == 200
    # A more robust test would check for an auth token in the response
    # assert "token" in response.json()

def test_register(base_url):
    """
    Tests the POST /register endpoint.
    Assumes a 200 OK or 201 Created for a successful registration.
    A real-world test would require user details in the payload.
    """
    # FIX: Removed '/api' prefix from the URL. The previous path resulted in a 404 Not Found error.
    url = f"{base_url}/register"
    # Example of a more realistic payload:
    # payload = {"username": "newuser", "email": "new@example.com", "password": "password"}
    payload = {}
    response = requests.post(url, json=payload)
    assert response.status_code in [200, 201]
    # assert response.json()["message"] == "User registered successfully."

def test_get_user(base_url):
    """
    Tests the GET /getuser endpoint.
    Assumes a 200 OK for a successful request.
    """
    url = f"{base_url}/getuser"
    response = requests.get(url)
    assert response.status_code == 200
    # A more robust test would validate the user data in the response
    # assert "username" in response.json()
    # assert "email" in response.json()