from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class NotificationItem(BaseModel):
    id: str
    type: str
    title: str
    read: bool
    created_at: str


NOTIFICATIONS: list[NotificationItem] = [
    NotificationItem(id="n-1", type="alert", title="Risk flag for AAPL", read=False, created_at="2026-10-04T09:40:00Z"),
    NotificationItem(id="n-2", type="trade", title="Order executed", read=True, created_at="2026-10-04T09:20:00Z"),
]


@router.get("", response_model=list[NotificationItem])
def list_notifications() -> list[NotificationItem]:
    return NOTIFICATIONS
