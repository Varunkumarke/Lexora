from fastapi import APIRouter
from pymongo import MongoClient

levels_routes = APIRouter()

client = MongoClient("mongodb://localhost:27017/")
db = client["auth_system"]
collection = db["sentences"]
