PYTHON = python
BACKEND_DIR = backend

.PHONY: backend-install backend-run backend-test

backend-install:
	cd $(BACKEND_DIR) && "C:/Program Files/Python312/python.exe" -m pip install -r requirements.txt

backend-run:
	cd $(BACKEND_DIR) && "C:/Program Files/Python312/python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

backend-test:
	cd $(BACKEND_DIR) && "C:/Program Files/Python312/python.exe" -c "from fastapi.testclient import TestClient; from app.main import app; client = TestClient(app); print(client.get('/health').status_code); print(client.get('/api/v1/market/quotes').status_code)"
