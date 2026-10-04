from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SentimentSignal(BaseModel):
    symbol: str
    score: float
    label: str


@router.get("/overview", response_model=list[SentimentSignal])
def get_sentiment_overview() -> list[SentimentSignal]:
    return [
        SentimentSignal(symbol="AAPL", score=0.71, label="Bullish"),
        SentimentSignal(symbol="NVDA", score=0.86, label="Very bullish"),
    ]
