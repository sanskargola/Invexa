from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter()


class AlertItem(BaseModel):
    id: str
    symbol: str
    title: str
    severity: str = Field(default="info")
    message: str
    created_at: str


ALERTS: list[AlertItem] = [
    AlertItem(
        id="alt-101",
        symbol="AAPL",
        title="Price breakout",
        severity="high",
        message="AAPL has moved above its 20-day VWAP and is trending above the prior session high.",
        created_at="2026-10-04T09:30:00Z",
    ),
    AlertItem(
        id="alt-102",
        symbol="NVDA",
        title="Momentum acceleration",
        severity="medium",
        message="Volume surge confirms continuation strength in the last two trading sessions.",
        created_at="2026-10-04T09:15:00Z",
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
def create_alert(item: AlertItem) -> AlertItem:
    ALERTS.append(item)
    return item


@router.patch("/{alert_id}", response_model=AlertItem)
def update_alert(alert_id: str, item: AlertItem) -> AlertItem:
    for index, current in enumerate(ALERTS):
        if current.id == alert_id:
            ALERTS[index] = item
            return item
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(alert_id: str) -> None:
    for index, item in enumerate(ALERTS):
        if item.id == alert_id:
            ALERTS.pop(index)
            return None
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
