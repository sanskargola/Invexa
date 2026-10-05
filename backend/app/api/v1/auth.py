from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class RegisterPayload(BaseModel):
    name: str
    email: str
    password: str


class LoginPayload(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthUser(BaseModel):
    id: str
    name: str
    email: str


@router.post("/register", response_model=AuthUser, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterPayload) -> AuthUser:
    return AuthUser(id="user-1001", name=payload.name, email=payload.email)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginPayload) -> TokenResponse:
    if payload.email and payload.password:
        return TokenResponse(access_token="demo-token", token_type="bearer")
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")


@router.get("/me", response_model=AuthUser)
def me() -> AuthUser:
    return AuthUser(id="user-1001", name="Demo Investor", email="demo@invexia.local")


@router.post("/logout")
def logout() -> dict[str, str]:
    return {"status": "ok", "message": "Logged out successfully"}
