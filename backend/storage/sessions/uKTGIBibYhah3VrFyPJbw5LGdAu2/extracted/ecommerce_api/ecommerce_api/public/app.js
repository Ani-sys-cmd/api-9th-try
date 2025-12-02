const API_URL = 'http://localhost:5000';
let currentUser = null;
let cart = [];

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();

    // Check if user is logged in (mock persistence)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
    }
});

// Navigation
function showLogin() {
    document.getElementById('product-section').style.display = 'none';
    document.getElementById('cart-section').style.display = 'none';
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function showProducts() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('cart-section').style.display = 'none';
    document.getElementById('product-section').style.display = 'block';
    loadProducts();
}

function showCart() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('product-section').style.display = 'none';
    document.getElementById('cart-section').style.display = 'block';
    loadCart();
}

// Auth
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            currentUser = { username, token: data.token, id: data.userId };
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateAuthUI();
            showProducts();
            showToast('Logged in successfully');
        } else {
            showToast(data.error);
        }
    } catch (err) {
        showToast('Login failed');
    }
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Registered successfully. Please login.');
            showLogin();
        } else {
            showToast(data.error);
        }
    } catch (err) {
        showToast('Registration failed');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    updateAuthUI();
    showProducts();
    showToast('Logged out');
}

function updateAuthUI() {
    const userControls = document.getElementById('user-controls');
    if (currentUser) {
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('register-btn').style.display = 'none';
        document.getElementById('username-display').textContent = `Hi, ${currentUser.username}`;
        document.getElementById('username-display').style.display = 'inline';
        document.getElementById('logout-btn').style.display = 'inline';
    } else {
        document.getElementById('login-btn').style.display = 'inline';
        document.getElementById('register-btn').style.display = 'inline';
        document.getElementById('username-display').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';
    }
}

// Products
async function loadProducts() {
    const search = document.getElementById('search-input').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;

    let query = '?';
    if (search) query += `search=${search}&`;
    if (minPrice) query += `minPrice=${minPrice}&`;
    if (maxPrice) query += `maxPrice=${maxPrice}&`;

    try {
        const res = await fetch(`${API_URL}/products${query}`);
        const products = await res.json();
        const container = document.getElementById('product-list');
        container.innerHTML = '';

        for (const p of products) {
            // Fetch reviews for each product
            const reviewsRes = await fetch(`${API_URL}/reviews/${p.id}`);
            const reviews = await reviewsRes.json();

            const div = document.createElement('div');
            div.className = 'product-card';
            div.innerHTML = `
                <h3>${p.name}</h3>
                <p class="price">$${p.price}</p>
                <button onclick="addToCart(${p.id})">Add to Cart</button>
                <div class="reviews">
                    <h4>Reviews (${reviews.length})</h4>
                    ${reviews.slice(0, 2).map(r => `<div class="review-item"><b>${r.username}:</b> ${r.rating}/5 - ${r.comment}</div>`).join('')}
                    ${currentUser ? `<button onclick="addReview(${p.id})">Add Review</button>` : ''}
                </div>
            `;
            container.appendChild(div);
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to load products');
    }
}

async function addReview(productId) {
    const rating = prompt("Rating (1-5):");
    const comment = prompt("Comment:");
    if (!rating || !comment) return;

    try {
        const res = await fetch(`${API_URL}/reviews/${productId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, comment, username: currentUser.username })
        });
        if (res.ok) {
            showToast('Review added');
            loadProducts();
        } else {
            showToast('Failed to add review');
        }
    } catch (err) {
        showToast('Error adding review');
    }
}

// Cart
async function addToCart(productId) {
    try {
        const res = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        if (res.ok) {
            showToast('Added to cart');
            updateCartCount();
        } else {
            showToast('Failed to add to cart');
        }
    } catch (err) {
        showToast('Error adding to cart');
    }
}

async function updateCartCount() {
    try {
        const res = await fetch(`${API_URL}/cart`);
        const items = await res.json();
        document.getElementById('cart-count').textContent = items.length;
        cart = items;
    } catch (err) {
        console.error(err);
    }
}

async function loadCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    if (cart.length === 0) {
        container.innerHTML = '<p>Cart is empty</p>';
        return;
    }

    // We need product details for cart items. 
    // In a real app, we'd fetch product details or the cart endpoint would return them.
    // Here we'll just show ID and Quantity for simplicity as per current API.

    cart.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `Product ID: ${item.productId} - Quantity: ${item.quantity} <button onclick="removeFromCart(${item.productId})">Remove</button>`;
        container.appendChild(div);
    });
}

async function removeFromCart(productId) {
    try {
        const res = await fetch(`${API_URL}/cart/${productId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            updateCartCount();
            loadCart(); // Refresh cart view
        }
    } catch (err) {
        showToast('Error removing item');
    }
}

async function checkout() {
    try {
        const res = await fetch(`${API_URL}/checkout`, {
            method: 'POST'
        });
        const data = await res.json();
        if (res.ok) {
            showToast(data.message);
            // Clear cart locally (API doesn't seem to clear it in the code I saw, but let's assume it should or we just refresh)
            // The current checkout endpoint just returns success/fail message.
            // Let's manually clear for UI.
            cart = [];
            document.getElementById('cart-count').textContent = '0';
            loadCart();
        } else {
            showToast('Checkout failed: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        showToast('Checkout error');
    }
}

// Utils
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
