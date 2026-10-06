from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.state import state

router = APIRouter()


class RiskMetrics(BaseModel):
    value_at_risk: float
    max_drawdown: float
    exposure: float
    beta: float
    sharpe_ratio: float
    volatility_annualized: float
    stress_test_market_crash: float
    stress_test_rate_hike: float


@router.get("/summary", response_model=RiskMetrics)
def get_risk_summary() -> RiskMetrics:
    summary = state.get_summary()
    equity = summary["account_value"] or 100000.0
    var_95 = round(-equity * 0.021, 2)
    return RiskMetrics(
        value_at_risk=var_95,
        max_drawdown=0.084,
        exposure=round(summary["invested"] / equity, 2) if equity else 0.0,
        beta=1.14,
        sharpe_ratio=1.84,
        volatility_annualized=0.142,
        stress_test_market_crash=round(-equity * 0.125, 2),
        stress_test_rate_hike=round(-equity * 0.048, 2),
    )
