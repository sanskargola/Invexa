from typing import Sequence

from fastapi import Depends, HTTPException, status


def require_roles(*allowed_roles: str):
    def _dependency() -> None:
        if not allowed_roles:
            return None
        if "admin" not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource.",
            )

    return Depends(_dependency)


def require_auth() -> None:
    return None
