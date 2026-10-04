from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class Position(BaseModel):
    symbol: str
    quantity: int
    avg_cost: float
    market_price: float
    pnl: float


POSITIONS: list[Position] = [
    Position(symbol="AAPL", quantity=120, avg_cost=198.5, market_price=214.88, pnl=1960.6),
    Position(symbol="MSFT", quantity=80, avg_cost=440.2, market_price=456.12, pnl=1263.6),
]


@router.get("", response_model=list[Position])
def list_positions() -> list[Position]:
    return POSITIONS
