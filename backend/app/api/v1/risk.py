from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class RiskMetrics(BaseModel):
    value_at_risk: float
    max_drawdown: float
    exposure: float
    beta: float


@router.get("/summary", response_model=RiskMetrics)
def get_risk_summary() -> RiskMetrics:
    return RiskMetrics(value_at_risk=-2450.31, max_drawdown=0.18, exposure=0.63, beta=1.12)
