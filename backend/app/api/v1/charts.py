from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ChartPoint(BaseModel):
    time: str
    value: float


class ChartSeries(BaseModel):
    symbol: str
    points: list[ChartPoint]


@router.get("/candles/{symbol}", response_model=ChartSeries)
def get_chart_data(symbol: str) -> ChartSeries:
    data = [
        ChartPoint(time="2026-10-04T09:30:00Z", value=184.2),
        ChartPoint(time="2026-10-04T09:35:00Z", value=184.7),
        ChartPoint(time="2026-10-04T09:40:00Z", value=185.1),
        ChartPoint(time="2026-10-04T09:45:00Z", value=185.8),
    ]
    return ChartSeries(symbol=symbol.upper(), points=data)
