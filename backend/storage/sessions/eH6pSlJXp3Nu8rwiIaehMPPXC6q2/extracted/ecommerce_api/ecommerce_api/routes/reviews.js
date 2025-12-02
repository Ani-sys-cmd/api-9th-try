const express = require('express');
const router = express.Router();

let reviews = [];

// Get reviews for a product
router.get('/:productId', (req, res) => {
    const productId = parseInt(req.params.productId);
    const productReviews = reviews.filter(r => r.productId === productId);
    res.json(productReviews);
});

// Add a review
router.post('/:productId', (req, res) => {
    const productId = parseInt(req.params.productId);
    const { rating, comment, username } = req.body;

    if (!rating || !comment) {
        return res.status(400).json({ error: "Missing rating or comment" });
    }

    const newReview = {
        id: reviews.length + 1,
        productId,
        username: username || 'Anonymous',
        rating,
        comment,
        date: new Date()
    };
    reviews.push(newReview);
    res.status(201).json(newReview);
});

module.exports = router;
