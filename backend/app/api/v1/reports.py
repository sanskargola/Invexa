from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel

from app.core.state import state

router = APIRouter()


class ReportSummary(BaseModel):
    id: str
    title: str
    type: str
    period: str
    generated_at: str
    status: str
    file_format: str


class PerformanceMetric(BaseModel):
    title: str
    period: str
    value: float
    benchmark: float


@router.get("", response_model=list[ReportSummary])
def list_reports() -> list[ReportSummary]:
    return [
        ReportSummary(
            id="rep-101",
            title="Q3 2026 Algorithmic Execution Audit",
            type="Performance",
            period="Q3 2026",
            generated_at="2026-10-01T00:00:00Z",
            status="Ready",
            file_format="PDF",
        ),
        ReportSummary(
            id="rep-102",
            title="FY 2025 Realized Capital Gains & Tax Summary",
            type="Tax",
            period="FY 2025",
            generated_at="2026-04-15T00:00:00Z",
            status="Ready",
            file_format="CSV / PDF",
        ),
        ReportSummary(
            id="rep-103",
            title="Portfolio Value at Risk & Stress Testing",
            type="Risk",
            period="Monthly - Sep 2026",
            generated_at="2026-10-02T12:00:00Z",
            status="Ready",
            file_format="PDF",
        ),
    ]


@router.get("/performance", response_model=list[PerformanceMetric])
def get_performance_report() -> list[PerformanceMetric]:
    summary = state.get_summary()
    return [
        PerformanceMetric(title="Portfolio Return (YTD)", period="YTD", value=0.248, benchmark=0.142),
        PerformanceMetric(title="Sharpe Ratio", period="1Y", value=1.84, benchmark=1.10),
        PerformanceMetric(title="Sortino Ratio", period="1Y", value=2.42, benchmark=1.35),
        PerformanceMetric(title="Alpha vs S&P 500", period="1Y", value=0.082, benchmark=0.0),
        PerformanceMetric(title="Information Ratio", period="1Y", value=1.15, benchmark=0.0),
    ]
