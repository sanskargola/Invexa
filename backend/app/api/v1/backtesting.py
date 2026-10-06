from __future__ import annotations

import random
import uuid
from typing import Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter()


class BacktestTrade(BaseModel):
    id: str
    date: str
    symbol: str
    side: str
    entry_price: float
    exit_price: float
    pnl: float
    pnl_percent: float


class BacktestResult(BaseModel):
    id: str
    strategy: str
    symbol: str
    start_date: str
    end_date: str
    initial_capital: float
    final_capital: float
    net_return: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    total_trades: int
    profit_factor: float
    equity_curve: list[dict[str, Any]]
    trades: list[BacktestTrade]


class RunBacktestPayload(BaseModel):
    strategy: str
    symbol: str = "NVDA"
    timeframe: str = "1D"
    initial_capital: float = 100000.0
    start_date: str = "2025-01-01"
    end_date: str = "2026-09-30"


BACKTEST_RESULTS: list[BacktestResult] = [
    BacktestResult(
        id="bt-101",
        strategy="Momentum Breakout Pro",
        symbol="NVDA",
        start_date="2025-01-01",
        end_date="2026-09-30",
        initial_capital=100000.0,
        final_capital=138450.0,
        net_return=0.3845,
        sharpe_ratio=1.84,
        max_drawdown=0.112,
        win_rate=0.69,
        total_trades=48,
        profit_factor=2.45,
        equity_curve=[
            {"date": "2025-01-01", "equity": 100000.0},
            {"date": "2025-04-01", "equity": 108500.0},
            {"date": "2025-08-01", "equity": 119200.0},
            {"date": "2025-12-31", "equity": 126400.0},
            {"date": "2026-05-01", "equity": 132100.0},
            {"date": "2026-09-30", "equity": 138450.0},
        ],
        trades=[
            BacktestTrade(
                id="T-1",
                date="2026-08-10",
                symbol="NVDA",
                side="Buy",
                entry_price=124.50,
                exit_price=138.20,
                pnl=4110.0,
                pnl_percent=11.0,
            ),
            BacktestTrade(
                id="T-2",
                date="2026-08-28",
                symbol="NVDA",
                side="Buy",
                entry_price=135.00,
                exit_price=142.10,
                pnl=2130.0,
                pnl_percent=5.26,
            ),
            BacktestTrade(
                id="T-3",
                date="2026-09-15",
                symbol="NVDA",
                side="Buy",
                entry_price=144.20,
                exit_price=140.50,
                pnl=-1110.0,
                pnl_percent=-2.57,
            ),
        ],
    ),
]


@router.get("", response_model=list[BacktestResult])
def list_backtests() -> list[BacktestResult]:
    return BACKTEST_RESULTS


@router.get("/summary")
def get_backtest_summary() -> dict[str, float]:
    return {
        "average_return": 0.312,
        "average_sharpe": 1.76,
        "average_drawdown": 0.105,
        "win_rate": 0.67,
    }


@router.post("/run", response_model=BacktestResult, status_code=status.HTTP_201_CREATED)
def run_backtest(payload: RunBacktestPayload) -> BacktestResult:
    bt_id = f"bt-{uuid.uuid4().hex[:6]}"
    rng = random.Random(hash(f"{payload.strategy}:{payload.symbol}"))
    net_ret = round(rng.uniform(0.18, 0.44), 4)
    final_cap = round(payload.initial_capital * (1 + net_ret), 2)
    sharpe = round(rng.uniform(1.4, 2.3), 2)
    dd = round(rng.uniform(0.06, 0.15), 3)
    win_rt = round(rng.uniform(0.60, 0.76), 2)
    trades_n = rng.randint(35, 75)

    curve: list[dict[str, Any]] = []
    points = 6
    step = (final_cap - payload.initial_capital) / points
    dates = ["2025-01-01", "2025-05-01", "2025-09-01", "2026-01-01", "2026-05-01", payload.end_date]
    for idx, d in enumerate(dates):
        cap = round(payload.initial_capital + (step * idx) + rng.uniform(-1500, 1500), 2)
        if idx == points - 1:
            cap = final_cap
        curve.append({"date": d, "equity": cap})

    trades: list[BacktestTrade] = [
        BacktestTrade(
            id=f"T-{i+1}",
            date=f"2026-0{min(9, i+1)}-15",
            symbol=payload.symbol.upper(),
            side="Buy",
            entry_price=round(rng.uniform(110, 180), 2),
            exit_price=round(rng.uniform(120, 200), 2),
            pnl=round(rng.uniform(-800, 3200), 2),
            pnl_percent=round(rng.uniform(-3.5, 12.5), 2),
        )
        for i in range(5)
    ]

    res = BacktestResult(
        id=bt_id,
        strategy=payload.strategy,
        symbol=payload.symbol.upper(),
        start_date=payload.start_date,
        end_date=payload.end_date,
        initial_capital=payload.initial_capital,
        final_capital=final_cap,
        net_return=net_ret,
        sharpe_ratio=sharpe,
        max_drawdown=dd,
        win_rate=win_rt,
        total_trades=trades_n,
        profit_factor=round(rng.uniform(1.8, 2.9), 2),
        equity_curve=curve,
        trades=trades,
    )
    BACKTEST_RESULTS.insert(0, res)
    return res


@router.get("/{backtest_id}", response_model=BacktestResult)
def get_backtest(backtest_id: str) -> BacktestResult:
    for bt in BACKTEST_RESULTS:
        if bt.id == backtest_id:
            return bt
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backtest result not found")
