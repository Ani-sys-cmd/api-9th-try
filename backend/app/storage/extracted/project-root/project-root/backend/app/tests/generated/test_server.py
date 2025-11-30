import pytest
import requests

# 1. Define a fixture for the base URL
@pytest.fixture
def base_url():
    """Provides the base URL for the API."""
    return "http://localhost:5000"

# 2. Write test functions for each endpoint

def test_get_status(base_url):
    """
    Tests the GET /api/status endpoint.
    Verifies that the API returns a 200 OK status.
    """
    # Construct the full URL
    url = f"{base_url}/api/status"
    
    # Make the GET request
    response = requests.get(url)
    
    # Assert that the status code is 200 (OK)
    assert response.status_code == 200
    
    # Optional: Assert the response body contains expected data
    response_json = response.json()
    assert "status" in response_json
    assert response_json["status"] == "online"


def test_update_profile_success(base_url):
    """
    Tests the POST /api/update-profile endpoint with a valid payload.
    Verifies that the profile can be updated successfully.
    """
    # Construct the full URL
    url = f"{base_url}/api/update-profile"
    
    # Define the valid payload
    payload = {
        'data': {
            'username': 'pytest_user'
        }
    }
    
    # Make the POST request with the JSON payload
    response = requests.post(url, json=payload)
    
    # Assert that the status code is 200 (OK)
    assert response.status_code == 200
    
    # Optional: Assert the response confirms the update
    response_json = response.json()
    assert "message" in response_json
    assert response_json["message"] == "Profile updated for pytest_user"
    assert "user" in response_json
    assert response_json["user"]["username"] == "pytest_user"


def test_update_profile_invalid_payload(base_url):
    """
    Tests the POST /api/update-profile endpoint with an invalid payload.
    Verifies that the API handles bad requests correctly.
    """
    # Construct the full URL
    url = f"{base_url}/api/update-profile"
    
    # Define an invalid payload (missing the 'data' key)
    invalid_payload = {
        'username': 'invalid_user'
    }
    
    # Make the POST request
    response = requests.post(url, json=invalid_payload)
    
    # Assert that the status code is 500 (Internal Server Error) based on logs
    assert response.status_code == 500
    
    # Optional: Assert the error message in the response
    # The logs did not specify the body, so we check only for the presence of an error key.
    response_json = response.json()
    assert "error" in response_json


def test_update_profile_empty_username(base_url):
    """
    Tests the POST /api/update-profile endpoint with an empty username.
    Verifies that the API handles invalid data correctly.
    """
    # Construct the full URL
    url = f"{base_url}/api/update-profile"
    
    # Define a payload with an empty username string
    payload = {
        'data': {
            'username': ''
        }
    }
    
    # Make the POST request
    response = requests.post(url, json=payload)
    
    # Assert that the status code is 200 (OK) as per logs, indicating success
    assert response.status_code == 200
    
    # Optional: Assert the specific success message, as the API accepts this
    response_json = response.json()
    assert "message" in response_json
    assert response_json["message"] == "Profile updated for "
    assert "user" in response_json
    assert response_json["user"]["username"] == ""