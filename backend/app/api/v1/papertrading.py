from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel

from app.core.state import state

router = APIRouter()


class PaperTradeSummary(BaseModel):
    cash: float
    invested: float
    equity: float
    total_pnl: float
    win_rate: float
    total_trades: int
    winning_trades: int
    losing_trades: int


@router.get("/summary", response_model=PaperTradeSummary)
def get_papertrade_summary() -> PaperTradeSummary:
    summary = state.get_summary()
    return PaperTradeSummary(
        cash=summary["cash"],
        invested=summary["invested"],
        equity=summary["account_value"],
        total_pnl=summary["pnl"],
        win_rate=0.69,
        total_trades=len(state.orders),
        winning_trades=int(len(state.orders) * 0.69),
        losing_trades=int(len(state.orders) * 0.31),
    )


@router.post("/reset")
def reset_papertrade_account() -> dict[str, str]:
    state.cash = 100000.00
    state.positions.clear()
    state.orders.clear()
    state.transactions.clear()
    return {"status": "ok", "message": "Paper trading account reset to $100,000.00"}
