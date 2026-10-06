from __future__ import annotations

from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.core.state import state

router = APIRouter()


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    timezone: str = "UTC"
    currency: str = "USD"
    role: str = "admin"
    created_at: str = "2026-01-10T00:00:00Z"
    bio: Optional[str] = None
    two_factor_enabled: bool = True
    notifications_email: bool = True
    notifications_push: bool = True
    risk_profile: str = "Growth"


class UpdateProfilePayload(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    timezone: Optional[str] = None
    currency: Optional[str] = None
    bio: Optional[str] = None
    two_factor_enabled: Optional[bool] = None
    notifications_email: Optional[bool] = None
    notifications_push: Optional[bool] = None
    risk_profile: Optional[str] = None


@router.get("/me", response_model=UserProfile)
def get_me() -> UserProfile:
    return UserProfile(**state.user_profile)


@router.put("/me", response_model=UserProfile)
def update_me(payload: UpdateProfilePayload) -> UserProfile:
    data = payload.model_dump(exclude_unset=True)
    state.user_profile.update(data)
    return UserProfile(**state.user_profile)


@router.get("", response_model=list[UserProfile])
def list_users() -> list[UserProfile]:
    return [
        UserProfile(**state.user_profile),
        UserProfile(
            id="user-1002",
            name="Alex Mercer",
            email="alex@quantfund.io",
            timezone="America/New_York",
            role="trader",
            created_at="2026-02-14T00:00:00Z",
            bio="Systematic algorithmic trader specialized in momentum.",
        ),
        UserProfile(
            id="user-1003",
            name="Elena Rostova",
            email="elena@hedgealpha.ch",
            timezone="Europe/Zurich",
            role="analyst",
            created_at="2026-03-01T00:00:00Z",
            bio="Quantitative analyst focusing on statistical arbitrage.",
        ),
    ]
