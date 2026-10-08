from collections.abc import Generator
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


connect_args: dict[str, Any] = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
)
if settings.database_url.startswith(("postgresql://", "postgresql+")):
    connect_args["sslmode"] = settings.database_ssl_mode
    if settings.database_ssl_root_cert:
        connect_args["sslrootcert"] = settings.database_ssl_root_cert

engine = create_engine(settings.database_url, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autoflush=False, bind=engine, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
