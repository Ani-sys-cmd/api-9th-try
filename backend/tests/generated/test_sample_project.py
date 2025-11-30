import pytest
import requests

# Define a fixture for the base URL of the API
@pytest.fixture
def base_url():
    """Provides the base URL for the API tests."""
    return "http://localhost:5000"

# Test for Endpoint 1: GET /todos
def test_get_all_todos(base_url):
    """
    Tests fetching all todos.
    Verifies the status code is 200 and the response is a list.
    """
    response = requests.get(f"{base_url}/todos")
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# Test for Endpoint 3: POST /todos
def test_create_todo(base_url):
    """
    Tests creating a new todo.
    Verifies the status code is 201 and the returned todo matches the payload.
    """
    payload = {"title": "Learn Pytest"}
    response = requests.post(f"{base_url}/todos", json=payload)
    
    assert response.status_code == 201
    
    response_data = response.json()
    assert "id" in response_data
    assert response_data["title"] == payload["title"]
    # A new todo should default to not completed
    assert not response_data["completed"]

# Test for Endpoint 2: GET /todos/:id
def test_get_specific_todo(base_url):
    """
    Tests fetching a single todo by its ID.
    First creates a todo, then fetches it to verify correctness.
    """
    # Arrange: Create a new todo to fetch
    payload = {"title": "Fetch this specific todo"}
    post_response = requests.post(f"{base_url}/todos", json=payload)
    assert post_response.status_code == 201
    todo_id = post_response.json()["id"]

    # Act: Get the newly created todo
    get_response = requests.get(f"{base_url}/todos/{todo_id}")

    # Assert: Verify the response
    assert get_response.status_code == 200
    response_data = get_response.json()
    assert response_data["id"] == todo_id
    assert response_data["title"] == payload["title"]

# Test for Endpoint 4: PUT /todos/:id
def test_update_todo(base_url):
    """
    Tests updating an existing todo.
    First creates a todo, then updates its title and completion status.
    """
    # Arrange: Create a new todo to update
    post_payload = {"title": "Todo to be updated"}
    post_response = requests.post(f"{base_url}/todos", json=post_payload)
    assert post_response.status_code == 201
    todo_id = post_response.json()["id"]

    # Act: Update the todo
    update_payload = {"title": "Updated Title", "completed": True}
    put_response = requests.put(f"{base_url}/todos/{todo_id}", json=update_payload)
    
    # Assert: Verify the update response
    assert put_response.status_code == 200
    response_data = put_response.json()
    assert response_data["id"] == todo_id
    assert response_data["title"] == update_payload["title"]
    assert response_data["completed"] == update_payload["completed"]

# Test for Endpoint 5: DELETE /todos/:id
def test_delete_todo(base_url):
    """
    Tests deleting a todo.
    First creates a todo, deletes it, then verifies it's no longer accessible.
    """
    # Arrange: Create a new todo to delete
    post_payload = {"title": "Todo to be deleted"}
    post_response = requests.post(f"{base_url}/todos", json=post_payload)
    assert post_response.status_code == 201
    todo_id = post_response.json()["id"]

    # Act: Delete the todo
    delete_response = requests.delete(f"{base_url}/todos/{todo_id}")
    
    # Assert: Check for a successful deletion status code
    assert delete_response.status_code == 200

    # Verify: Try to fetch the deleted todo, which should result in a 404
    get_response = requests.get(f"{base_url}/todos/{todo_id}")
    assert get_response.status_code == 404

# --- Optional: Negative Tests for Edge Cases ---

def test_get_nonexistent_todo(base_url):
    """
    Tests that fetching a non-existent todo ID returns a 404 error.
    """
    non_existent_id = 999999
    response = requests.get(f"{base_url}/todos/{non_existent_id}")
    assert response.status_code == 404

def test_create_todo_with_bad_payload(base_url):
    """
    Tests that creating a todo with an invalid payload returns a 400 error.
    """
    # Payload is missing the required 'title' field
    payload = {"description": "This should fail"}
    response = requests.post(f"{base_url}/todos", json=payload)
    assert response.status_code == 400