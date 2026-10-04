from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PortfolioSummary(BaseModel):
    account_value: float
    cash: float
    invested: float
    pnl: float
    daily_return: float
    allocation: dict[str, float]


@router.get("/summary", response_model=PortfolioSummary)
def get_portfolio_summary() -> PortfolioSummary:
    return PortfolioSummary(
        account_value=128450.32,
        cash=45020.18,
        invested=83430.14,
        pnl=12640.57,
        daily_return=0.0214,
        allocation={"equity": 0.7, "options": 0.15, "cash": 0.15},
    )
