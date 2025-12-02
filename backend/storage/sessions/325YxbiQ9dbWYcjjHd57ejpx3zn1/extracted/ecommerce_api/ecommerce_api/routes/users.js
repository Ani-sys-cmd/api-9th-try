const express = require('express');
const router = express.Router();

let users = [];

router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
    }
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: "User already exists" });
    }
    const newUser = { id: users.length + 1, username, password };
    users.push(newUser);
    res.status(201).json({ message: "User registered successfully", userId: newUser.id });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ message: "Login successful", token: "fake-jwt-token-" + user.id, userId: user.id });
});

module.exports = router;
