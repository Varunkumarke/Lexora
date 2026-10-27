
from datetime import datetime
from pymongo import MongoClient
import os

from utils.definition import get_software_definition
from utils.pos_tagger import analyze_term


TXT_FILE = "data/terms.txt"
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "auth_system")
COLLECTION_NAME = "terms"


def read_terms_from_txt(path):
    with open(path, "r", encoding="utf-8") as f:
        return [
            line.strip()
            for line in f
            if line.strip() and not line.strip().startswith("#")
        ]


def ingest_terms():
    terms = read_terms_from_txt(TXT_FILE)

    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    print(f"📄 Loaded {len(terms)} terms from file")

    for idx, term in enumerate(terms, start=1):
        print(f"[{idx}/{len(terms)}] Processing → {term}")

        # Avoid duplicates
        if collection.find_one({"term": term}):
            print("   ⏭️  Already exists, skipping")
            continue

        definition = get_software_definition(term)
        linguistic = analyze_term(term)

        doc = {
            "term": term,
            "definition": definition,
            "linguistic": linguistic,
            "created_at": datetime.utcnow()
        }

        collection.insert_one(doc)
        print("   ✅ Inserted")

    client.close()
    print("🎉 Ingestion completed successfully")


if __name__ == "__main__":
    ingest_terms()
