from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ReportSummary(BaseModel):
    title: str
    period: str
    value: float
    benchmark: float


@router.get("/performance", response_model=list[ReportSummary])
def get_performance_report() -> list[ReportSummary]:
    return [
        ReportSummary(title="Portfolio return", period="YTD", value=0.185, benchmark=0.121),
        ReportSummary(title="Sharpe ratio", period="YTD", value=1.48, benchmark=1.0),
    ]
