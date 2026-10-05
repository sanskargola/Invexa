from fastapi.concurrency import run_in_threadpool
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from typing import Literal

from app.services.market_data import TIMEFRAMES, get_candles

router = APIRouter()

Timeframe = Literal["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W", "1M"]


class Candle(BaseModel):
    time: int | str
    open: float
    high: float
    low: float
    close: float
    volume: float = 0


class ChartSeries(BaseModel):
    symbol: str
    yahoo_symbol: str
    tradingview_symbol: str | None = None
    name: str
    exchange: str
    currency: str
    timeframe: str
    last_price: float
    change: float
    percent_change: float
    candles: list[Candle] = Field(default_factory=list)


@router.get("/candles/{symbol}", response_model=ChartSeries)
async def get_chart_data(
    symbol: str,
    timeframe: Timeframe = Query(default="1D", description="Chart interval"),
) -> ChartSeries:
    if timeframe not in TIMEFRAMES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported timeframe")
    try:
        payload = await run_in_threadpool(get_candles, symbol, timeframe)
    except LookupError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Unable to load chart data: {error}") from error
    return ChartSeries(**payload)
