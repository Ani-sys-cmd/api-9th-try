# Run Project Workflow

## Goal
Automate the end‑to‑end execution of the project:
1. Start the FastAPI backend.
2. Start the React/Vite frontend.
3. (Optional) Call the backend API to upload a sample project, generate tests, and run them.

## Steps
1. **Start Backend**
   ```bash
   uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   // turbo
2. **Start Frontend**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```
   // turbo
3. **(Optional) Run API Workflow**
   - Use `curl` or a HTTP client to POST a ZIP file to `http://localhost:8000/upload`.
   - POST to `/generate-tests` with JSON `{"base_url": "http://localhost:8000"}`.
   - POST to `/run-tests`.
   // turbo

## Verification
- Backend should be reachable at `http://localhost:8000` (GET `/` returns `{"status": "System Operational"}`).
- Frontend should load at the URL printed by Vite (usually `http://localhost:5173`).
- API endpoints should respond with success messages.

## Notes
- Ensure `uvicorn`, `npm`, and `node` are installed and available in PATH.
- If the backend uses a virtual environment, activate it before running the `uvicorn` command.
- The workflow file is placed at `.agent/workflows/run_project.md`.
