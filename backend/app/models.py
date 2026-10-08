from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

JSON_VALUE = JSON().with_variant(JSONB, "postgresql")


class IdMixin:
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class User(IdMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    username: Mapped[str | None] = mapped_column(String(64), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class UserProfile(IdMixin, TimestampMixin, Base):
    __tablename__ = "user_profiles"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    date_of_birth: Mapped[Date | None] = mapped_column(Date)
    profile_image: Mapped[str | None] = mapped_column(String(2048))
    country: Mapped[str | None] = mapped_column(String(2))
    state: Mapped[str | None] = mapped_column(String(100))
    city: Mapped[str | None] = mapped_column(String(100))
    occupation: Mapped[str | None] = mapped_column(String(120))
    bio: Mapped[str | None] = mapped_column(Text)
    risk_profile: Mapped[str] = mapped_column(String(40), default="moderate", nullable=False)


class UserSettings(IdMixin, TimestampMixin, Base):
    __tablename__ = "user_settings"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    theme: Mapped[str] = mapped_column(String(20), default="dark", nullable=False)
    language: Mapped[str] = mapped_column(String(12), default="en", nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
    default_exchange_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("exchanges.id", ondelete="SET NULL"))
    default_chart_timeframe: Mapped[str] = mapped_column(String(12), default="1d", nullable=False)
    default_chart_type: Mapped[str] = mapped_column(String(24), default="candlestick", nullable=False)


class UserPreference(IdMixin, TimestampMixin, Base):
    __tablename__ = "user_preferences"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    push_notifications: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    price_alerts: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    trade_alerts: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    news_alerts: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    ai_alerts: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    marketing_notifications: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class UserSession(IdMixin, Base):
    __tablename__ = "user_sessions"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(String(512))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AIUsage(IdMixin, Base):
    __tablename__ = "ai_usage"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    model: Mapped[str] = mapped_column(String(120), nullable=False)
    input_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cost: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class EmailVerificationToken(IdMixin, Base):
    __tablename__ = "email_verification_tokens"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PasswordResetToken(IdMixin, Base):
    __tablename__ = "password_reset_tokens"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Role(IdMixin, Base):
    __tablename__ = "roles"
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)


class Permission(IdMixin, Base):
    __tablename__ = "permissions"
    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)


class UserRole(Base):
    __tablename__ = "user_roles"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    assigned_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))


class RolePermission(Base):
    __tablename__ = "role_permissions"
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
    permission_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)


class UserConsent(IdMixin, Base):
    __tablename__ = "user_consents"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    consent_type: Mapped[str] = mapped_column(String(64), nullable=False)
    policy_version: Mapped[str] = mapped_column(String(32), nullable=False)
    granted: Mapped[bool] = mapped_column(Boolean, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(45))


class UserApiKey(IdMixin, Base):
    __tablename__ = "user_api_keys"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    key_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    scopes: Mapped[list[str]] = mapped_column(JSON_VALUE, default=list, nullable=False)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class TwoFactorAuth(IdMixin, Base):
    __tablename__ = "two_factor_auth"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    secret_ciphertext: Mapped[str] = mapped_column(Text, nullable=False)
    encryption_key_id: Mapped[str] = mapped_column(String(64), nullable=False)
    enabled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    recovery_code_hashes: Mapped[list[str]] = mapped_column(JSON_VALUE, default=list, nullable=False)


class LoginAttempt(IdMixin, Base):
    __tablename__ = "login_attempts"
    email: Mapped[str] = mapped_column(String(320), index=True, nullable=False)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    succeeded: Mapped[bool] = mapped_column(Boolean, nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(String(512))
    attempted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Exchange(IdMixin, TimestampMixin, Base):
    __tablename__ = "exchanges"
    code: Mapped[str] = mapped_column(String(16), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    country: Mapped[str | None] = mapped_column(String(2))
    timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Segment(IdMixin, Base):
    __tablename__ = "segments"
    exchange_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("exchanges.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    __table_args__ = (UniqueConstraint("exchange_id", "code"),)


class Sector(IdMixin, Base):
    __tablename__ = "sectors"
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)


class Industry(IdMixin, Base):
    __tablename__ = "industries"
    sector_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("sectors.id", ondelete="SET NULL"), index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)


class Stock(IdMixin, TimestampMixin, Base):
    __tablename__ = "stocks"
    exchange_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("exchanges.id", ondelete="RESTRICT"), index=True)
    segment_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("segments.id", ondelete="SET NULL"))
    sector_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("sectors.id", ondelete="SET NULL"), index=True)
    industry_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("industries.id", ondelete="SET NULL"))
    symbol: Mapped[str] = mapped_column(String(32), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    isin: Mapped[str | None] = mapped_column(String(12), index=True)
    security_type: Mapped[str] = mapped_column(String(32), default="equity", nullable=False)
    face_value: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    lot_size: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    listing_date: Mapped[Date | None] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    __table_args__ = (UniqueConstraint("exchange_id", "symbol"), CheckConstraint("lot_size > 0"))


class StockSymbol(IdMixin, Base):
    __tablename__ = "stock_symbols"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(32), nullable=False)
    valid_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    valid_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    __table_args__ = (UniqueConstraint("source", "symbol"),)


