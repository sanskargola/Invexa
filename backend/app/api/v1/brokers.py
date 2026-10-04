from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class Broker(BaseModel):
    id: str
    name: str
    status: str
    type: str


BROKERS: list[Broker] = [
    Broker(id="broker-1", name="Interactive Brokers", status="connected", type="brokerage"),
    Broker(id="broker-2", name="Paper Trading", status="demo", type="simulated"),
]


@router.get("", response_model=list[Broker])
def list_brokers() -> list[Broker]:
    return BROKERS


@router.get("/status")
def broker_status() -> dict[str, object]:
    return {"connected": 1, "demo_mode": True, "last_sync": "2026-10-04T09:45:00Z"}
