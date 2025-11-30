import pytest
import requests

@pytest.fixture
def base_url():
    """Provides the base URL for the API."""
    return "http://localhost:5000"

def test_get_status(base_url):
    """
    Tests the GET /api/status endpoint.
    It should return a 200 OK status code.
    """
    # Construct the full URL for the endpoint
    url = f"{base_url}/api/status"
    
    # Make the GET request
    response = requests.get(url)
    
    # Assert that the status code is 200 (OK)
    assert response.status_code == 200
    
    # Optional: Assert that the response content type is JSON
    assert "application/json" in response.headers["Content-Type"]
    
    # Optional: Assert the response body is a dictionary (valid JSON object)
    assert isinstance(response.json(), dict)

def test_update_profile(base_url):
    """
    Tests the PUT /api/profile endpoint.
    It should accept a PUT request and return a 200 OK status code.
    """
    # Construct the full URL for the endpoint.
    # The 404 error indicates the endpoint '/api/update-profile' was not found.
    # A common REST convention is to use the resource name, like '/api/profile'.
    url = f"{base_url}/api/profile"
    
    # Define the payload with some data. The 500 error suggests the server
    # cannot handle an empty payload and requires some fields to be present.
    payload = {"name": "Test User", "bio": "This is a test bio."}
    
    # Make the PUT request with the JSON payload. A 500 error with POST for an
    # "update" endpoint often implies the server expects a PUT or PATCH request.
    response = requests.put(url, json=payload)
    
    # Assert that the status code is 200 (OK)
    assert response.status_code == 200
    
    # Optional: Assert that the response content type is JSON
    assert "application/json" in response.headers["Content-Type"]
    
    # Optional: Assert that the response indicates success
    response_data = response.json()
    assert isinstance(response_data, dict)
    # Example assertion: check for a success message if the API provides one
    # assert "message" in response_data
    # assert response_data["message"] == "Profile updated successfully"