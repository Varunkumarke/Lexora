
from fastapi import HTTPException


def error_response(message: str):
    raise HTTPException(
        status_code=400,
        detail={"message": message},
    )


def validate_register(data: dict):
    if not data.get("name"):
        error_response("Name is required")

    if not data.get("email"):
        error_response("Please enter a valid email")

    if not data.get("password") or len(data.get("password")) < 8:
        error_response("Password must be at least 8 characters")


def validate_login(data: dict):
    if not data.get("email"):
        error_response("Please enter a valid email")

    if not data.get("password"):
        error_response("Password is required")


def validate_forgot_password(data: dict):
    if not data.get("email"):
        error_response("Please enter a valid email")


def validate_reset_password(data: dict):
    if not data.get("newPassword") or len(data.get("newPassword")) < 8:
        error_response("Password must be at least 8 characters")

    if not data.get("token"):
        error_response("Reset token is required")