class MarketIndex(IdMixin, TimestampMixin, Base):
    __tablename__ = "indices"
    exchange_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("exchanges.id", ondelete="RESTRICT"), index=True)
    symbol: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    index_type: Mapped[str] = mapped_column(String(32), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    __table_args__ = (UniqueConstraint("exchange_id", "symbol"),)


class IndexConstituent(Base):
    __tablename__ = "index_constituents"
    index_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("indices.id", ondelete="CASCADE"), primary_key=True)
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="RESTRICT"), primary_key=True)
    weight: Mapped[Decimal | None] = mapped_column(Numeric(12, 8))
    effective_from: Mapped[Date] = mapped_column(Date, primary_key=True)
    effective_to: Mapped[Date | None] = mapped_column(Date)


class MarketHoliday(IdMixin, Base):
    __tablename__ = "market_holidays"
    exchange_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("exchanges.id", ondelete="CASCADE"), index=True)
    holiday_date: Mapped[Date] = mapped_column(Date, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    __table_args__ = (UniqueConstraint("exchange_id", "holiday_date"),)


class TradingSession(IdMixin, Base):
    __tablename__ = "trading_sessions"
    exchange_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("exchanges.id", ondelete="CASCADE"), index=True)
    session_date: Mapped[Date] = mapped_column(Date, nullable=False)
    opens_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    closes_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    session_type: Mapped[str] = mapped_column(String(24), default="regular", nullable=False)
    __table_args__ = (UniqueConstraint("exchange_id", "session_date", "session_type"),)


class ETF(IdMixin, Base):
    __tablename__ = "etfs"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), unique=True)
    fund_family: Mapped[str | None] = mapped_column(String(120))
    expense_ratio: Mapped[Decimal | None] = mapped_column(Numeric(10, 8))
    assets_under_management: Mapped[Decimal | None] = mapped_column(Numeric(24, 4))


class CorporateAction(IdMixin, Base):
    __tablename__ = "corporate_actions"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="RESTRICT"), index=True)
    action_type: Mapped[str] = mapped_column(String(32), nullable=False)
    announced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    effective_date: Mapped[Date] = mapped_column(Date, nullable=False, index=True)
    ratio: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    cash_amount: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    currency: Mapped[str | None] = mapped_column(String(3))
    details: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    source: Mapped[str | None] = mapped_column(String(64))


class Dividend(IdMixin, Base):
    __tablename__ = "dividends"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="RESTRICT"), index=True)
    ex_date: Mapped[Date] = mapped_column(Date, nullable=False)
    record_date: Mapped[Date | None] = mapped_column(Date)
    payment_date: Mapped[Date | None] = mapped_column(Date)
    amount_per_share: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    __table_args__ = (UniqueConstraint("stock_id", "ex_date", "amount_per_share"),)


class MarketQuote(IdMixin, Base):
    __tablename__ = "market_quotes"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), index=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    last_price: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    change: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    change_percent: Mapped[Decimal] = mapped_column(Numeric(12, 8), default=0, nullable=False)
    open: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    high: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    low: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    previous_close: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    volume: Mapped[int | None] = mapped_column(Integer)
    week_52_high: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    week_52_low: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    market_cap: Mapped[Decimal | None] = mapped_column(Numeric(24, 4))
    __table_args__ = (Index("ix_market_quotes_stock_time", "stock_id", "captured_at"),)


class MarketTick(IdMixin, Base):
    __tablename__ = "market_ticks"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    quantity: Mapped[int | None] = mapped_column(Integer)
    bid_price: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    ask_price: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    bid_quantity: Mapped[int | None] = mapped_column(Integer)
    ask_quantity: Mapped[int | None] = mapped_column(Integer)
    __table_args__ = (Index("ix_market_ticks_stock_time", "stock_id", "occurred_at"),)


class OHLCV(Base):
    __tablename__ = "ohlcv"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), primary_key=True)
    timeframe: Mapped[str] = mapped_column(String(8), primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), primary_key=True)
    open: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    high: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    low: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    close: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    adjusted_close: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    volume: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    vwap: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    trade_count: Mapped[int | None] = mapped_column(Integer)
    __table_args__ = (
        CheckConstraint("high >= low"),
        Index("ix_ohlcv_timeframe_timestamp", "timeframe", "timestamp"),
        {"postgresql_partition_by": "RANGE (timestamp)"},
    )


class MarketDepth(IdMixin, Base):
    __tablename__ = "market_depth"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), index=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    side: Mapped[str] = mapped_column(String(4), nullable=False)
    level: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    __table_args__ = (
        UniqueConstraint("stock_id", "captured_at", "side", "level"),
        CheckConstraint("level > 0 AND quantity >= 0"),
    )


class TechnicalIndicator(IdMixin, Base):
    __tablename__ = "technical_indicators"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    timeframe: Mapped[str] = mapped_column(String(8), nullable=False)
    values: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    source_version: Mapped[str | None] = mapped_column(String(64))
    __table_args__ = (UniqueConstraint("stock_id", "timestamp", "timeframe"),)


class FinancialStatement(IdMixin, Base):
    __tablename__ = "financial_statements"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), index=True)
    period_end: Mapped[Date] = mapped_column(Date, nullable=False)
    period_type: Mapped[str] = mapped_column(String(16), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    values: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    source: Mapped[str | None] = mapped_column(String(64))
    __table_args__ = (UniqueConstraint("stock_id", "period_end", "period_type"),)


class FinancialRatio(IdMixin, Base):
    __tablename__ = "financial_ratios"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), index=True)
    as_of_date: Mapped[Date] = mapped_column(Date, nullable=False)
    values: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    source: Mapped[str | None] = mapped_column(String(64))
    __table_args__ = (UniqueConstraint("stock_id", "as_of_date"),)


