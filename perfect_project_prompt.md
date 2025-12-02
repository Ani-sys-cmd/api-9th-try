# Prompt to Generate a "Perfect" Test Project

Copy and paste the following prompt into an AI (like ChatGPT, Claude, or Gemini) to generate a project that is perfectly optimized for this API Testing System.

---

**PROMPT:**

Create a complete, meaningful **Node.js/Express** backend project for an **"E-commerce API"**.
It should not be a single file; organize it properly (e.g., `server.js`, `routes/products.js`, `routes/orders.js`, `package.json`).

**Key Requirements for Compatibility:**

1.  **Tech Stack**: Node.js, Express. Use in-memory arrays for data storage (no external database like MongoDB needed, to keep it runnable instantly).
2.  **Features**:
    *   **Products**: GET list, GET by ID, POST create (with validation), DELETE.
    *   **Orders**: POST create (requires valid product ID and quantity), GET order details.
    *   **Cart**: Simple add/remove logic.
3.  **CRITICAL - Error Handling (For Code Diagnosis)**:
    *   You **MUST** include a global error handling middleware at the end of `server.js`.
    *   This middleware **MUST** return the error `stack` trace in the JSON response when a 500 error occurs.
    *   Example:
        ```javascript
        app.use((err, req, res, next) => {
            console.error(err);
            res.status(500).json({
                error: "Internal Server Error",
                message: err.message,
                stack: err.stack // <--- CRITICAL: This allows the AI to diagnose the bug!
            });
        });
        ```
4.  **CRITICAL - Validation Messages (For Test Healing)**:
    *   When returning 400 or 404 errors, return a clear JSON message explaining *exactly* what is wrong.
    *   Example: `res.status(400).json({ error: "Missing required field: 'price'" })`.
    *   This allows the "Test Healer" to read the error and fix the test automatically.
5.  **Deliberate Bugs (To Test Diagnosis)**:
    *   Please intentionally include **2-3 subtle bugs** in the code that will cause a crash (500 error) under specific conditions.
    *   *Bug 1*: In `POST /products`, try to access a property of `req.body.metadata` without checking if `metadata` exists (causes `Cannot read properties of undefined`).
    *   *Bug 2*: In `GET /orders/:id`, use a variable name that is slightly misspelled (e.g., `oderId` instead of `orderId`) causing a `ReferenceError`.
    *   *Bug 3*: In `POST /checkout`, throw a generic error "Payment Gateway Timeout" randomly to simulate a flaky external service.

**Output Format:**
Provide the full file contents for:
1.  `package.json`
2.  `server.js`
3.  `routes/products.js`
4.  `routes/orders.js`

Tell me to "Zip these files and upload them to the API Tester".
