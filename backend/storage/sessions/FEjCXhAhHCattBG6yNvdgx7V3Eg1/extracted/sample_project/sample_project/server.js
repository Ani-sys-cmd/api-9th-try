const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Endpoint 1: Working endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Endpoint 2: Buggy endpoint (ReferenceError)
app.get('/api/users', (req, res, next) => {
    try {
        // Bug: 'users' is not defined
        res.json(users);
    } catch (error) {
        next(error);
    }
});

// Endpoint 3: Buggy endpoint (TypeError)
app.post('/api/process', (req, res, next) => {
    try {
        const data = req.body;
        // Bug: Trying to access property of null/undefined if data.user is missing
        const username = data.user.name.toUpperCase();
        res.json({ processed: username });
    } catch (error) {
        next(error);
    }
});

// Endpoint 4: Database connection simulation (Async Error)
app.get('/api/db-test', async (req, res, next) => {
    try {
        await new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error("Database connection timeout")), 100);
        });
    } catch (error) {
        next(error);
    }
});

// CRITICAL: Error handling middleware that exposes stack traces
// This is what makes the "Code Diagnosis" feature work perfectly!
app.use((err, req, res, next) => {
    console.error("Server Error:", err); // Log to console
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        stack: err.stack // Send stack trace to client (Test Runner)
    });
});

app.listen(port, () => {
    console.log(`Sample API running on http://localhost:${port}`);
});
