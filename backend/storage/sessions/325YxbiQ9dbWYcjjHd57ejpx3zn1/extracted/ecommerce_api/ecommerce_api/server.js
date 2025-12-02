const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);
app.use('/reviews', reviewRoutes);

// Cart - Simple in-memory cart (just an array of items for now)
let cart = [];

app.get('/cart', (req, res) => {
    res.json(cart);
});

app.post('/cart', (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
        return res.status(400).json({ error: "Missing required field: 'productId' or 'quantity'" });
    }
    cart.push({ productId, quantity });
    res.status(201).json(cart);
});

app.delete('/cart/:productId', (req, res) => {
    const productId = parseInt(req.params.productId);
    cart = cart.filter(item => item.productId !== productId);
    res.status(200).json(cart);
});

// Checkout Route - Bug 3
app.post('/checkout', (req, res, next) => {
    // Simulate random payment gateway failure
    // "Throw a generic error 'Payment Gateway Timeout' randomly"
    // Let's make it not so random for testing purposes, or just always throw it if a specific flag is set?
    // The prompt says "randomly", but for deterministic testing, maybe 50/50?
    // Let's do a simple random check.

    if (Math.random() > 0.5) {
        const err = new Error("Payment Gateway Timeout");
        return next(err);
    }

    res.json({ message: "Checkout successful" });
});

// CRITICAL - Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        stack: err.stack // <--- CRITICAL: This allows the AI to diagnose the bug!
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
