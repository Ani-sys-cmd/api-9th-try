import pytest
import requests

@pytest.fixture
def base_url():
    """Provides the base URL for the API."""
    return "http://localhost:5000"

def test_get_initial_status(base_url):
    """
    Tests Endpoint 1: GET /api/status.
    It checks for a successful response and valid JSON content.
    """
    url = f"{base_url}/api/status"
    try:
        response = requests.get(url)
        # Assert that the request was successful (HTTP 200 OK)
        assert response.status_code == 200
        # Assert that the response content type is JSON
        assert 'application/json' in response.headers['Content-Type']
        # Assert that the JSON response is a dictionary
        assert isinstance(response.json(), dict)
    except requests.exceptions.ConnectionError as e:
        pytest.fail(f"Connection to {base_url} failed. Is the server running? Error: {e}")


def test_update_profile_lowercase_and_verify(base_url):
    """
    Tests Endpoint 2 (POST /api/update-profile) and Endpoint 3 (GET /api/status).
    It first updates the profile with a lowercase username and then verifies
    the change by calling the status endpoint.
    """
    # --- Endpoint 2: POST /api/update-profile ---
    update_url = f"{base_url}/api/update-profile"
    new_username = "string"
    payload = {
        'body': {
            'data': {
                'username': new_username
            }
        }
    }
    
    try:
        update_response = requests.post(update_url, json=payload)
    except requests.exceptions.ConnectionError as e:
        pytest.fail(f"Connection to {update_url} failed. Is the server running? Error: {e}")

    # Assert that the update request was successful
    assert update_response.status_code == 200
    
    # Assumption: The API returns a JSON response confirming the update.
    update_data = update_response.json()
    assert update_data.get('message') == 'Profile updated successfully'
    assert update_data.get('username') == new_username

    # --- Endpoint 3: GET /api/status (Verification) ---
    status_url = f"{base_url}/api/status"
    status_response = requests.get(status_url)
    
    # Assert that the verification request was successful
    assert status_response.status_code == 200
    
    # Assumption: The status endpoint now reflects the updated username.
    status_data = status_response.json()
    assert status_data.get('username') == new_username


def test_update_profile_uppercase_and_verify(base_url):
    """
    Tests Endpoint 4 (POST /api/update-profile) and a subsequent GET /api/status.
    It updates the profile with a different, capitalized username and then
    verifies the change.
    """
    # --- Endpoint 4: POST /api/update-profile ---
    update_url = f"{base_url}/api/update-profile"
    new_username = "String"
    payload = {
        'body': {
            'data': {
                'username': new_username
            }
        }
    }

    try:
        update_response = requests.post(update_url, json=payload)
    except requests.exceptions.ConnectionError as e:
        pytest.fail(f"Connection to {update_url} failed. Is the server running? Error: {e}")
        
    # Assert that the update request was successful
    assert update_response.status_code == 200
    
    # Assumption: The API returns a JSON response confirming the update.
    update_data = update_response.json()
    assert update_data.get('message') == 'Profile updated successfully'
    assert update_data.get('username') == new_username
    
    # --- Verification Step using GET /api/status ---
    status_url = f"{base_url}/api/status"
    status_response = requests.get(status_url)
    
    # Assert that the verification request was successful
    assert status_response.status_code == 200
    
    # Assumption: The status endpoint now reflects the newly updated username.
    status_data = status_response.json()
    assert status_data.get('username') == new_username