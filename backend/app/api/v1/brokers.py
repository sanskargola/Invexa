from __future__ import annotations

import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class Broker(BaseModel):
    id: str
    name: str
    status: str
    type: str
    account_number: str
    connected_at: str


class ConnectBrokerPayload(BaseModel):
    name: str
    api_key: str
    api_secret: str
    environment: str = "paper"


BROKERS: list[Broker] = [
    Broker(
        id="broker-1",
        name="Interactive Brokers",
        status="connected",
        type="live_brokerage",
        account_number="U84729104",
        connected_at="2026-08-10T12:00:00Z",
    ),
    Broker(
        id="broker-2",
        name="Invexa Paper Trading Engine",
        status="active",
        type="simulated",
        account_number="SIM-992014",
        connected_at="2026-01-01T00:00:00Z",
    ),
    Broker(
        id="broker-3",
        name="Alpaca Markets",
        status="disconnected",
        type="live_brokerage",
        account_number="ALP-551029",
        connected_at="2026-05-15T09:30:00Z",
    ),
]


@router.get("", response_model=list[Broker])
def list_brokers() -> list[Broker]:
    return BROKERS


@router.get("/status")
def broker_status() -> dict[str, object]:
    connected_count = sum(1 for b in BROKERS if b.status in ("connected", "active"))
    return {
        "connected_brokers": connected_count,
        "demo_mode": False,
        "primary_gateway": "Interactive Brokers TWS",
        "last_sync": "2026-10-06T14:48:00Z",
        "latency_ms": 14.2,
    }


@router.post("/connect", response_model=Broker, status_code=status.HTTP_201_CREATED)
def connect_broker(payload: ConnectBrokerPayload) -> Broker:
    new_b = Broker(
        id=f"broker-{uuid.uuid4().hex[:6]}",
        name=payload.name,
        status="connected",
        type="live_brokerage" if payload.environment == "live" else "simulated",
        account_number=f"ACC-{uuid.uuid4().hex[:8].upper()}",
        connected_at="2026-10-06T15:00:00Z",
    )
    BROKERS.append(new_b)
    return new_b


@router.post("/{broker_id}/disconnect", status_code=status.HTTP_200_OK)
def disconnect_broker(broker_id: str) -> dict[str, str]:
    for b in BROKERS:
        if b.id == broker_id:
            b.status = "disconnected"
            return {"status": "ok", "message": f"{b.name} disconnected"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Broker not found")