class Earnings(IdMixin, Base):
    __tablename__ = "earnings"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), index=True)
    fiscal_period: Mapped[str] = mapped_column(String(24), nullable=False)
    report_date: Mapped[Date] = mapped_column(Date, nullable=False)
    actual_eps: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    estimated_eps: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    actual_revenue: Mapped[Decimal | None] = mapped_column(Numeric(24, 4))
    estimated_revenue: Mapped[Decimal | None] = mapped_column(Numeric(24, 4))
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    __table_args__ = (UniqueConstraint("stock_id", "fiscal_period"),)


class ShareholdingPattern(IdMixin, Base):
    __tablename__ = "shareholding_patterns"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), index=True)
    as_of_date: Mapped[Date] = mapped_column(Date, nullable=False)
    holder_type: Mapped[str] = mapped_column(String(48), nullable=False)
    percentage: Mapped[Decimal] = mapped_column(Numeric(8, 7), nullable=False)
    holder_name: Mapped[str | None] = mapped_column(String(200))
    __table_args__ = (UniqueConstraint("stock_id", "as_of_date", "holder_type", "holder_name"),)


class Watchlist(IdMixin, TimestampMixin, Base):
    __tablename__ = "watchlists"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    __table_args__ = (UniqueConstraint("user_id", "name"),)


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"
    watchlist_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("watchlists.id", ondelete="CASCADE"), primary_key=True)
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), primary_key=True)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ChartLayout(IdMixin, TimestampMixin, Base):
    __tablename__ = "chart_layouts"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    stock_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("stocks.id", ondelete="SET NULL"))
    timeframe: Mapped[str] = mapped_column(String(8), default="1d", nullable=False)
    chart_type: Mapped[str] = mapped_column(String(24), default="candlestick", nullable=False)
    layout_config: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    __table_args__ = (UniqueConstraint("user_id", "name"),)


class ChartDrawing(IdMixin, TimestampMixin, Base):
    __tablename__ = "chart_drawings"
    layout_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("chart_layouts.id", ondelete="CASCADE"), index=True)
    drawing_type: Mapped[str] = mapped_column(String(40), nullable=False)
    geometry: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    style: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)


class ChartIndicator(IdMixin, Base):
    __tablename__ = "chart_indicators"
    layout_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("chart_layouts.id", ondelete="CASCADE"), index=True)
    indicator: Mapped[str] = mapped_column(String(64), nullable=False)
    parameters: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class SavedScreener(IdMixin, TimestampMixin, Base):
    __tablename__ = "saved_screeners"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    filters: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)


class SavedChart(IdMixin, TimestampMixin, Base):
    __tablename__ = "saved_charts"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    layout_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("chart_layouts.id", ondelete="CASCADE"), unique=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)


class Portfolio(IdMixin, TimestampMixin, Base):
    __tablename__ = "portfolios"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    base_currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    initial_capital: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    is_paper: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class CashBalance(IdMixin, TimestampMixin, Base):
    __tablename__ = "cash_balances"
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    balance: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    __table_args__ = (UniqueConstraint("portfolio_id", "currency"),)


class Holding(IdMixin, TimestampMixin, Base):
    __tablename__ = "holdings"
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="RESTRICT"), index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(24, 8), default=0, nullable=False)
    average_price: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    __table_args__ = (
        UniqueConstraint("portfolio_id", "stock_id"),
        CheckConstraint("quantity >= 0"),
        CheckConstraint("average_price >= 0"),
    )


