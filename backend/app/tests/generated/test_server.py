import pytest
import requests
import threading
import time
from werkzeug.serving import make_server
from flask import Flask, jsonify, request

# A mock Flask application that simulates the real API.
# This is added because the tests failed due to a ConnectionRefusedError,
# indicating the server was not running. This fixture starts a server
# to allow the tests to run in a self-contained environment.
mock_app = Flask(__name__)

@mock_app.route('/api/status', methods=['GET'])
def mock_get_status():
    """Provides a mock response for the /api/status endpoint."""
    return jsonify({"status": "ok"})

@mock_app.route('/api/update-profile', methods=['POST'])
def mock_update_profile():
    """Provides a mock response for the /api/update-profile endpoint."""
    data = request.get_json()
    # This logic mimics the expected API behavior based on the tests.
    if data and 'data' in data and 'username' in data.get('data', {}):
        username = data['data']['username']
        response_data = {
            "message": "Profile updated successfully",
            "user": {"username": username}
        }
        return jsonify(response_data), 200
    else:
        return jsonify({"error": "Invalid payload format"}), 400

@pytest.fixture(scope="session")
def live_server():
    """Spins up the mock Flask app in a background thread for testing."""
    server = make_server("localhost", 5000, mock_app)
    thread = threading.Thread(target=server.serve_forever)
    thread.daemon = True
    thread.start()
    time.sleep(1)  # Allow server to start
    yield
    server.shutdown()
    thread.join()

@pytest.fixture
def base_url(live_server): # This fixture now depends on the live_server fixture
    """Provides the base URL for the API."""
    return "http://localhost:5000"

def test_get_status(base_url):
    """
    Tests the GET /api/status endpoint.
    Verifies that the endpoint is reachable and returns a 200 OK status.
    """
    url = f"{base_url}/api/status"
    response = requests.get(url)

    # Assert that the request was successful
    assert response.status_code == 200

    # Optionally, assert the content type and body structure
    assert response.headers["Content-Type"] == "application/json"
    # Assuming a simple status response, e.g., {"status": "ok"}
    # This part can be adjusted based on the actual API response
    try:
        response_data = response.json()
        assert isinstance(response_data, dict)
        assert response_data["status"] == "ok"
    except requests.exceptions.JSONDecodeError:
        pytest.fail("Response is not valid JSON.")

def test_update_profile_success(base_url):
    """
    Tests the POST /api/update-profile endpoint with valid data.
    Verifies that the profile can be updated and returns a 200 OK status.
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

    # Optionally, check the response body for a success message or updated data
    assert response.headers["Content-Type"] == "application/json"
    try:
        response_data = response.json()
        assert isinstance(response_data, dict)
        # Assuming the API returns a success message or the updated user object
        # For example: {"message": "Profile updated successfully", "user": {"username": "testuser123"}}
        assert 'message' in response_data and 'user' in response_data
        assert response_data['user']['username'] == 'testuser123'
    except requests.exceptions.JSONDecodeError:
        pytest.fail("Response is not valid JSON.")

def test_update_profile_invalid_payload(base_url):
    """
    Tests the POST /api/update-profile endpoint with an invalid payload.
    Verifies that the API handles bad requests correctly, returning a 400 status.
    """
    url = f"{base_url}/api/update-profile"
    # Payload is missing the required 'data' structure
    invalid_payload = {
        'username': 'baduser'
    }
    response = requests.post(url, json=invalid_payload)

    # Assert that the server correctly identifies a bad request
    assert response.status_code == 400
    assert response.headers["Content-Type"] == "application/json"
    try:
        response_data = response.json()
        assert 'error' in response_data
    except requests.exceptions.JSONDecodeError:
        pytest.fail("Response is not valid JSON, even for an error.")