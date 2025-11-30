const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// --- 1. Healthy Endpoint ---
// This one works fine. The Agent will get 200 OK.
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "online", 
        uptime: process.uptime() 
    });
});

// --- 2. THE BROKEN ENDPOINT ---
// Scenario: A profile update that expects a nested 'data' object.
// FLAW: If the Agent sends an empty body {}, accessing 'req.body.data.username' will CRASH the server.
app.post('/api/update-profile', (req, res) => {
    console.log("Received update request:", req.body);

    // <--- BUG IS HERE --->
    // If req.body.data is missing, this throws:
    // "TypeError: Cannot read properties of undefined (reading 'username')"
    const newName = req.body.data.username; 

    res.json({ 
        success: true, 
        message: `Profile updated for ${newName}` 
    });
});

// Start the server on port 5000
app.listen(5000, () => {
    console.log("Dummy API running on http://localhost:5000");
});