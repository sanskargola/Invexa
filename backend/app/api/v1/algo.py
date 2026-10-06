from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel

from app.core.state import state

router = APIRouter()


class AlgoStatus(BaseModel):
    id: str
    name: str
    state: str
    health: float
    last_run: str
    symbols: list[str]


@router.get("", response_model=list[AlgoStatus])
def list_algorithms() -> list[AlgoStatus]:
    return [
        AlgoStatus(
            id=s["id"],
            name=s["name"],
            state="running" if s["status"] == "active" else "idle",
            health=0.98 if s["status"] == "active" else 0.85,
            last_run="2026-10-06T14:45:00Z",
            symbols=s.get("symbols", ["NVDA"]),
        )
        for s in state.strategies
    ]


@router.get("/summary")
def get_algo_summary() -> dict[str, Any]:
    active_count = sum(1 for s in state.strategies if s["status"] == "active")
    total = len(state.strategies)
    return {
        "total_algorithms": total,
        "running": active_count,
        "average_health": 0.94 if total else 0.0,
        "total_trades_today": 24,
        "execution_latency_ms": 1.42,
    }
