from fastapi.concurrency import run_in_threadpool
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.market_data import get_fundamentals

router = APIRouter()


class FundamentalSnapshot(BaseModel):
    symbol: str
    yahoo_symbol: str | None = None
    name: str = ""
    sector: str = ""
    industry: str = ""
    pe_ratio: float
    forward_pe: float = 0
    market_cap: float
    revenue_growth: float
    profit_margin: float
    eps: float = 0
    dividend_yield: float = 0
    beta: float = 0
    fifty_two_week_high: float = 0
    fifty_two_week_low: float = 0
    summary: str = ""


@router.get("/{symbol}", response_model=FundamentalSnapshot)
async def get_fundamentals_snapshot(symbol: str) -> FundamentalSnapshot:
    try:
        return FundamentalSnapshot(**(await run_in_threadpool(get_fundamentals, symbol)))
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(error)) from error
