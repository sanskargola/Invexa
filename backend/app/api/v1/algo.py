from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class AlgoStatus(BaseModel):
    id: str
    name: str
    state: str
    health: float
    last_run: str


ALGORITHMS: list[AlgoStatus] = [
    AlgoStatus(id="algo-1", name="Momentum Breakout", state="running", health=0.97, last_run="2026-10-04T09:41:00Z"),
    AlgoStatus(id="algo-2", name="Mean Reversion", state="idle", health=0.82, last_run="2026-10-04T08:30:00Z"),
]


@router.get("", response_model=list[AlgoStatus])
def list_algorithms() -> list[AlgoStatus]:
    return ALGORITHMS


@router.get("/summary")
def get_algo_summary() -> dict[str, object]:
    return {
        "total_algorithms": len(ALGORITHMS),
        "running": sum(1 for item in ALGORITHMS if item.state == "running"),
        "average_health": round(sum(item.health for item in ALGORITHMS) / len(ALGORITHMS), 2),
    }
