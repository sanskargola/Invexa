from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class FundamentalSnapshot(BaseModel):
    symbol: str
    pe_ratio: float
    market_cap: float
    revenue_growth: float
    profit_margin: float


@router.get("/{symbol}", response_model=FundamentalSnapshot)
def get_fundamentals(symbol: str) -> FundamentalSnapshot:
    return FundamentalSnapshot(
        symbol=symbol.upper(),
        pe_ratio=22.4,
        market_cap=3_200_000_000,
        revenue_growth=0.14,
        profit_margin=0.21,
    )
