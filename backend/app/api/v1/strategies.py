from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class Strategy(BaseModel):
    id: str
    name: str
    status: str
    annual_return: float


STRATEGIES: list[Strategy] = [
    Strategy(id="strat-1", name="Momentum Breakout", status="active", annual_return=0.22),
    Strategy(id="strat-2", name="Mean Reversion", status="paused", annual_return=0.14),
]


@router.get("", response_model=list[Strategy])
def list_strategies() -> list[Strategy]:
    return STRATEGIES
