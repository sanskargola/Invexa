# Invexa

Invexa is a trading dashboard project with a React frontend and a FastAPI backend.

## Backend

The backend is located in the `backend` folder and exposes the app API at `/api/v1`.

### Run locally

1. Install dependencies:
   `cd backend && "C:/Program Files/Python312/python.exe" -m pip install -r requirements.txt`
2. Start the API:
   `cd backend && "C:/Program Files/Python312/python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
3. Visit:
   - http://localhost:8000/docs
   - http://localhost:8000/health

### Stack

- FastAPI
- Pydantic
- SQLAlchemy
- Redis
- PostgreSQL support ready

