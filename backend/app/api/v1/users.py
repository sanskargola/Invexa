from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    timezone: str = "UTC"


@router.get("/me", response_model=UserProfile)
def get_me() -> UserProfile:
    return UserProfile(id="user-1001", name="Demo Investor", email="demo@invexia.local")
