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

### Database setup

The backend schema is defined in `backend/app/models.py` and managed with Alembic. It currently defines 136 tables covering identity and access records, market data, chart/watchlist state, fundamentals, portfolios, orders and fills, paper trading, strategies, risk, backtests, ML predictions, news/sentiment, alerts, brokers, AI conversations, reports, audit/activity, system health, ingestion, and jobs.

1. Create a PostgreSQL database and a dedicated application role. Do not run the API as a PostgreSQL superuser or table owner.
2. Copy `backend/.env.example` to `backend/.env`, then set `DATABASE_URL`, a unique `SECRET_KEY` (at least 32 characters), and the trusted frontend origins. Generate a key with `python -c "import secrets; print(secrets.token_urlsafe(48))"`. Use the `postgresql+psycopg://` URL scheme. Keep `.env` out of source control.
3. Install backend requirements, then apply migrations:
   `cd backend && python -m pip install -r requirements.txt && python -m alembic upgrade head`
4. Start the API using the existing command above.

For local development, SQLite and automatic table creation are enabled by default. Set `AUTO_CREATE_SCHEMA=false` when using migrations. Production mode requires PostgreSQL with the psycopg driver, certificate-verifying TLS, a unique signing key of at least 32 characters, explicit CORS origins, `DEBUG=false`, and Alembic-managed schema changes. Set `DATABASE_SSL_MODE=verify-full` and configure `DATABASE_SSL_ROOT_CERT` where required by your PostgreSQL provider.

Market OHLCV is stored in a PostgreSQL range-partitioned table. The initial migration creates a default partition so writes work immediately; create monthly partitions before sustained historical ingestion and move data out of the default partition as part of the ingestion/retention operations.

`audit_logs` is append-only in PostgreSQL. `api_logs` records request method, path (without query string), status, duration, request ID, and actor when a valid bearer token is provided. Mutating API requests are also recorded in `activity_logs` and `audit_logs`; request bodies, credentials, and authorization headers are deliberately not copied into logs. Use `X-Request-ID` returned by the API to correlate an action with its request record. Keep audit tables under a separate restricted database role and establish retention, backup, and access policies before production use.

The API still has demo/in-memory fixtures, including prototype authentication and some trading/market handlers. Creating these tables does not automatically migrate those handlers to database-backed business logic or enforce per-user authorization. Do not expose the API publicly or treat it as production-ready until authentication and each protected handler are explicitly moved to persisted models and ownership checks.
