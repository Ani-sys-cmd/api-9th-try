const express = require('express');
const router = express.Router();

let products = [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Phone', price: 499 }
];

// GET list
router.get('/', (req, res) => {
    let result = products;
    const { minPrice, maxPrice, search } = req.query;

    if (minPrice) {
        result = result.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
        result = result.filter(p => p.price <= parseFloat(maxPrice));
    }
    if (search) {
        result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    res.json(result);
});

// GET by ID
router.get('/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
});

// POST create
router.post('/', (req, res) => {
    const { name, price, metadata } = req.body;

    // Validation
    if (!name) {
        return res.status(400).json({ error: "Missing required field: 'name'" });
    }
    if (!price) {
        return res.status(400).json({ error: "Missing required field: 'price'" });
    }

    // Bug 1: Accessing property of potentially undefined metadata
    // This will throw "Cannot read properties of undefined" if metadata is missing
    console.log(req.body.metadata.source);

    const newProduct = {
        id: products.length + 1,
        name,
        price
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// DELETE
router.delete('/:id', (req, res) => {
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
    }
    products.splice(index, 1);
    res.status(204).send();
});

module.exports = router;