class PortfolioTransaction(IdMixin, Base):
    __tablename__ = "portfolio_transactions"
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolios.id", ondelete="RESTRICT"), index=True)
    stock_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("stocks.id", ondelete="RESTRICT"), index=True)
    order_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("orders.id", ondelete="SET NULL"), index=True)
    transaction_type: Mapped[str] = mapped_column(String(24), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(24, 8), default=0, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    fee: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    reference: Mapped[str | None] = mapped_column(String(128), unique=True)


class PortfolioSnapshot(IdMixin, Base):
    __tablename__ = "portfolio_snapshots"
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    total_value: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    cash: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    invested_value: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    pnl: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    pnl_percent: Mapped[Decimal] = mapped_column(Numeric(12, 8), nullable=False)
    allocation: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    __table_args__ = (UniqueConstraint("portfolio_id", "captured_at"),)


class PortfolioAllocation(IdMixin, Base):
    __tablename__ = "portfolio_allocations"
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    stock_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("stocks.id", ondelete="SET NULL"), index=True)
    asset_class: Mapped[str] = mapped_column(String(32), nullable=False)
    value: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    weight: Mapped[Decimal] = mapped_column(Numeric(12, 8), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class PortfolioPnL(IdMixin, Base):
    __tablename__ = "portfolio_pnl"
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    as_of_date: Mapped[Date] = mapped_column(Date, nullable=False)
    realized_pnl: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    unrealized_pnl: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    daily_pnl: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    __table_args__ = (UniqueConstraint("portfolio_id", "as_of_date"),)


class DividendTransaction(IdMixin, Base):
    __tablename__ = "dividend_transactions"
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolios.id", ondelete="RESTRICT"), index=True)
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="RESTRICT"), index=True)
    dividend_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("dividends.id", ondelete="SET NULL"))
    amount: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Order(IdMixin, TimestampMixin, Base):
    __tablename__ = "orders"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolios.id", ondelete="RESTRICT"), index=True)
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="RESTRICT"), index=True)
    broker_account_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("broker_accounts.id", ondelete="SET NULL"))
    client_order_id: Mapped[str | None] = mapped_column(String(128), unique=True)
    broker_order_id: Mapped[str | None] = mapped_column(String(128), index=True)
    side: Mapped[str] = mapped_column(String(8), nullable=False)
    order_type: Mapped[str] = mapped_column(String(16), nullable=False)
    product_type: Mapped[str] = mapped_column(String(24), default="delivery", nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(24, 8), nullable=False)
    filled_quantity: Mapped[Decimal] = mapped_column(Numeric(24, 8), default=0, nullable=False)
    price: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    trigger_price: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    average_fill_price: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    status: Mapped[str] = mapped_column(String(24), default="pending", nullable=False, index=True)
    validity: Mapped[str] = mapped_column(String(16), default="day", nullable=False)
    stop_loss: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    take_profit: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    placed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    executed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    __table_args__ = (
        CheckConstraint("quantity > 0"),
        CheckConstraint("filled_quantity >= 0 AND filled_quantity <= quantity"),
        CheckConstraint("side IN ('buy', 'sell')"),
        Index("ix_orders_user_created", "user_id", "created_at"),
    )


class OrderEvent(IdMixin, Base):
    __tablename__ = "order_events"
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id", ondelete="RESTRICT"), index=True)
    event_type: Mapped[str] = mapped_column(String(32), nullable=False)
    old_status: Mapped[str | None] = mapped_column(String(24))
    new_status: Mapped[str | None] = mapped_column(String(24))
    quantity: Mapped[Decimal | None] = mapped_column(Numeric(24, 8))
    price: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    message: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AlgoOrder(IdMixin, Base):
    __tablename__ = "algo_orders"
    run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("algo_runs.id", ondelete="RESTRICT"), index=True)
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id", ondelete="RESTRICT"), unique=True)
    signal_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("strategy_signals.id", ondelete="SET NULL"))
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Trade(IdMixin, Base):
    __tablename__ = "trades"
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id", ondelete="RESTRICT"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolios.id", ondelete="RESTRICT"), index=True)
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="RESTRICT"), index=True)
    side: Mapped[str] = mapped_column(String(8), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(24, 8), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    gross_amount: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    fees: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    taxes: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    net_amount: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    __table_args__ = (CheckConstraint("quantity > 0"), CheckConstraint("price >= 0"))


class Settlement(IdMixin, Base):
    __tablename__ = "settlements"
    trade_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trades.id", ondelete="RESTRICT"), unique=True)
    settlement_date: Mapped[Date] = mapped_column(Date, nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="pending", nullable=False)


class PaperAccount(IdMixin, TimestampMixin, Base):
    __tablename__ = "paper_accounts"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), unique=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    initial_balance: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    cash_balance: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)


class PaperCashTransaction(IdMixin, Base):
    __tablename__ = "paper_cash_transactions"
    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("paper_accounts.id", ondelete="RESTRICT"), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(24), nullable=False)
    reference: Mapped[str | None] = mapped_column(String(128), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PaperOrder(IdMixin, TimestampMixin, Base):
    __tablename__ = "paper_orders"
    account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("paper_accounts.id", ondelete="RESTRICT"), index=True)
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id", ondelete="RESTRICT"), unique=True)
    simulation_config: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)


class PaperTrade(IdMixin, Base):
    __tablename__ = "paper_trades"
    paper_order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("paper_orders.id", ondelete="RESTRICT"), index=True)
    trade_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trades.id", ondelete="RESTRICT"), unique=True)
    simulated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Strategy(IdMixin, TimestampMixin, Base):
    __tablename__ = "strategies"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    strategy_type: Mapped[str] = mapped_column(String(40), nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="draft", nullable=False, index=True)
    timeframe: Mapped[str] = mapped_column(String(12), default="1d", nullable=False)
    symbol_scope: Mapped[list[str]] = mapped_column(JSON_VALUE, default=list, nullable=False)
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class StrategyVersion(IdMixin, Base):
    __tablename__ = "strategy_versions"
    strategy_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("strategies.id", ondelete="RESTRICT"), index=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    code_reference: Mapped[str | None] = mapped_column(String(512))
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (UniqueConstraint("strategy_id", "version"),)


class StrategyParameter(IdMixin, Base):
    __tablename__ = "strategy_parameters"
    strategy_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("strategies.id", ondelete="CASCADE"), index=True)
    parameter_name: Mapped[str] = mapped_column(String(100), nullable=False)
    parameter_type: Mapped[str] = mapped_column(String(24), nullable=False)
    default_value: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    min_value: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    max_value: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    __table_args__ = (UniqueConstraint("strategy_id", "parameter_name"),)


