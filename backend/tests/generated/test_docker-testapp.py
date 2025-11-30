import pytest
import requests
import json
import time

# How many times to retry connecting to the API
MAX_RETRIES = 20
# How long to wait between retries
RETRY_DELAY = 1  # in seconds

# Define the base URL for the API as a session-scoped fixture
@pytest.fixture(scope="session")
def base_url():
    """Provides the base URL for the API tests."""
    return "http://localhost:5000"

@pytest.fixture(scope="session", autouse=True)
def wait_for_api(base_url):
    """
    Waits for the API server to be ready before running tests.
    This fixture will run once per session and poll the API until it's available.
    """
    for i in range(MAX_RETRIES):
        try:
            # Attempt to connect to a known endpoint. We don't need a successful status code,
            # just the absence of a ConnectionError.
            requests.get(base_url, timeout=1)
            # If the request succeeds, the API is up.
            return
        except requests.ConnectionError:
            time.sleep(RETRY_DELAY)
    
    pytest.fail(f"API at {base_url} was not available after {MAX_RETRIES * RETRY_DELAY} seconds.")

# Test for Endpoint 1: GET /getUsers
def test_get_users_status_code_and_content(base_url):
    """
    Tests the GET /getUsers endpoint.
    - Asserts the status code is 200 OK.
    - Asserts the response content type is 'application/json'.
    - Asserts the response body is a list.
    """
    response = requests.get(f"{base_url}/getUsers")
    
    # Assert status code is 200 (OK)
    assert response.status_code == 200
    
    # Assert content type is JSON
    assert 'application/json' in response.headers['Content-Type']
    
    # Assert the response body is a list (as it should contain a list of users)
    assert isinstance(response.json(), list)

# Test for Endpoint 2: POST /addUser
def test_add_user_success(base_url):
    """
    Tests the POST /addUser endpoint with a valid payload.
    - Asserts the status code is 201 (Created).
    - Asserts the response contains the data of the created user.
    """
    # Define a unique user payload to avoid conflicts
    unique_email = f"testuser_{int(time.time())}@example.com"
    payload = {
        'name': 'Test User',
        'email': unique_email,
        'age': 30
    }
    
    response = requests.post(f"{base_url}/addUser", json=payload)
    
    # Assert status code is 201 (Created), a common standard for successful POST
    assert response.status_code == 201
    
    # Assert content type is JSON
    assert 'application/json' in response.headers['Content-Type']
    
    response_data = response.json()
    
    # Assert that the response contains a success message or the user object
    # This assertion may need to be adapted based on the actual API response
    assert 'user' in response_data
    assert response_data['user']['name'] == payload['name']
    assert response_data['user']['email'] == payload['email']
    assert response_data['user']['age'] == payload['age']

# Integration test: Add a user and then verify it exists in the user list
def test_add_and_then_get_user(base_url):
    """
    Integration test to add a new user and then verify its presence
    using the GET /getUsers endpoint.
    """
    # 1. Add a new user with a unique email
    unique_email = f"integration_test_{int(time.time())}@example.com"
    new_user_payload = {
        'name': 'Integration Test User',
        'email': unique_email,
        'age': 25
    }
    
    post_response = requests.post(
        f"{base_url}/addUser", 
        json=new_user_payload
    )
    assert post_response.status_code == 201, "Failed to add user for integration test"
    
    # 2. Get the full list of users
    get_response = requests.get(f"{base_url}/getUsers")
    assert get_response.status_code == 200
    
    all_users = get_response.json()
    
    # 3. Check if the newly added user is in the list
    user_found = False
    for user in all_users:
        if user.get('email') == unique_email:
            user_found = True
            # Optionally, check all fields
            assert user.get('name') == new_user_payload['name']
            assert user.get('age') == new_user_payload['age']
            break
            
    assert user_found, f"User with email {unique_email} was not found in GET /getUsers response"

# Test for Endpoint 2: POST /addUser with invalid payload
def test_add_user_bad_request(base_url):
    """
    Tests the POST /addUser endpoint with an invalid payload (missing 'email').
    - Asserts that the status code is 400 (Bad Request).
    """
    # Payload is missing the required 'email' field
    invalid_payload = {
        'name': 'Invalid User',
        'age': 40
    }
    
    response = requests.post(f"{base_url}/addUser", json=invalid_payload)
    
    # Assert status code is 400 (Bad Request)
    assert response.status_code == 400