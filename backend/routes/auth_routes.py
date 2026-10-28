

from fastapi import APIRouter, Request

from controllers.auth_controller import (
    register,
    login,
    google_login,
    forgot_password,
    reset_password,
    logout,
)

from utils.validators import (
    validate_register,
    validate_login,
    validate_forgot_password,
    validate_reset_password,
)

auth_routes = APIRouter()


@auth_routes.post("/register")
async def register_route(request: Request):
    data = await request.json()
    validate_register(data)
    return await register(request)


@auth_routes.post("/login")
async def login_route(request: Request):
    data = await request.json()
    validate_login(data)
    return await login(request)


@auth_routes.post("/google")
async def google_login_route(request: Request):
    return await google_login(request)


@auth_routes.post("/forgot-password")
async def forgot_password_route(request: Request):
    data = await request.json()
    validate_forgot_password(data)
    return await forgot_password(request)


@auth_routes.post("/reset-password")
async def reset_password_route(request: Request):
    data = await request.json()
    validate_reset_password(data)
    return await reset_password(request)


@auth_routes.post("/logout")
async def logout_route():
    return logout()
