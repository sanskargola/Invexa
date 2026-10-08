import unittest

from sqlalchemy import create_engine

from app.core.database import Base
from app.core.config import Settings
import app.models


class DatabaseSchemaTests(unittest.TestCase):
    def test_all_models_create_on_sqlite(self) -> None:
        engine = create_engine("sqlite:///:memory:")
        try:
            Base.metadata.create_all(engine)
            self.assertGreaterEqual(len(Base.metadata.tables), 130)
        finally:
            engine.dispose()

    def test_sensitive_credentials_are_not_plaintext_columns(self) -> None:
        self.assertIn("password_hash", Base.metadata.tables["users"].columns)
        self.assertNotIn("password", Base.metadata.tables["users"].columns)
        self.assertIn("key_hash", Base.metadata.tables["user_api_keys"].columns)
        self.assertIn("ciphertext", Base.metadata.tables["broker_credentials"].columns)
        self.assertNotIn("api_secret", Base.metadata.tables["broker_credentials"].columns)

    def test_market_history_is_partitionable_by_timestamp(self) -> None:
        ohlcv = Base.metadata.tables["ohlcv"]
        self.assertEqual(
            ohlcv.dialect_options["postgresql"].get("partition_by"),
            "RANGE (timestamp)",
        )
        self.assertIn("timestamp", {column.name for column in ohlcv.primary_key.columns})

    def test_audit_records_include_trace_context(self) -> None:
        audit_columns = Base.metadata.tables["audit_logs"].columns
        for name in ("user_id", "action", "entity_type", "entity_id", "request_id", "occurred_at"):
            with self.subTest(column=name):
                self.assertIn(name, audit_columns)

    def test_production_rejects_insecure_defaults(self) -> None:
        with self.assertRaises(ValueError):
            Settings(environment="production")

    def test_production_accepts_explicit_secure_configuration(self) -> None:
        settings = Settings(
            environment="production",
            database_url="postgresql+psycopg://app:secret@db.example.test/invexa",
            database_ssl_mode="verify-full",
            allowed_origins="https://app.example.test",
            secret_key="a-unique-production-secret-with-at-least-32-characters",
            auto_create_schema=False,
            debug=False,
        )
        self.assertEqual(settings.database_ssl_mode, "verify-full")


if __name__ == "__main__":
    unittest.main()
