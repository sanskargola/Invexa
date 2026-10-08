import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from sqlalchemy.exc import SQLAlchemyError
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import Response

from app.api.router import api_router
from app.core.config import settings
from app.core.database import SessionLocal, init_db
from app.core.logging import get_logger
from app.models import ActivityLog, ApiLog, AuditLog

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.auto_create_schema:
        init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Backend API for the Invexia trading workspace. Market quotes from Yahoo Finance; charts are served independently via TradingView.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)


@app.middleware("http")
async def record_api_activity(request: Request, call_next: RequestResponseEndpoint) -> Response:
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    started = time.perf_counter()
    status_code = 500
    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception:
        logger.exception("Unhandled API request failure (request_id=%s)", request_id)
        raise
    finally:
        if request.url.path.startswith(settings.api_v1_prefix):
            duration_ms = round((time.perf_counter() - started) * 1000)
            user_id = None
            authorization = request.headers.get("authorization", "")
            scheme, _, token = authorization.partition(" ")
            if scheme.lower() == "bearer" and token:
                try:
                    subject = jwt.decode(
                        token,
                        settings.secret_key,
                        algorithms=[settings.jwt_algorithm],
                    ).get("sub")
                    user_id = uuid.UUID(subject) if subject else None
                except (JWTError, TypeError, ValueError):
                    user_id = None

            try:
                with SessionLocal.begin() as db:
                    db.add(
                        ApiLog(
                            request_id=request_id,
                            method=request.method,
                            path=request.url.path,
                            status_code=status_code,
                            duration_ms=duration_ms,
                            user_id=user_id,
                            ip_address=request.client.host if request.client else None,
                        )
                    )
                    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
                        parts = request.url.path.removeprefix(settings.api_v1_prefix).strip("/").split("/")
                        entity_type = parts[0] if parts and parts[0] else "api"
                        entity_id = parts[1] if len(parts) > 1 else None
                        action = f"{request.method} {request.url.path}"
                        db.add(
                            ActivityLog(
                                user_id=user_id,
                                action=action,
                                entity_type=entity_type,
                                entity_id=entity_id,
                                request_id=request_id,
                                ip_address=request.client.host if request.client else None,
                                user_agent=request.headers.get("user-agent", "")[:512],
                                metadata_json={"status_code": status_code, "duration_ms": duration_ms},
                            )
                        )
                        db.add(
                            AuditLog(
                                user_id=user_id,
                                actor_type="user" if user_id else "anonymous",
                                action=action,
                                entity_type=entity_type,
                                entity_id=entity_id,
                                request_id=request_id,
                                ip_address=request.client.host if request.client else None,
                                user_agent=request.headers.get("user-agent", "")[:512],
                                new_values={"status_code": status_code},
                            )
                        )
            except SQLAlchemyError:
                logger.exception("Could not persist API audit record (request_id=%s)", request_id)

        if "response" in locals():
            response.headers["X-Request-ID"] = request_id

    return response


app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Welcome to Invexia API"}
