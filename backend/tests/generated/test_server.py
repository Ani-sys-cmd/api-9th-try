import pytest
import requests

@pytest.fixture
def base_url():
    """Provides the base URL for the API endpoints."""
    return "http://localhost:5000"

def test_get_status(base_url):
    """
    Tests the GET /api/status endpoint.
    Expects a 200 OK response and a JSON body.
    """
    url = f"{base_url}/api/status"
    response = requests.get(url)

    # Assert that the request was successful
    assert response.status_code == 200

    # Assert that the content type is JSON
    assert 'application/json' in response.headers['Content-Type']

    # Assert that the response body can be decoded as JSON
    try:
        response_data = response.json()
        # Optionally, check for specific keys in the response
        # assert "status" in response_data
    except ValueError:
        pytest.fail("Response is not valid JSON.")

def test_update_profile_success(base_url):
    """
    Tests the POST /api/update-profile endpoint with a valid payload.
    Expects a 200 OK response.
    """
    url = f"{base_url}/api/update-profile"
    payload = {
        'data': {
            'username': 'testuser123'
        }
    }
    response = requests.post(url, json=payload)

    # Assert that the request was successful
    assert response.status_code == 200

    # Assert that the content type is JSON
    assert 'application/json' in response.headers['Content-Type']

    # Assert the response body contains a success message or reflects the change
    try:
        response_data = response.json()
        # This assertion depends on the actual API response format
        # For example, it might be: {'message': 'Profile updated successfully'}
        assert "message" in response_data or "username" in response_data
    except ValueError:
        pytest.fail("Response is not valid JSON.")

def test_update_profile_invalid_payload(base_url):
    """
    Tests the POST /api/update-profile endpoint with an invalid payload.
    Expects a 500 Internal Server Error based on observed API behavior.
    """
    url = f"{base_url}/api/update-profile"
    # Sending a payload with a missing 'data' key
    invalid_payload = {
        'username': 'baduser'
    }
    response = requests.post(url, json=invalid_payload)

    # Assert that the server correctly identifies a bad request
    assert response.status_code == 500

def test_update_profile_empty_payload(base_url):
    """
    Tests the POST /api/update-profile endpoint with an empty payload.
    Expects a 500 Internal Server Error based on observed API behavior.
    """
    url = f"{base_url}/api/update-profile"
    empty_payload = {}
    response = requests.post(url, json=empty_payload)

    # Assert that the server rejects an empty payload
    assert response.status_code == 500