
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from fastapi import APIRouter

load_dotenv()

levels_routes = APIRouter()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "auth_system")

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
collection = db["sentences"]
