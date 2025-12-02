import pytest
import requests
import random
import string
import json

# This dictionary will hold state between tests, e.g., auth tokens, created resource IDs.
# This is a simple approach for sequential tests. For parallel execution, a more robust
# state management or dependency injection method (like pytest-dependency) would be needed.
test_context = {}


@pytest.fixture
def base_url():
    """Defines the base URL for the API."""
    # The original port 5000 caused a ConnectionError, indicating the server
    # was not running there. This is changed to a common alternative port
    # assuming the server is running elsewhere. The trace shows 3001 also failed.
    # We'll try another common port, 3000.
    return "http://localhost:3000"


def generate_random_string(length=10):
    """Generates a random string for creating unique users."""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

# --- User Authentication Endpoints ---

def test_register_user(base_url):
    """Test user registration (Endpoint 13)."""
    endpoint = "/register"
    url = base_url + endpoint
    
    # Generate unique user credentials for each test run
    username = f"testuser_{generate_random_string()}"
    password = "password123"
    test_context['user_credentials'] = {'username': username, 'password': password}
    
    payload = test_context['user_credentials']
    
    response = requests.post(url, json=payload)
    
    assert response.status_code == 201, f"Expected 201 but got {response.status_code}. Response: {response.text}"
    response_data = response.json()
    assert "message" in response_data
    assert response_data["message"] == "User created successfully."


def test_login_user(base_url):
    """Test user login and token retrieval (Endpoint 14)."""
    endpoint = "/login"
    url = base_url + endpoint
    
    # Use credentials from the registration test
    payload = test_context.get('user_credentials')
    assert payload is not None, "User credentials not found from registration test."

    response = requests.post(url, json=payload)
    
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}. Response: {response.text}"
    response_data = response.json()
    assert "access_token" in response_data
    
    # Store the token for authenticated requests in subsequent tests
    test_context['auth_token'] = response_data['access_token']
    test_context['auth_headers'] = {'Authorization': f'Bearer {test_context["auth_token"]}'}


# --- Product CRUD Endpoints ---
# Assuming these endpoints manage a 'product' resource.

def test_create_product(base_url):
    """Test creating a new product (Endpoint 9: POST /)."""
    assert 'auth_headers' in test_context, "Auth token not found. Login test must run first."
    
    endpoint = "/"
    url = base_url + endpoint
    
    payload = {
        "name": f"Test Product {generate_random_string(5)}",
        "description": "A product created via automated testing.",
        "price": round(random.uniform(10.0, 100.0), 2),
        "inventory": random.randint(1, 100)
    }
    
    response = requests.post(url, json=payload, headers=test_context['auth_headers'])
    
    assert response.status_code == 201, f"Expected 201 but got {response.status_code}. Response: {response.text}"
    response_data = response.json()
    assert "id" in response_data
    assert response_data["name"] == payload["name"]
    
    # Store the created product's ID for other tests
    test_context['product_id'] = response_data['id']
    test_context['product_payload'] = payload


def test_get_all_products(base_url):
    """Test retrieving all products (Endpoint 7: GET /)."""
    endpoint = "/"
    url = base_url + endpoint
    response = requests.get(url)
    
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}. Response: {response.text}"
    response_data = response.json()
    assert isinstance(response_data, list)
    # Check if the newly created product is in the list
    if test_context.get('product_id'):
        assert any(p['id'] == test_context['product_id'] for p in response_data), "Created product not found in the list."


def test_get_product_by_id(base_url):
    """Test retrieving a single product by its ID (Endpoint 6 or 8: GET /:id)."""
    assert 'product_id' in test_context, "Product ID not found. Create product test must run first."
    product_id = test_context['product_id']
    
    endpoint = f"/{product_id}"
    url = base_url + endpoint
    response = requests.get(url)
    
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}. Response: {response.text}"
    response_data = response.json()
    assert response_data['id'] == product_id
    assert response_data['name'] == test_context['product_payload']['name']


# --- Cart Endpoints ---

def test_add_item_to_cart(base_url):
    """Test adding an item to the cart (Endpoint 2: POST /cart)."""
    assert 'auth_headers' in test_context, "Auth token not found. Login test must run first."
    assert 'product_id' in test_context, "Product ID not found. Create product test must run first."

    endpoint = "/cart"
    url = base_url + endpoint
    
    payload = {
        "productId": test_context['product_id'],
        "quantity": 2
    }
    
    response = requests.post(url, json=payload, headers=test_context['auth_headers'])
    
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}. Response: {response.text}"
    response_data = response.json()
    assert "message" in response_data
    assert "Item added to cart" in response_data["message"]


def test_get_cart_contents(base_url):
    """Test retrieving the cart's contents (Endpoint 1: GET /cart)."""
    assert 'auth_headers' in test_context, "Auth token not found. Login test must run first."
    
    endpoint = "/cart"
    url = base_url + endpoint
    response = requests.get(url, headers=test_context['auth_headers'])
    
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}. Response: {response.text}"
    response_data = response.json()
    assert isinstance(response_data, list)
    # Check if the item added in the previous test is present
    assert any(item['productId'] == test_context['product_id'] and item['quantity'] == 2 for item in response_data)