class StrategyCondition(IdMixin, Base):
    __tablename__ = "strategy_conditions"
    strategy_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("strategies.id", ondelete="CASCADE"), index=True)
    condition_type: Mapped[str] = mapped_column(String(48), nullable=False)
    expression: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    direction: Mapped[str] = mapped_column(String(16), nullable=False)


class StrategySignal(IdMixin, Base):
    __tablename__ = "strategy_signals"
    strategy_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("strategies.id", ondelete="RESTRICT"), index=True)
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="RESTRICT"), index=True)
    signal: Mapped[str] = mapped_column(String(16), nullable=False)
    strength: Mapped[Decimal | None] = mapped_column(Numeric(12, 8))
    rationale: Mapped[str | None] = mapped_column(Text)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)


class AlgoRun(IdMixin, Base):
    __tablename__ = "algo_runs"
    strategy_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("strategies.id", ondelete="RESTRICT"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    stopped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(24), nullable=False, index=True)
    initial_capital: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    final_capital: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    total_trades: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    profit_loss: Mapped[Decimal] = mapped_column(Numeric(20, 8), default=0, nullable=False)
    configuration_snapshot: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)


class AlgoExecutionLog(IdMixin, Base):
    __tablename__ = "algo_execution_logs"
    run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("algo_runs.id", ondelete="CASCADE"), index=True)
    level: Mapped[str] = mapped_column(String(16), nullable=False)
    event: Mapped[str] = mapped_column(String(64), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class RiskProfile(IdMixin, TimestampMixin, Base):
    __tablename__ = "risk_profiles"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    portfolio_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)


class RiskLimit(IdMixin, TimestampMixin, Base):
    __tablename__ = "risk_limits"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    portfolio_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    max_position_size: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    max_order_value: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    max_daily_loss: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    max_drawdown: Mapped[Decimal | None] = mapped_column(Numeric(12, 8))
    max_exposure: Mapped[Decimal | None] = mapped_column(Numeric(12, 8))
    max_open_positions: Mapped[int | None] = mapped_column(Integer)
    max_trades_per_day: Mapped[int | None] = mapped_column(Integer)


class RiskRule(IdMixin, TimestampMixin, Base):
    __tablename__ = "risk_rules"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    portfolio_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("portfolios.id", ondelete="CASCADE"), index=True)
    rule_type: Mapped[str] = mapped_column(String(48), nullable=False)
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class RiskEvent(IdMixin, Base):
    __tablename__ = "risk_events"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    portfolio_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("portfolios.id", ondelete="SET NULL"))
    order_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("orders.id", ondelete="SET NULL"), index=True)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    observed_value: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    limit_value: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class BacktestRun(IdMixin, Base):
    __tablename__ = "backtest_runs"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    strategy_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("strategies.id", ondelete="SET NULL"), index=True)
    name: Mapped[str | None] = mapped_column(String(120))
    symbol: Mapped[str] = mapped_column(String(32), nullable=False)
    timeframe: Mapped[str] = mapped_column(String(12), nullable=False)
    start_date: Mapped[Date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Date] = mapped_column(Date, nullable=False)
    initial_capital: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    commission: Mapped[Decimal] = mapped_column(Numeric(12, 8), default=0, nullable=False)
    slippage: Mapped[Decimal] = mapped_column(Numeric(12, 8), default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="queued", nullable=False, index=True)
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class BacktestMetric(IdMixin, Base):
    __tablename__ = "backtest_metrics"
    backtest_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("backtest_runs.id", ondelete="CASCADE"), unique=True)
    values: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)


class BacktestTrade(IdMixin, Base):
    __tablename__ = "backtest_trades"
    backtest_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("backtest_runs.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(32), nullable=False)
    side: Mapped[str] = mapped_column(String(8), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(24, 8), nullable=False)
    entry_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    exit_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    entry_price: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    exit_price: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    pnl: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    details: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)


