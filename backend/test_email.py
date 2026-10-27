from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:8000:27017/")  
# OR use your MongoDB Atlas URI if hosted online

# Select database and collection
db = client["auth_system"]
collection = db["educational_platform_db.paragraphs"]

# Update all documents
result = collection.update_many(
    {},  # empty filter = ALL documents
    {
        "$set": {
            "category": "text_composition"
        }
    }
)

print(f"Matched: {result.matched_count}")
print(f"Modified: {result.modified_count}")
