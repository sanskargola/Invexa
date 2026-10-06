from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter()


class AlertPayload(BaseModel):
    symbol: str
    title: str
    severity: str = Field(default="info")
    message: str
    condition: Optional[str] = "price_above"
    target_value: Optional[float] = None


class AlertItem(BaseModel):
    id: str
    symbol: str
    title: str
    severity: str = "info"
    message: str
    created_at: str
    condition: str = "price_above"
    target_value: Optional[float] = None
    triggered: bool = False


ALERTS: list[AlertItem] = [
    AlertItem(
        id="alt-101",
        symbol="AAPL",
        title="Price Breakout Resistance",
        severity="high",
        message="AAPL has broken through the $230 resistance level with above-average volume.",
        created_at="2026-10-06T09:30:00Z",
        condition="price_above",
        target_value=230.0,
        triggered=True,
    ),
    AlertItem(
        id="alt-102",
        symbol="NVDA",
        title="RSI Overbought Alert",
        severity="medium",
        message="NVDA 14-day RSI crossed above 70 threshold on 4-hour timeframe.",
        created_at="2026-10-06T11:15:00Z",
        condition="rsi_above",
        target_value=70.0,
        triggered=False,
    ),
    AlertItem(
        id="alt-103",
        symbol="TSLA",
        title="Stop Loss Proximity",
        severity="high",
        message="TSLA is trading within 1.5% of trailing stop loss level at $348.",
        created_at="2026-10-05T15:20:00Z",
        condition="price_below",
        target_value=348.0,
        triggered=False,
    ),
]


@router.get("", response_model=list[AlertItem])
def list_alerts() -> list[AlertItem]:
    return ALERTS


@router.get("/{alert_id}", response_model=AlertItem)
def get_alert(alert_id: str) -> AlertItem:
    for item in ALERTS:
        if item.id == alert_id:
            return item
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")


@router.post("", response_model=AlertItem, status_code=status.HTTP_201_CREATED)
def create_alert(payload: AlertPayload) -> AlertItem:
    alert_id = f"alt-{uuid.uuid4().hex[:6]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    new_alert = AlertItem(
        id=alert_id,
        symbol=payload.symbol.upper(),
        title=payload.title,
        severity=payload.severity,
        message=payload.message,
        created_at=now_iso,
        condition=payload.condition or "price_above",
        target_value=payload.target_value,
        triggered=False,
    )
    ALERTS.insert(0, new_alert)
    return new_alert


@router.delete("/{alert_id}", status_code=status.HTTP_200_OK)
def delete_alert(alert_id: str) -> dict[str, str]:
    for index, item in enumerate(ALERTS):
        if item.id == alert_id:
            ALERTS.pop(index)
            return {"status": "ok", "message": f"Alert {alert_id} deleted"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
