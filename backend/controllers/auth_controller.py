

import os
import jwt
import hashlib
import secrets
import bcrypt

from datetime import datetime, timedelta
from fastapi import Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from models.user import User
from utils.email_service import send_email

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_EXP_DAYS = 7
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def generate_token(user_id):
    payload = {
        "userId": str(user_id),
        "exp": datetime.utcnow() + timedelta(days=JWT_EXP_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


# -------------------------
# Register
# -------------------------
async def register(request: Request):
    try:
        data = await request.json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "user")

        if role not in ("user", "admin"):
            return JSONResponse(
                status_code=400,
                content={"message": "Invalid account type"},
            )

        email = email.strip().lower()
        users = request.app.state.db.users

        if users.find_one({"email": email}):
            return JSONResponse(
                status_code=400,
                content={"message": "User already exists"},
            )

        user = User(name=name, email=email, role=role)
        user.set_password(password)

        result = users.insert_one(user.to_mongo())
        user._id = result.inserted_id
        token = generate_token(user._id)

        try:
            send_email(
                email,
                "Welcome to Lexora",
                f"Hello {user.name}, welcome to Lexora!",
            )
        except Exception as email_error:
            print("Welcome email error:", email_error)

        return JSONResponse(
            status_code=201,
            content={
                "message": "User registered successfully",
                "token": token,
                "user": user.to_json(),
            },
        )

    except Exception as e:
        print("Registration error:", str(e))
        return JSONResponse(
            status_code=500,
            content={"message": "Server error during registration"},
        )


# -------------------------
# Password Login
# -------------------------
async def login(request: Request):
    try:
        data = await request.json()
        email = data.get("email", "").strip().lower()
        password = data.get("password")

        users = request.app.state.db.users
        user_data = users.find_one({"email": email})

        if not user_data:
            return JSONResponse(
                status_code=401,
                content={"message": "Invalid credentials"},
            )

        user = User.from_mongo(user_data)

        if not user or not user.check_password(password):
            return JSONResponse(
                status_code=401,
                content={"message": "Invalid credentials"},
            )

        token = generate_token(user._id)

        return JSONResponse(
            status_code=200,
            content={
                "message": "Login successful",
                "token": token,
                "user": user.to_json(),
            },
        )

    except Exception as e:
        print("Login error:", str(e))
        return JSONResponse(
            status_code=500,
            content={"message": "Server error during login"},
        )


# -------------------------
# Google Login / Signup
# -------------------------
# async def google_login(request: Request):
#     try:
#         if not GOOGLE_CLIENT_ID:
#             return JSONResponse(
#                 status_code=500,
#                 content={"message": "Google sign-in is not configured on the server"},
#             )

#         data = await request.json()
#         credential = data.get("credential")

#         if not credential:
#             return JSONResponse(
#                 status_code=400,
#                 content={"message": "Google credential is required"},
#             )

#         # Verify the ID token with Google's verification library.
#         try:
#             google_user = id_token.verify_oauth2_token(
#                 credential,
#                 google_requests.Request(),
#                 GOOGLE_CLIENT_ID,
#             )
#         except ValueError:
#             return JSONResponse(
#                 status_code=401,
#                 content={"message": "Invalid or expired Google credential"},
#             )

#         email = google_user.get("email", "").strip().lower()
#         google_id = google_user.get("sub")
#         name = google_user.get("name") or email.split("@")[0]

#         if (
#             not email
#             or not google_id
#             or google_user.get("email_verified") is not True
#         ):
#             return JSONResponse(
#                 status_code=401,
#                 content={"message": "Google account email could not be verified"},
#             )

#         users = request.app.state.db.users
#         user_data = users.find_one({"email": email})

#         if user_data:
#             # Only allow Google login for accounts previously created through
#             # this Google flow. Do not silently link password-based accounts.
#             if user_data.get("googleId") != google_id:
#                 return JSONResponse(
#                     status_code=409,
#                     content={
#                         "message": (
#                             "An account already exists with this email. "
#                             "Please log in with your email and password."
#                         )
#                     },
#                 )

#             user = User.from_mongo(user_data)

#         else:
#             # Google-created accounts are always regular user accounts.
#             user = User(name=name, email=email, role="user")
#             user.password = None
#             user.isVerified = True

#             user_document = user.to_mongo()
#             user_document["googleId"] = google_id

#             result = users.insert_one(user_document)
#             user._id = result.inserted_id

#             try:
#                 send_email(
#                     email,
#                     "Welcome to Lexora",
#                     f"Hello {user.name}, welcome to Lexora!",
#                 )
#             except Exception as email_error:
#                 print("Welcome email error:", email_error)

#         token = generate_token(user._id)

#         return JSONResponse(
#             status_code=200,
#             content={
#                 "message": "Google sign-in successful",
#                 "token": token,
#                 "user": user.to_json(),
#             },
#         )

#     except Exception as e:
#         print("Google login error:", str(e))
#         return JSONResponse(
#             status_code=500,
#             content={"message": "Server error during Google sign-in"},
#         )



async def google_login(request: Request):
    try:
        if not GOOGLE_CLIENT_ID:
            print("Google login error: GOOGLE_CLIENT_ID is missing")
            return JSONResponse(
                status_code=500,
                content={"message": "Google sign-in is not configured on the server"},
            )

        data = await request.json()
        credential = data.get("credential")

        if not credential:
            return JSONResponse(
                status_code=400,
                content={"message": "Google credential is required"},
            )

        try:
            google_user = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                GOOGLE_CLIENT_ID,
            )
        except Exception as e:
            print("Google token verification error:", repr(e))
            return JSONResponse(
                status_code=401,
                content={"message": "Google token verification failed"},
            )

        email = (google_user.get("email") or "").strip().lower()
        google_id = google_user.get("sub")
        name = google_user.get("name") or email.split("@")[0]

        if (
            not email
            or not google_id
            or google_user.get("email_verified") is not True
        ):
            return JSONResponse(
                status_code=401,
                content={"message": "Google account email could not be verified"},
            )

        users = request.app.state.db.users
        user_data = users.find_one({"email": email})

        if user_data:
            if user_data.get("googleId") != google_id:
                return JSONResponse(
                    status_code=409,
                    content={
                        "message": (
                            "An account already exists with this email. "
                            "Please log in with your email and password."
                        )
                    },
                )
            user = User.from_mongo(user_data)
        else:
            user = User(name=name, email=email, role="user")
            user.password = None
            user.isVerified = True

            user_document = user.to_mongo()
            user_document["googleId"] = google_id

            result = users.insert_one(user_document)
            user._id = result.inserted_id

            try:
                send_email(
                    email,
                    "Welcome to Lexora",
                    f"Hello {user.name}, welcome to Lexora!",
                )
            except Exception as email_error:
                print("Welcome email error:", repr(email_error))

        token = generate_token(user._id)

        return JSONResponse(
            status_code=200,
            content={
                "message": "Google sign-in successful",
                "token": token,
                "user": user.to_json(),
            },
        )

    except Exception as e:
        import traceback
        print("Google login error:", repr(e))
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"message": "Server error during Google sign-in"},
        )


