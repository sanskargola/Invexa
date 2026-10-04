from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PaperTradeSummary(BaseModel):
    cash: float
    invested: float
    equity: float
    wins: int
    losses: int


@router.get("/summary", response_model=PaperTradeSummary)
def get_papertrade_summary() -> PaperTradeSummary:
    return PaperTradeSummary(cash=28640.11, invested=34500.0, equity=63140.11, wins=18, losses=8)
