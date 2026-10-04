from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class BacktestResult(BaseModel):
    id: str
    strategy: str
    start_date: str
    end_date: str
    net_return: float
    sharpe_ratio: float
    max_drawdown: float


RESULTS: list[BacktestResult] = [
    BacktestResult(
        id="bt-1",
        strategy="Momentum Breakout",
        start_date="2025-01-01",
        end_date="2025-12-31",
        net_return=0.218,
        sharpe_ratio=1.42,
        max_drawdown=0.18,
    ),
]


@router.get("", response_model=list[BacktestResult])
def list_backtests() -> list[BacktestResult]:
    return RESULTS


@router.get("/summary")
def get_backtest_summary() -> dict[str, float]:
    return {"average_return": 0.214, "average_sharpe": 1.38, "average_drawdown": 0.16}
