const express = require('express');
const router = express.Router();

// Mock products reference (in a real app, we'd query the DB)
// We'll just assume products exist for simplicity or duplicate the array if needed, 
// but the requirement says "requires valid product ID". 
// We can just check against a hardcoded list or import, but let's keep it simple and self-contained 
// or maybe just trust the ID for now unless we want to be strict.
// Let's be slightly strict to match "requires valid product ID".
// Since we don't share state easily between files without a DB or a shared module, 
// we will just assume IDs 1 and 2 exist for validation purposes.

let orders = [];

// POST create
router.post('/', (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId) {
        return res.status(400).json({ error: "Missing required field: 'productId'" });
    }
    if (!quantity) {
        return res.status(400).json({ error: "Missing required field: 'quantity'" });
    }

    // Simple validation simulation
    if (productId > 100) {
        return res.status(400).json({ error: "Invalid product ID" });
    }

    const newOrder = {
        id: orders.length + 1,
        productId,
        quantity,
        status: 'pending'
    };
    orders.push(newOrder);
    res.status(201).json(newOrder);
});

// GET order details
router.get('/:id', (req, res) => {
    // Bug 2: Typo 'oderId' instead of 'orderId'
    // This will cause a ReferenceError
    const order = orders.find(o => o.id === parseInt(req.params.id));

    if (!order) {
        // Let's trigger the bug here or just before returning
        // The requirement says "In GET /orders/:id, use a variable name that is slightly misspelled"
        console.log("Fetching order:", oderId); // <--- BUG HERE
        return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
});

module.exports = router;