def test_delete_item_from_cart(base_url):
    """Test deleting an item from the cart (Endpoint 3: DELETE /cart/:productId)."""
    assert 'auth_headers' in test_context, "Auth token not found. Login test must run first."
    assert 'product_id' in test_context, "Product ID not found. Create product test must run first."

    product_id = test_context['product_id']
    endpoint = f"/cart/{product_id}"
    url = base_url + endpoint
    
    response = requests.delete(url, headers=test_context['auth_headers'])
    
    # HTTP 204 (No Content) is also a valid success response for DELETE
    assert response.status_code in [200, 204], f"Expected 200 or 204 but got {response.status_code}. Response: {response.text}"
    
    # Verify the item is gone
    get_cart_url = base_url + "/cart"
    get_response = requests.get(get_cart_url, headers=test_context['auth_headers'])
    assert get_response.status_code == 200, f"Expected 200 but got {get_response.status_code}. Response: {get_response.text}"
    cart_items = get_response.json()
    assert not any(item['productId'] == product_id for item in cart_items), "Item was not successfully deleted from cart."


# --- Checkout Endpoint ---

def test_checkout(base_url):
    """Test the checkout process (Endpoint 4: POST /checkout)."""
    assert 'auth_headers' in test_context, "Auth token not found. Login test must run first."
    
    # First, add an item back to the cart to ensure it's not empty for checkout
    add_url = base_url + "/cart"
    payload = {"productId": test_context['product_id'], "quantity": 1}
    add_response = requests.post(add_url, json=payload, headers=test_context['auth_headers'])
    assert add_response.status_code == 200, f"Failed to re-add item to cart for checkout test. Response: {add_response.text}"

    # Now, test the checkout
    checkout_url = base_url + "/checkout"
    response = requests.post(checkout_url, headers=test_context['auth_headers'])
    
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}. Response: {response.text}"
    response_data = response.json()
    assert "message" in response_data
    assert response_data["message"] == "Checkout successful."
    
    # Verify the cart is now empty after checkout
    get_cart_url = base_url + "/cart"
    get_response = requests.get(get_cart_url, headers=test_context['auth_headers'])
    assert get_response.status_code == 200, f"Expected 200 but got {get_response.status_code}. Response: {get_response.text}"
    assert len(get_response.json()) == 0, "Cart was not emptied after checkout."


# --- Ambiguous Endpoints Interpretation (e.g., Reviews) ---
# Assuming POST /:productId adds a review and GET /:productId gets reviews for a product.

def test_post_review(base_url):
    """Test posting a review for a product (Interpreting Endpoint 12: POST /:productId)."""
    assert 'auth_headers' in test_context, "Auth token not found. Login test must run first."
    assert 'product_id' in test_context, "Product ID not found. Create product test must run first."

    product_id = test_context['product_id']
    endpoint = f"/{product_id}" # This is ambiguous, could be /products/{id}/reviews etc.
    url = base_url + endpoint
    
    payload = {
        "rating": 5,
        "comment": "This is a great product!"
    }
    
    # Note: A POST to /:id is unconventional. A more RESTful pattern would be /products/:id/reviews
    # We are testing the endpoint as specified.
    response = requests.post(url, json=payload, headers=test_context['auth_headers'])
    
    assert response.status_code == 201, f"Expected 201 but got {response.status_code}. Response: {response.text}"
    response_data = response.json()
    assert "message" in response_data
    assert "Review added successfully" in response_data['message']


def test_get_reviews(base_url):
    """Test getting reviews for a product (Interpreting Endpoint 11: GET /:productId)."""
    assert 'product_id' in test_context, "Product ID not found. Create product test must run first."

    product_id = test_context['product_id']
    endpoint = f"/{product_id}" 
    url = base_url + endpoint
    
    # This re-tests GET /:id, but in the context of reviews it might return different data.
    # A better endpoint would be /products/:id/reviews. We test what's given.
    response = requests.get(url) # Assuming reviews are public
    
    assert response.status_code == 200, f"Expected 200 but got {response.status_code}. Response: {response.text}"
    response_data = response.json()
    # Assuming reviews are part of the product's data
    if "reviews" in response_data:
        assert isinstance(response_data['reviews'], list)
        assert len(response_data['reviews']) > 0
        assert response_data['reviews'][0]['comment'] == "This is a great product!"


# --- Cleanup ---

def test_delete_product(base_url):
    """Test deleting the created product (Endpoint 10: DELETE /:id)."""
    assert 'auth_headers' in test_context, "Auth token not found. Login test must run first."
    assert 'product_id' in test_context, "Product ID not found. Create product test must run first."
    
    product_id = test_context['product_id']
    endpoint = f"/{product_id}"
    url = base_url + endpoint
    
    response = requests.delete(url, headers=test_context['auth_headers'])
    
    assert response.status_code in [200, 204], f"Expected 200 or 204 but got {response.status_code}. Response: {response.text}"
    
    # Verify the product is actually deleted by trying to get it again
    verify_response = requests.get(url)
    assert verify_response.status_code == 404, f"Expected 404 for deleted product but got {verify_response.status_code}. Response: {verify_response.text}"