class BrokerSession(IdMixin, Base):
    __tablename__ = "broker_sessions"
    broker_account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("broker_accounts.id", ondelete="CASCADE"), index=True)
    session_token_ciphertext: Mapped[str] = mapped_column(Text, nullable=False)
    key_id: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class BrokerError(IdMixin, Base):
    __tablename__ = "broker_errors"
    broker_account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("broker_accounts.id", ondelete="CASCADE"), index=True)
    error_code: Mapped[str | None] = mapped_column(String(64))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    details: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class BacktestEquityPoint(IdMixin, Base):
    __tablename__ = "backtest_equity_curve"
    backtest_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("backtest_runs.id", ondelete="CASCADE"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    equity: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    cash: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    position_value: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    drawdown: Mapped[Decimal] = mapped_column(Numeric(12, 8), nullable=False)
    __table_args__ = (UniqueConstraint("backtest_id", "timestamp"),)


class BacktestPosition(IdMixin, Base):
    __tablename__ = "backtest_positions"
    backtest_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("backtest_runs.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(32), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(24, 8), nullable=False)
    average_price: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    marked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class MLModel(IdMixin, TimestampMixin, Base):
    __tablename__ = "ml_models"
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    model_type: Mapped[str] = mapped_column(String(48), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    task_type: Mapped[str] = mapped_column(String(48), nullable=False)
    framework: Mapped[str | None] = mapped_column(String(48))
    status: Mapped[str] = mapped_column(String(24), default="development", nullable=False)


class MLModelVersion(IdMixin, Base):
    __tablename__ = "ml_model_versions"
    model_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ml_models.id", ondelete="RESTRICT"), index=True)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    artifact_uri: Mapped[str | None] = mapped_column(String(2048))
    feature_version: Mapped[str | None] = mapped_column(String(64))
    hyperparameters: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    metrics: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (UniqueConstraint("model_id", "version"),)


class TrainingRun(IdMixin, Base):
    __tablename__ = "training_runs"
    model_version_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ml_model_versions.id", ondelete="RESTRICT"), index=True)
    dataset_uri: Mapped[str | None] = mapped_column(String(2048))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(24), nullable=False, index=True)
    parameters: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    metrics: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    logs_uri: Mapped[str | None] = mapped_column(String(2048))


class MLDataset(IdMixin, TimestampMixin, Base):
    __tablename__ = "ml_datasets"
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    artifact_uri: Mapped[str] = mapped_column(String(2048), nullable=False)
    schema_definition: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    __table_args__ = (UniqueConstraint("name", "version"),)


class MLFeature(IdMixin, Base):
    __tablename__ = "ml_features"
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    feature_type: Mapped[str] = mapped_column(String(48), nullable=False)
    definition: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    version: Mapped[str] = mapped_column(String(32), nullable=False)


class MLExperiment(IdMixin, Base):
    __tablename__ = "ml_experiments"
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    model_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ml_models.id", ondelete="RESTRICT"), index=True)
    dataset_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("ml_datasets.id", ondelete="SET NULL"))
    parameters: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    metrics: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ModelDeployment(IdMixin, TimestampMixin, Base):
    __tablename__ = "model_deployments"
    model_version_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ml_model_versions.id", ondelete="RESTRICT"), index=True)
    environment: Mapped[str] = mapped_column(String(24), nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    endpoint: Mapped[str | None] = mapped_column(String(2048))
    deployed_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))


class PredictionResult(IdMixin, Base):
    __tablename__ = "prediction_results"
    prediction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("predictions.id", ondelete="CASCADE"), unique=True)
    actual_price: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    actual_return: Mapped[Decimal | None] = mapped_column(Numeric(12, 8))
    evaluated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_correct: Mapped[bool | None] = mapped_column(Boolean)


class Prediction(IdMixin, Base):
    __tablename__ = "predictions"
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="RESTRICT"), index=True)
    model_version_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ml_model_versions.id", ondelete="RESTRICT"), index=True)
    timeframe: Mapped[str] = mapped_column(String(12), nullable=False)
    prediction_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    target_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    current_price: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    predicted_price: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    expected_return: Mapped[Decimal] = mapped_column(Numeric(12, 8), nullable=False)
    lower_bound: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    upper_bound: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    confidence: Mapped[Decimal] = mapped_column(Numeric(8, 7), nullable=False)
    direction: Mapped[str] = mapped_column(String(16), nullable=False)
    explanation: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class NewsSource(IdMixin, Base):
    __tablename__ = "news_sources"
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    url: Mapped[str | None] = mapped_column(String(2048))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class NewsArticle(IdMixin, Base):
    __tablename__ = "news_articles"
    source_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("news_sources.id", ondelete="SET NULL"), index=True)
    external_id: Mapped[str | None] = mapped_column(String(255), unique=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    content: Mapped[str | None] = mapped_column(Text)
    url: Mapped[str] = mapped_column(String(2048), unique=True, nullable=False)
    author: Mapped[str | None] = mapped_column(String(255))
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    language: Mapped[str | None] = mapped_column(String(12))
    category: Mapped[str | None] = mapped_column(String(64))
    image_url: Mapped[str | None] = mapped_column(String(2048))


class NewsArticleStock(Base):
    __tablename__ = "news_article_stocks"
    article_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("news_articles.id", ondelete="CASCADE"), primary_key=True)
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), primary_key=True)
    relevance: Mapped[Decimal | None] = mapped_column(Numeric(8, 7))


class NewsCategory(IdMixin, Base):
    __tablename__ = "news_categories"
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)


class NewsTag(IdMixin, Base):
    __tablename__ = "news_tags"
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)


class NewsArticleTag(Base):
    __tablename__ = "news_article_tags"
    article_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("news_articles.id", ondelete="CASCADE"), primary_key=True)
    tag_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("news_tags.id", ondelete="CASCADE"), primary_key=True)


class ArticleSentiment(IdMixin, Base):
    __tablename__ = "article_sentiments"
    article_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("news_articles.id", ondelete="CASCADE"), index=True)
    model_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("ml_models.id", ondelete="SET NULL"))
    sentiment: Mapped[str] = mapped_column(String(16), nullable=False)
    positive_score: Mapped[Decimal] = mapped_column(Numeric(8, 7), nullable=False)
    negative_score: Mapped[Decimal] = mapped_column(Numeric(8, 7), nullable=False)
    neutral_score: Mapped[Decimal] = mapped_column(Numeric(8, 7), nullable=False)
    confidence: Mapped[Decimal] = mapped_column(Numeric(8, 7), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class StockSentiment(IdMixin, Base):
    __tablename__ = "stock_sentiments"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), index=True)
    timeframe: Mapped[str] = mapped_column(String(12), nullable=False)
    as_of: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    score: Mapped[Decimal] = mapped_column(Numeric(8, 7), nullable=False)
    sample_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    components: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    __table_args__ = (UniqueConstraint("stock_id", "timeframe", "as_of"),)