# -------------------------
# Forgot password
# -------------------------
async def forgot_password(request: Request):
    try:
        data = await request.json()
        email = data.get("email", "").strip().lower()

        users = request.app.state.db.users
        user_data = users.find_one({"email": email})

        if not user_data:
            return JSONResponse(
                status_code=200,
                content={
                    "message": "If an account exists, a reset link will be sent"
                },
            )

        reset_token = secrets.token_hex(32)
        reset_token_hash = hashlib.sha256(reset_token.encode()).hexdigest()

        users.update_one(
            {"_id": user_data["_id"]},
            {
                "$set": {
                    "resetPasswordToken": reset_token_hash,
                    "resetPasswordExpires": datetime.utcnow()
                    + timedelta(hours=1),
                }
            },
        )

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        reset_url = f"{frontend_url}/reset-password?token={reset_token}"

        send_email(
            email,
            "Password Reset Request",
            f"""Hello {user_data['name']},

Click the link below to reset your password:

{reset_url}

This link will expire in 1 hour.
""",
        )

        return JSONResponse(
            status_code=200,
            content={"message": "Password reset link sent"},
        )

    except Exception as e:
        print("Forgot password error:", str(e))
        return JSONResponse(
            status_code=500,
            content={"message": "Server error"},
        )


# -------------------------
# Reset password
# -------------------------
async def reset_password(request: Request):
    try:
        data = await request.json()

        token = data.get("token")
        new_password = data.get("newPassword")

        if not token:
            return JSONResponse(
                status_code=400,
                content={"message": "Token is required"},
            )

        if not new_password:
            return JSONResponse(
                status_code=400,
                content={"message": "New password is required"},
            )

        if len(new_password) < 8:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Password must be at least 8 characters"
                },
            )

        reset_token_hash = hashlib.sha256(token.encode()).hexdigest()
        users = request.app.state.db.users

        user_data = users.find_one(
            {
                "resetPasswordToken": reset_token_hash,
                "resetPasswordExpires": {"$gt": datetime.utcnow()},
            }
        )

        if not user_data:
            return JSONResponse(
                status_code=400,
                content={"message": "Invalid or expired token"},
            )

        hashed_password = bcrypt.hashpw(
            new_password.encode("utf-8"),
            bcrypt.gensalt(),
        ).decode("utf-8")

        users.update_one(
            {"_id": user_data["_id"]},
            {
                "$set": {
                    "password": hashed_password,
                    "resetPasswordToken": None,
                    "resetPasswordExpires": None,
                }
            },
        )

        try:
            send_email(
                user_data["email"],
                "Password Reset Successful",
                f"Hello {user_data['name']}, your password has been reset successfully.",
            )
        except Exception as email_error:
            print("Password reset confirmation email error:", email_error)

        return JSONResponse(
            status_code=200,
            content={"message": "Password reset successful"},
        )

    except Exception as e:
        print("Reset password error:", str(e))
        return JSONResponse(
            status_code=500,
            content={"message": "Server error"},
        )


# -------------------------
# Logout
# -------------------------
def logout():
    return JSONResponse(
        status_code=200,
        content={"message": "Logout successful"},
    )
