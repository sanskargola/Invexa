from fastapi.concurrency import run_in_threadpool
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.market_data import get_technicals

router = APIRouter()


class TechnicalIndicators(BaseModel):
    symbol: str
    rsi: float
    macd: float
    moving_average_20: float
    moving_average_50: float
    last_price: float = 0
    trend: str = "Neutral"


@router.get("/{symbol}", response_model=TechnicalIndicators)
async def get_technical_indicator(symbol: str) -> TechnicalIndicators:
    try:
        return TechnicalIndicators(**(await run_in_threadpool(get_technicals, symbol)))
    except LookupError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(error)) from error
