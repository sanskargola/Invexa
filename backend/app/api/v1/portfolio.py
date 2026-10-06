from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel

from app.core.state import state

router = APIRouter()


class PortfolioSummary(BaseModel):
    account_value: float
    cash: float
    invested: float
    pnl: float
    daily_return: float
    allocation: dict[str, float]


class PerformancePoint(BaseModel):
    date: str
    value: float
    benchmark: float


class AllocationItem(BaseModel):
    name: str
    value: float
    percentage: float
    color: str


class TransactionItem(BaseModel):
    id: str
    date: str
    type: str
    symbol: str
    amount: float
    shares: int
    price: float
    fee: float


@router.get("/summary", response_model=PortfolioSummary)
def get_portfolio_summary() -> PortfolioSummary:
    return PortfolioSummary(**state.get_summary())


@router.get("/performance", response_model=list[PerformancePoint])
def get_portfolio_performance() -> list[PerformancePoint]:
    # 30-day realistic equity curve progression
    history = [
        {"date": "2026-09-08", "value": 98200.0, "benchmark": 98200.0},
        {"date": "2026-09-12", "value": 99450.0, "benchmark": 98900.0},
        {"date": "2026-09-16", "value": 101200.0, "benchmark": 99600.0},
        {"date": "2026-09-20", "value": 100800.0, "benchmark": 100100.0},
        {"date": "2026-09-24", "value": 103400.0, "benchmark": 100900.0},
        {"date": "2026-09-28", "value": 105800.0, "benchmark": 101400.0},
        {"date": "2026-10-02", "value": 107950.0, "benchmark": 102100.0},
        {"date": "2026-10-06", "value": state.get_summary()["account_value"], "benchmark": 102800.0},
    ]
    return [PerformancePoint(**p) for p in history]


@router.get("/allocation", response_model=list[AllocationItem])
def get_portfolio_allocation() -> list[AllocationItem]:
    summary = state.get_summary()
    tot = summary["account_value"] or 1.0

    colors = {
        "NVDA": "#a8c55a",
        "AAPL": "#78a9d2",
        "MSFT": "#d58e6c",
        "AMZN": "#d5bd73",
        "Cash": "#4ade80",
    }

    allocations: list[AllocationItem] = []
    for symbol, pos in state.positions.items():
        val = pos["market_value"]
        allocations.append(
            AllocationItem(
                name=symbol,
                value=val,
                percentage=round((val / tot * 100), 1),
                color=colors.get(symbol, "#60a5fa"),
            )
        )

    allocations.append(
        AllocationItem(
            name="Cash Reserve",
            value=summary["cash"],
            percentage=round((summary["cash"] / tot * 100), 1),
            color="#38bdf8",
        )
    )

    return allocations


@router.get("/transactions", response_model=list[TransactionItem])
def get_transactions() -> list[TransactionItem]:
    return [TransactionItem(**t) for t in state.transactions]
