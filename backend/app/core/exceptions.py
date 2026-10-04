class InvexaError(Exception):
    """Base application exception."""


class NotFoundError(InvexaError):
    def __init__(self, message: str = "Resource not found") -> None:
        super().__init__(message)


class ValidationError(InvexaError):
    def __init__(self, message: str = "Validation failed") -> None:
        super().__init__(message)


class UnauthorizedError(InvexaError):
    def __init__(self, message: str = "Unauthorized") -> None:
        super().__init__(message)
