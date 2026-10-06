from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.core.state import state

router = APIRouter()


class Strategy(BaseModel):
    id: str
    name: str
    status: str
    type: str = "Quantitative"
    symbols: list[str] = Field(default_factory=list)
    annual_return: float = 0.0
    win_rate: float = 0.5
    max_drawdown: float = 0.1
    trades_count: int = 0
    created_at: str = "2026-01-01T00:00:00Z"
    description: str = ""


class CreateStrategyPayload(BaseModel):
    name: str
    type: str = "Momentum"
    symbols: list[str] = Field(default_factory=lambda: ["NVDA", "AAPL"])
    description: str = ""
    parameters: dict[str, Any] = Field(default_factory=dict)


@router.get("", response_model=list[Strategy])
def list_strategies() -> list[Strategy]:
    return [Strategy(**s) for s in state.strategies]


@router.post("", response_model=Strategy, status_code=status.HTTP_201_CREATED)
def create_strategy(payload: CreateStrategyPayload) -> Strategy:
    strat_id = f"strat-{uuid.uuid4().hex[:6]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    new_strat = {
        "id": strat_id,
        "name": payload.name,
        "status": "active",
        "type": payload.type,
        "symbols": payload.symbols or ["NVDA"],
        "annual_return": 0.185,
        "win_rate": 0.62,
        "max_drawdown": 0.08,
        "trades_count": 0,
        "created_at": now_iso,
        "description": payload.description or f"Custom strategy for {', '.join(payload.symbols)}",
    }
    state.strategies.append(new_strat)
    return Strategy(**new_strat)


@router.get("/{strategy_id}", response_model=Strategy)
def get_strategy(strategy_id: str) -> Strategy:
    for s in state.strategies:
        if s["id"] == strategy_id:
            return Strategy(**s)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")


@router.post("/{strategy_id}/toggle", response_model=Strategy)
def toggle_strategy(strategy_id: str) -> Strategy:
    for s in state.strategies:
        if s["id"] == strategy_id:
            s["status"] = "paused" if s["status"] == "active" else "active"
            return Strategy(**s)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")


@router.delete("/{strategy_id}", status_code=status.HTTP_200_OK)
def delete_strategy(strategy_id: str) -> dict[str, str]:
    for i, s in enumerate(state.strategies):
        if s["id"] == strategy_id:
            state.strategies.pop(i)
            return {"status": "ok", "message": f"Strategy {strategy_id} deleted"}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Strategy not found")
