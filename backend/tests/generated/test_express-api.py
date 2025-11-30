import pytest
import requests
import random
import string

# Define the base URL for the API as a fixture
@pytest.fixture
def base_url():
    """Provides the base URL for the API tests."""
    # The ConnectionError indicates the server isn't running on port 5000.
    # A common port for Node.js/Express apps (suggested by the filename) is 3000.
    return "http://localhost:3000"

# Helper function to generate random names for test data isolation
def generate_random_string(length=8):
    """Generates a random string of fixed length."""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def test_get_all_employees(base_url):
    """
    Test for Endpoint 1: GET /employees/
    - Verifies that the endpoint is reachable.
    - Checks for a 200 OK status code.
    - Confirms the response body is a list.
    """
    response = requests.get(f"{base_url}/employees/")
    
    # Assert that the request was successful
    assert response.status_code == 200, f"Expected status code 200, but got {response.status_code}"
    
    # Assert that the response body is a list (JSON array)
    response_data = response.json()
    assert isinstance(response_data, list), f"Expected response to be a list, but got {type(response_data)}"

def test_employee_full_crud_cycle(base_url):
    """
    Test for Endpoints 2, 3, 4, 5 in a full Create, Read, Update, Delete cycle.
    """
    headers = {'Content-Type': 'application/json'}
    
    # --- 1. CREATE (POST /employees/) ---
    unique_name = f"Test User {generate_random_string()}"
    create_payload = {
        "name": unique_name,
        "job": "QA Engineer"
    }
    
    create_response = requests.post(f"{base_url}/employees/", json=create_payload, headers=headers)
    
    # Assert creation was successful (201 Created)
    assert create_response.status_code == 201, f"Expected status code 201, but got {create_response.status_code}"
    
    created_data = create_response.json()
    assert "id" in created_data, "Response JSON should contain an 'id'"
    assert created_data["name"] == create_payload["name"]
    assert created_data["job"] == create_payload["job"]
    
    # Extract the ID for the next steps
    employee_id = created_data["id"]
    
    # --- 2. READ (GET /employees/:id) ---
    read_response = requests.get(f"{base_url}/employees/{employee_id}")
    
    # Assert reading the new employee was successful
    assert read_response.status_code == 200, f"Expected status code 200, but got {read_response.status_code}"
    
    read_data = read_response.json()
    assert read_data["id"] == employee_id
    assert read_data["name"] == create_payload["name"]
    assert read_data["job"] == create_payload["job"]
    
    # --- 3. UPDATE (PUT /employees/:id) ---
    update_payload = {
        "name": f"Updated {unique_name}",
        "job": "Senior QA Engineer"
    }
    
    update_response = requests.put(f"{base_url}/employees/{employee_id}", json=update_payload, headers=headers)
    
    # Assert update was successful
    assert update_response.status_code == 200, f"Expected status code 200, but got {update_response.status_code}"
    
    updated_data = update_response.json()
    assert updated_data["name"] == update_payload["name"]
    assert updated_data["job"] == update_payload["job"]

    # --- 4. VERIFY UPDATE (GET /employees/:id again) ---
    verify_response = requests.get(f"{base_url}/employees/{employee_id}")
    assert verify_response.status_code == 200
    
    verify_data = verify_response.json()
    assert verify_data["name"] == update_payload["name"] # Check for updated name
    assert verify_data["job"] == update_payload["job"]   # Check for updated job
    
    # --- 5. DELETE (DELETE /employees/:id) ---
    delete_response = requests.delete(f"{base_url}/employees/{employee_id}")
    
    # Assert deletion was successful (200 OK or 204 No Content are common)
    assert delete_response.status_code in [200, 204], f"Expected status code 200 or 204, but got {delete_response.status_code}"
    
    # --- 6. VERIFY DELETE (GET /employees/:id one last time) ---
    verify_delete_response = requests.get(f"{base_url}/employees/{employee_id}")
    
    # Assert that the resource is no longer found
    assert verify_delete_response.status_code == 404, f"Expected status code 404, but got {verify_delete_response.status_code}"


def test_get_nonexistent_employee(base_url):
    """
    Test for GET /employees/:id with an ID that does not exist.
    """
    non_existent_id = "nonexistent12345"
    response = requests.get(f"{base_url}/employees/{non_existent_id}")
    
    # Assert that the server responds with 404 Not Found
    assert response.status_code == 404, f"Expected status code 404, but got {response.status_code}"

def test_create_employee_with_invalid_payload(base_url):
    """
    Test for POST /employees/ with a missing required field ('name').
    """
    invalid_payload = {
        "job": "Missing Name"
    }
    
    response = requests.post(f"{base_url}/employees/", json=invalid_payload)
    
    # Assert that the server responds with 400 Bad Request
    assert response.status_code == 400, f"Expected status code 400 for invalid payload, but got {response.status_code}"