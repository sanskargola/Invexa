from functools import lru_cache
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Invexia API"
    environment: Literal["development", "production", "testing"] = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"
    allowed_origins: str = "*"
    database_url: str = "sqlite:///./invexa.db"
    database_ssl_mode: Literal["disable", "allow", "prefer", "require", "verify-ca", "verify-full"] = "prefer"
    database_ssl_root_cert: str | None = None
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 24
    jwt_algorithm: str = "HS256"
    auto_create_schema: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.environment == "production":
            if self.secret_key in {
                "change-me-in-production",
                "generate-a-random-secret-with-at-least-32-characters",
            } or len(self.secret_key) < 32:
                raise ValueError("Production SECRET_KEY must be a unique value with at least 32 characters.")
            if not self.database_url.startswith("postgresql+psycopg://"):
                raise ValueError("Production DATABASE_URL must use PostgreSQL with the psycopg driver.")
            if "REPLACE_ME" in self.database_url or "change-this-password" in self.database_url:
                raise ValueError("Production DATABASE_URL must not contain example credentials.")
            if self.database_ssl_mode not in {"verify-ca", "verify-full"}:
                raise ValueError("Production PostgreSQL connections must verify the TLS certificate.")
            origins = {origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()}
            if not origins or "*" in origins:
                raise ValueError("Production ALLOWED_ORIGINS must list trusted origins instead of '*'.")
            if self.auto_create_schema:
                raise ValueError("Production schema changes must be applied through Alembic migrations.")
            if self.debug:
                raise ValueError("DEBUG must be disabled in production.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
