
# import os
# from contextlib import asynccontextmanager

# from fastapi import FastAPI, Request
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# from pymongo import MongoClient
# from dotenv import load_dotenv

# from routes.definition_route import definition_routes
# from routes.auth_routes import auth_routes
# from routes.levels_routes import levels_routes
# # from routes.pos_routes import term_routes
# from routes.term_routes import term_routes
# from routes.translator_routes import translator_routes
# from routes.tts_routes import tts_routes
# from routes.vocabulary_routes import vocabulary_bp

# # -------------------------
# # Load environment variables
# # -------------------------
# load_dotenv()

# MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
# DB_NAME = os.getenv("DB_NAME", "auth_system")

# mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
# db = mongo_client[DB_NAME]


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     # Verify MongoDB connection when the server starts
#     mongo_client.admin.command("ping")
#     app.state.db = db
#     print(f"MongoDB connected successfully -> DB: {DB_NAME}")

#     yield

#     # Close the MongoDB connection on shutdown
#     mongo_client.close()


# app = FastAPI(
#     title="Linguistic Learning Platform API",
#     lifespan=lifespan,
# )

# # -------------------------
# # CORS Configuration
# # -------------------------
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # -------------------------
# # Register existing route modules
# # -------------------------
# # IMPORTANT:
# # These modules must expose FastAPI APIRouters.
# # Flask Blueprints cannot be registered directly in FastAPI.

# app.include_router(auth_routes, prefix="/api/auth")
# app.include_router(levels_routes)
# app.include_router(definition_routes)
# app.include_router(term_routes)
# app.include_router(tts_routes)
# app.include_router(translator_routes)
# app.include_router(vocabulary_bp)

# # -------------------------
# # Health check
# # -------------------------
# @app.get("/health")
# def health_check():
#     return {
#         "status": "OK",
#         "message": "Server is running",
#     }


# # -------------------------
# # 404 handler
# # -------------------------
# @app.exception_handler(404)
# async def not_found(request: Request, exc):
#     return JSONResponse(
#         status_code=404,
#         content={"message": "Endpoint not found"},
#     )


import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv

from routes.definition_route import definition_routes
from routes.auth_routes import auth_routes
from routes.levels_routes import levels_routes
from routes.term_routes import term_routes
from routes.translator_routes import translator_routes
from routes.tts_routes import tts_routes
from routes.vocabulary_routes import vocabulary_bp

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "auth_system")
mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
db = mongo_client[DB_NAME]


@asynccontextmanager
async def lifespan(app: FastAPI):
    mongo_client.admin.command("ping")
    app.state.db = db
    print(f"MongoDB connected successfully -> DB: {DB_NAME}")
    yield
    mongo_client.close()


app = FastAPI(title="Linguistic Learning Platform API", lifespan=lifespan)
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "https://lexora-frontend-3bo3.onrender.com"
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    FRONTEND_URL.rstrip("/"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_routes, prefix="/api/auth")
app.include_router(levels_routes)
app.include_router(definition_routes)
app.include_router(term_routes)
app.include_router(tts_routes)
app.include_router(translator_routes)

# /api/vocabulary/search is implemented by levels_routes with external dictionary
# lookup and MongoDB caching. Exclude the duplicate DB-only route while retaining
# the other vocabulary endpoints (generate and languages).
vocabulary_bp.routes = [
    route
    for route in vocabulary_bp.routes
    if not (
        getattr(route, "path", None) == "/api/vocabulary/search"
        and "GET" in (getattr(route, "methods", set()) or set())
    )
]
app.include_router(vocabulary_bp)


@app.get("/health")
def health_check():
    return {"status": "OK", "message": "Server is running"}


@app.exception_handler(404)
async def not_found(request: Request, exc):
    return JSONResponse(status_code=404, content={"message": "Endpoint not found"})
