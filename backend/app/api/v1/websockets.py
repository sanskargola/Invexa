from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
def websocket_status() -> dict[str, bool | str]:
    return {"enabled": True, "channel": "market-data"}
