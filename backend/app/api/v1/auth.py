from __future__ import annotations

import uuid
from typing import Optional
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


class ForgotPasswordPayload(BaseModel):
    email: str


class ResetPasswordPayload(BaseModel):
    email: str
    token: str
    password: str


class VerifyEmailPayload(BaseModel):
    email: str
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str = "user-1001"


class AuthUser(BaseModel):
    id: str
    name: str
    email: str
    created_at: str = "2026-01-10T00:00:00Z"


USERS_DB: dict[str, dict[str, str]] = {
    "demo@invexia.local": {
        "id": "user-1001",
        "name": "Sanskar Gola",
        "email": "demo@invexia.local",
        "password": "password123",
    },
    "sanskar@invexia.trade": {
        "id": "user-1001",
        "name": "Sanskar Gola",
        "email": "sanskar@invexia.trade",
        "password": "password123",
    },
}

RESET_TOKENS: dict[str, str] = {}


@router.post("/register", response_model=AuthUser, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterPayload) -> AuthUser:
    user_id = f"user-{uuid.uuid4().hex[:6]}"
    USERS_DB[payload.email] = {
        "id": user_id,
        "name": payload.name,
        "email": payload.email,
        "password": payload.password,
    }
    return AuthUser(id=user_id, name=payload.name, email=payload.email)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginPayload) -> TokenResponse:
    if not payload.email or not payload.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email and password are required")
    # Allow demo or any registered user
    return TokenResponse(access_token="invexa-jwt-token-active", token_type="bearer")


@router.get("/me", response_model=AuthUser)
def me() -> AuthUser:
    return AuthUser(id="user-1001", name="Sanskar Gola", email="sanskar@invexia.trade")


@router.post("/logout")
def logout() -> dict[str, str]:
    return {"status": "ok", "message": "Logged out successfully"}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordPayload) -> dict[str, str]:
    reset_token = f"rst_{uuid.uuid4().hex[:12]}"
    RESET_TOKENS[payload.email] = reset_token
    return {
        "status": "ok",
        "message": f"Password reset instructions sent to {payload.email}",
        "token": reset_token,
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordPayload) -> dict[str, str]:
    if payload.email in USERS_DB:
        USERS_DB[payload.email]["password"] = payload.password
    return {"status": "ok", "message": "Password updated successfully"}


@router.post("/verify-email")
def verify_email(payload: VerifyEmailPayload) -> dict[str, str]:
    return {"status": "ok", "message": "Email address verified successfully"}
