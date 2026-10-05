from fastapi.concurrency import run_in_threadpool
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.market_data import DEFAULT_SYMBOLS, get_sentiment

router = APIRouter()


class SentimentSignal(BaseModel):
    symbol: str
    score: float
    label: str
    percent_change: float = 0
    headline_count: int = 0


@router.get("/overview", response_model=list[SentimentSignal])
async def get_sentiment_overview() -> list[SentimentSignal]:
    signals: list[SentimentSignal] = []
    for symbol in DEFAULT_SYMBOLS[:6]:
        try:
            signals.append(SentimentSignal(**(await run_in_threadpool(get_sentiment, symbol))))
        except Exception:
            continue
    return signals
