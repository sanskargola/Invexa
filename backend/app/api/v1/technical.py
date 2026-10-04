from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class TechnicalIndicators(BaseModel):
    symbol: str
    rsi: float
    macd: float
    moving_average_20: float
    moving_average_50: float


@router.get("/{symbol}", response_model=TechnicalIndicators)
def get_technical_indicator(symbol: str) -> TechnicalIndicators:
    return TechnicalIndicators(
        symbol=symbol.upper(),
        rsi=63.4,
        macd=2.12,
        moving_average_20=211.7,
        moving_average_50=206.8,
    )
