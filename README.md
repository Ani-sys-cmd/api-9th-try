# API Testing Agent

## Getting Started

### Backend

To run the backend with the test healer enabled (preventing crashes during retest), use the provided batch script:

```bash
cd backend
run_backend.bat
```

This script runs the server with `uvicorn` configured to ignore changes in the `tests/` directory, preventing unwanted reloads when tests are healed.

### Frontend

```bash
cd frontend
npm run dev
```