class SentimentFeature(IdMixin, Base):
    __tablename__ = "sentiment_features"
    stock_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stocks.id", ondelete="CASCADE"), index=True)
    feature_name: Mapped[str] = mapped_column(String(100), nullable=False)
    feature_value: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    __table_args__ = (UniqueConstraint("stock_id", "feature_name", "computed_at"),)


class Alert(IdMixin, TimestampMixin, Base):
    __tablename__ = "alerts"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    stock_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("stocks.id", ondelete="SET NULL"), index=True)
    alert_type: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    condition: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    triggered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class AlertEvent(IdMixin, Base):
    __tablename__ = "alert_events"
    alert_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("alerts.id", ondelete="RESTRICT"), index=True)
    observed_value: Mapped[Decimal | None] = mapped_column(Numeric(20, 8))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Notification(IdMixin, Base):
    __tablename__ = "notifications"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    notification_type: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(16), default="normal", nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class NotificationPreference(IdMixin, TimestampMixin, Base):
    __tablename__ = "notification_preferences"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    channel: Mapped[str] = mapped_column(String(24), nullable=False)
    notification_type: Mapped[str] = mapped_column(String(32), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    __table_args__ = (UniqueConstraint("user_id", "channel", "notification_type"),)


class NotificationTemplate(IdMixin, TimestampMixin, Base):
    __tablename__ = "notification_templates"
    key: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    channel: Mapped[str] = mapped_column(String(24), nullable=False)
    subject_template: Mapped[str | None] = mapped_column(Text)
    body_template: Mapped[str] = mapped_column(Text, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class NotificationDelivery(IdMixin, Base):
    __tablename__ = "notification_deliveries"
    notification_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("notifications.id", ondelete="CASCADE"), index=True)
    channel: Mapped[str] = mapped_column(String(24), nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    provider_reference: Mapped[str | None] = mapped_column(String(255))
    error_message: Mapped[str | None] = mapped_column(Text)
    attempted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Broker(IdMixin, Base):
    __tablename__ = "brokers"
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    broker_type: Mapped[str] = mapped_column(String(32), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)


class BrokerAccount(IdMixin, TimestampMixin, Base):
    __tablename__ = "broker_accounts"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    broker_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("brokers.id", ondelete="RESTRICT"), index=True)
    account_identifier: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    environment: Mapped[str] = mapped_column(String(16), default="paper", nullable=False)
    __table_args__ = (UniqueConstraint("user_id", "broker_id", "account_identifier"),)


class BrokerCredential(IdMixin, Base):
    __tablename__ = "broker_credentials"
    broker_account_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("broker_accounts.id", ondelete="CASCADE"), unique=True
    )
    ciphertext: Mapped[str] = mapped_column(Text, nullable=False)
    key_id: Mapped[str] = mapped_column(String(64), nullable=False)
    nonce: Mapped[str] = mapped_column(String(128), nullable=False)
    rotated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class BrokerSyncLog(IdMixin, Base):
    __tablename__ = "broker_sync_logs"
    broker_account_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("broker_accounts.id", ondelete="CASCADE"), index=True)
    operation: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    details: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)


class AIConversation(IdMixin, TimestampMixin, Base):
    __tablename__ = "ai_conversations"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str | None] = mapped_column(String(200))
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class AIMessage(IdMixin, Base):
    __tablename__ = "ai_messages"
    conversation_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ai_conversations.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(24), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    model: Mapped[str | None] = mapped_column(String(120))
    input_tokens: Mapped[int | None] = mapped_column(Integer)
    output_tokens: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AIToolCall(IdMixin, Base):
    __tablename__ = "ai_tool_calls"
    message_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ai_messages.id", ondelete="CASCADE"), index=True)
    tool_name: Mapped[str] = mapped_column(String(120), nullable=False)
    arguments: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    result: Mapped[dict[str, Any] | None] = mapped_column(JSON_VALUE)
    execution_time_ms: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AIMessageFeedback(IdMixin, Base):
    __tablename__ = "ai_message_feedback"
    message_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ai_messages.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Report(IdMixin, Base):
    __tablename__ = "reports"
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    report_type: Mapped[str] = mapped_column(String(48), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    parameters: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ReportGeneration(IdMixin, Base):
    __tablename__ = "report_generations"
    report_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    file_uri: Mapped[str | None] = mapped_column(String(2048))
    error_message: Mapped[str | None] = mapped_column(Text)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ReportTemplate(IdMixin, TimestampMixin, Base):
    __tablename__ = "report_templates"
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    report_type: Mapped[str] = mapped_column(String(48), nullable=False)
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)


class ReportFile(IdMixin, Base):
    __tablename__ = "report_files"
    generation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("report_generations.id", ondelete="CASCADE"), index=True
    )
    storage_uri: Mapped[str] = mapped_column(String(2048), nullable=False)
    content_type: Mapped[str] = mapped_column(String(120), nullable=False)
    checksum_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ActivityLog(IdMixin, Base):
    __tablename__ = "activity_logs"
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    entity_type: Mapped[str | None] = mapped_column(String(80))
    entity_id: Mapped[str | None] = mapped_column(String(128))
    request_id: Mapped[str | None] = mapped_column(String(64), index=True)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(String(512))
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)


