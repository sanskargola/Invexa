from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class Prediction(BaseModel):
    symbol: str
    sentiment: float
    expected_return: float
    confidence: float
    horizon: str


PREDICTIONS: list[Prediction] = [
    Prediction(symbol="AAPL", sentiment=0.74, expected_return=0.07, confidence=0.81, horizon="7d"),
    Prediction(symbol="NVDA", sentiment=0.82, expected_return=0.11, confidence=0.88, horizon="14d"),
]


@router.get("", response_model=list[Prediction])
def list_predictions() -> list[Prediction]:
    return PREDICTIONS
