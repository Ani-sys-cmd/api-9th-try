
const express = require('express');
const app = express();

// GET /api/users
app.get('/api/users', (req, res) => {
    res.json([{id: 1, name: 'John'}]);
});

// POST /api/users
app.post('/api/users', (req, res) => {
    res.status(201).send('Created');
});

app.listen(3000);