class AuditLog(IdMixin, Base):
    __tablename__ = "audit_logs"
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    actor_type: Mapped[str] = mapped_column(String(24), default="user", nullable=False)
    action: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    entity_type: Mapped[str | None] = mapped_column(String(80), index=True)
    entity_id: Mapped[str | None] = mapped_column(String(128), index=True)
    old_values: Mapped[dict[str, Any] | None] = mapped_column(JSON_VALUE)
    new_values: Mapped[dict[str, Any] | None] = mapped_column(JSON_VALUE)
    request_id: Mapped[str | None] = mapped_column(String(64), index=True)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(String(512))
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)


class AdminAction(IdMixin, Base):
    __tablename__ = "admin_actions"
    admin_user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    target_type: Mapped[str] = mapped_column(String(80), nullable=False)
    target_id: Mapped[str] = mapped_column(String(128), nullable=False)
    reason: Mapped[str | None] = mapped_column(Text)
    details: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class SystemSetting(IdMixin, TimestampMixin, Base):
    __tablename__ = "system_settings"
    key: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    value: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    is_secret: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class FeatureFlag(IdMixin, TimestampMixin, Base):
    __tablename__ = "feature_flags"
    key: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    rollout_percent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    __table_args__ = (CheckConstraint("rollout_percent BETWEEN 0 AND 100"),)


class SystemEvent(IdMixin, Base):
    __tablename__ = "system_events"
    service: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    event_type: Mapped[str] = mapped_column(String(120), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    details: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class ServiceHealth(IdMixin, Base):
    __tablename__ = "service_health"
    service: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    latency_ms: Mapped[int | None] = mapped_column(Integer)
    details: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)


class ApiLog(IdMixin, Base):
    __tablename__ = "api_logs"
    request_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    method: Mapped[str] = mapped_column(String(10), nullable=False)
    path: Mapped[str] = mapped_column(String(2048), nullable=False)
    status_code: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)


class ErrorLog(IdMixin, Base):
    __tablename__ = "error_logs"
    request_id: Mapped[str | None] = mapped_column(String(64), index=True)
    error_type: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    stack_trace: Mapped[str | None] = mapped_column(Text)
    context: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PerformanceMetric(IdMixin, Base):
    __tablename__ = "performance_metrics"
    metric_name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    value: Mapped[Decimal] = mapped_column(Numeric(20, 8), nullable=False)
    dimensions: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)


class DataSource(IdMixin, TimestampMixin, Base):
    __tablename__ = "data_sources"
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    source_type: Mapped[str] = mapped_column(String(48), nullable=False)
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class DataIngestionRun(IdMixin, Base):
    __tablename__ = "data_ingestion_runs"
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("data_sources.id", ondelete="RESTRICT"), index=True)
    dataset: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False, index=True)
    records_read: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_written: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    details: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)


class DataIngestionLog(IdMixin, Base):
    __tablename__ = "data_ingestion_logs"
    run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("data_ingestion_runs.id", ondelete="CASCADE"), index=True)
    level: Mapped[str] = mapped_column(String(16), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    record_reference: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class DataQualityCheck(IdMixin, Base):
    __tablename__ = "data_quality_checks"
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("data_sources.id", ondelete="RESTRICT"), index=True)
    dataset: Mapped[str] = mapped_column(String(120), nullable=False)
    check_name: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False)
    result: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class DataCorrection(IdMixin, Base):
    __tablename__ = "data_corrections"
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("data_sources.id", ondelete="RESTRICT"), index=True)
    dataset: Mapped[str] = mapped_column(String(120), nullable=False)
    record_key: Mapped[str] = mapped_column(String(255), nullable=False)
    old_values: Mapped[dict[str, Any] | None] = mapped_column(JSON_VALUE)
    new_values: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    corrected_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    corrected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class DataSyncStatus(IdMixin, TimestampMixin, Base):
    __tablename__ = "data_sync_status"
    source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("data_sources.id", ondelete="CASCADE"), index=True)
    dataset: Mapped[str] = mapped_column(String(120), nullable=False)
    cursor: Mapped[str | None] = mapped_column(String(512))
    last_success_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_error: Mapped[str | None] = mapped_column(Text)
    __table_args__ = (UniqueConstraint("source_id", "dataset"),)


class Job(IdMixin, TimestampMixin, Base):
    __tablename__ = "jobs"
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    job_type: Mapped[str] = mapped_column(String(64), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="queued", nullable=False, index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class JobRun(IdMixin, Base):
    __tablename__ = "job_runs"
    job_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), index=True)
    attempt: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False, index=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    result: Mapped[dict[str, Any] | None] = mapped_column(JSON_VALUE)
    error_message: Mapped[str | None] = mapped_column(Text)
    __table_args__ = (UniqueConstraint("job_id", "attempt"),)


class ScheduledJob(IdMixin, TimestampMixin, Base):
    __tablename__ = "scheduled_jobs"
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    job_type: Mapped[str] = mapped_column(String(64), nullable=False)
    cron_expression: Mapped[str] = mapped_column(String(120), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON_VALUE, default=dict, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    next_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)


class JobFailure(IdMixin, Base):
    __tablename__ = "job_failures"
    job_run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("job_runs.id", ondelete="CASCADE"), index=True)
    error_type: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    stack_trace: Mapped[str | None] = mapped_column(Text)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
