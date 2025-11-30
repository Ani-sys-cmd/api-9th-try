import pytest
import requests
import json

# Define the base URL for the API as a fixture
@pytest.fixture
def base_url():
    """Provides the base URL for the API tests."""
    return "http://localhost:8000"

# Test for GET /status
def test_get_api_status(base_url):
    """
    Tests the GET /status endpoint.
    Verifies that the API returns a 200 OK status.
    """
    url = f"{base_url}/status"
    try:
        response = requests.get(url)
    except requests.exceptions.ConnectionError as e:
        pytest.fail(f"Connection to {url} failed. Please ensure the server is running. Error: {e}")
    
    # Assert that the request was successful
    assert response.status_code == 200
    
    # Assert that the response body is valid JSON and has expected content
    try:
        response_data = response.json()
        assert "status" in response_data
        assert response_data["status"] == "ok"
    except (json.JSONDecodeError, AssertionError) as e:
        pytest.fail(f"Response validation failed for GET /status: {e}")

# Test for POST /update-profile
def test_update_profile(base_url):
    """
    Tests the POST /update-profile endpoint with a direct data payload.
    Payload: {'data': {'username': 'string'}}
    """
    url = f"{base_url}/update-profile"
    payload = {
        'data': {
            'username': 'testuser'
        }
    }
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
    except requests.exceptions.ConnectionError as e:
        pytest.fail(f"Connection to {url} failed. Please ensure the server is running. Error: {e}")
    
    # Assert that the request was successful
    assert response.status_code == 200
    
    # Assert that the response confirms the update
    try:
        response_data = response.json()
        assert "message" in response_data
        assert "testuser" in response_data["message"]
    except (json.JSONDecodeError, AssertionError) as e:
        pytest.fail(f"Response validation failed for POST /update-profile: {e}")

# Test for GET /users
def test_get_users(base_url):
    """
    Tests the GET /users endpoint.
    Verifies it returns a 200 OK status and the body is a list.
    """
    url = f"{base_url}/users"
    try:
        response = requests.get(url)
    except requests.exceptions.ConnectionError as e:
        pytest.fail(f"Connection to {url} failed. Please ensure the server is running. Error: {e}")
    
    # Assert that the request was successful
    assert response.status_code == 200
    
    # Assert that the response is a list
    try:
        response_data = response.json()
        assert isinstance(response_data, list)
    except (json.JSONDecodeError, AssertionError):
        pytest.fail("Response body for GET /users is not a valid JSON list.")

# Test for POST /users
def test_add_user(base_url):
    """
    Tests the POST /users endpoint.
    Verifies that a new user can be created.
    """
    url = f"{base_url}/users"
    payload = {
        'name': 'Jane Doe',
        'email': 'jane.doe@example.com',
        'age': 28
    }
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
    except requests.exceptions.ConnectionError as e:
        pytest.fail(f"Connection to {url} failed. Please ensure the server is running. Error: {e}")
    
    # Assert that the resource was created successfully
    assert response.status_code == 201
    
    # Assert that the response contains the created user's data
    try:
        response_data = response.json()
        assert response_data['name'] == 'Jane Doe'
        assert response_data['email'] == 'jane.doe@example.com'
        assert 'id' in response_data # A created resource should have an ID
    except (json.JSONDecodeError, KeyError, AssertionError) as e:
        pytest.fail(f"Response validation failed for POST /users: {e}")