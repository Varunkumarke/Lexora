from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import requests
import logging
import json
import re
from datetime import datetime
from dotenv import load_dotenv
from db import db as app_db

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# NOTE: In main.py include with: app.include_router(vocabulary_bp)
vocabulary_bp = APIRouter()

# Configuration
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
MODEL_ID = "meta-llama/Meta-Llama-3-8B-Instruct"
HF_API_URL = "https://router.huggingface.co/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
    "Content-Type": "application/json"
}

# Language configuration
SUPPORTED_LANGUAGES = {
    "hindi": {"code": "hi", "name": "हिन्दी", "script": "Devanagari"},
    "telugu": {"code": "te", "name": "తెలుగు", "script": "Telugu"},
    "tamil": {"code": "ta", "name": "தமிழ்", "script": "Tamil"}
}

# ---------------------------
# Request Models
# ---------------------------

class VocabularyRequest(BaseModel):
    words: Optional[List[str]] = None
    domain: Optional[str] = None
    level: Optional[str] = None
    story_title: Optional[str] = None
    languages: Optional[List[str]] = None


# ---------------------------
# Helper Functions
# ---------------------------

def query_huggingface(messages, max_tokens=1024, temperature=0.7):
    """Send request to Hugging Face Inference API"""
    payload = {
        "model": MODEL_ID,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": 0.95
    }
    response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
    response.raise_for_status()
    return response.json()


def robust_json_parse(text: str) -> dict:
    """Try multiple strategies to extract valid JSON from LLM response"""
    # Strategy 1: direct parse
    try:
        return json.loads(text)
    except Exception:
        pass

    # Strategy 2: ```json ... ``` block
    match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass

    # Strategy 3: outermost { } block with cleanup
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        candidate = match.group(0)
        candidate = re.sub(r',\s*}', '}', candidate)
        candidate = re.sub(r',\s*]', ']', candidate)
        try:
            return json.loads(candidate)
        except Exception:
            pass

    # Strategy 4: per-language regex extraction
    result = {}
    for lang in ["hindi", "telugu", "tamil"]:
        pattern = rf'"{lang}"\s*:\s*\{{\s*"word"\s*:\s*"(.*?)"\s*,\s*"meaning"\s*:\s*"(.*?)"\s*\}}'
        m = re.search(pattern, text, re.DOTALL)
        if m:
            result[lang] = {"word": m.group(1), "meaning": m.group(2)}
    if result:
        return result

    raise ValueError("Could not parse JSON from LLM response")


def get_next_task_number(level: str) -> int:
    """Find the next available task number for this level"""
    sentences_collection = app_db["sentences"]

    existing_docs = sentences_collection.find(
        {"level": level, "category": "vocabulary"},
        {"task_id": 1}
    )
    task_numbers = set()
    for doc in existing_docs:
        parts = doc.get("task_id", "").split("_")
        if len(parts) == 2 and parts[1].isdigit():
            task_numbers.add(int(parts[1]))

    n = 1
    while n in task_numbers:
        n += 1
    return n


def generate_vocabulary_data(word: str, domain: str) -> dict:
    """Call LLM to generate vocabulary fields for a word"""
    prompt = f"""Generate vocabulary data for the word "{word}" in the context of {domain}.
Return ONLY a valid JSON object with these exact fields:

{{
    "word": "{word}",
    "phonetic": "IPA pronunciation here",
    "wordType": "Noun",
    "meaning": "Clear 1-2 sentence definition in {domain} context",
    "domain": "{domain}",
    "forms": ["form1", "form2"],
    "examples": ["Sentence using {word}.", "Another sentence.", "Third sentence."],
    "synonyms": ["synonym1", "synonym2", "synonym3"],
    "antonyms": ["antonym1", "antonym2"]
}}

Rules:
- phonetic: proper IPA format e.g. /ˈælɡərɪðəm/
- wordType: Noun / Verb / Adjective / etc.
- meaning: domain-specific, concise
- forms: 2-3 grammatical forms
- examples: 3 sentences, use the word naturally
- synonyms: 3 similar words
- antonyms: 2-3 opposite words
- Return raw JSON only
"""
    messages = [
        {"role": "system", "content": "You are a lexicographer and domain expert. Return ONLY valid JSON, nothing else."},
        {"role": "user", "content": prompt}
    ]

    try:
        result = query_huggingface(messages)
        generated_text = result["choices"][0]["message"]["content"].strip()
        data = robust_json_parse(generated_text)

        # Fill missing required fields with safe defaults
        defaults = {
            "word": word,
            "phonetic": f"/ˈ{word.lower()}/",
            "wordType": "Noun",
            "meaning": f"A key concept in {domain}.",
            "domain": domain,
            "forms": [f"{word}s", word],
            "examples": [f"{word} is used in {domain}."],
            "synonyms": [],
            "antonyms": []
        }
        for field, default in defaults.items():
            if field not in data:
                data[field] = default

        return data

    except Exception as e:
        logger.error(f"Error generating vocabulary for '{word}': {e}")
        return {
            "word": word,
            "phonetic": f"/ˈ{word.lower()}/",
            "wordType": "Noun",
            "meaning": f"A key concept in {domain}.",
            "domain": domain,
            "forms": [f"{word}s", word],
            "examples": [
                f"Understanding {word} is crucial for {domain}.",
                f"The concept of {word} applies in many scenarios.",
                f"Experts in {domain} frequently use {word}."
            ],
            "synonyms": ["concept", "principle", "notion"],
            "antonyms": ["opposite", "exception"]
        }


def generate_native_translations(word: str, meaning: str, domain: str, languages: list) -> dict:
    """Generate translations for each language"""
    if not languages:
        return {}

    valid_languages = [lang for lang in languages if lang in SUPPORTED_LANGUAGES]
    if not valid_languages:
        return {}

    langs_str = ", ".join(valid_languages)
    prompt = f"""For the English word "{word}" (domain: {domain}), do TWO things for each requested language:
1. Transliterate "{word}" into that language's native script
2. Translate this meaning into that language: "{meaning}"

Requested languages: {langs_str}

Return ONLY raw valid JSON exactly like this:
{{
    "hindi": {{
        "word": "{word} written phonetically in Devanagari",
        "meaning": "meaning in Hindi"
    }},
    "telugu": {{
        "word": "{word} written phonetically in Telugu script",
        "meaning": "meaning in Telugu"
    }},
    "tamil": {{
        "word": "{word} written phonetically in Tamil script",
        "meaning": "meaning in Tamil"
    }}
}}

Include ONLY these languages: {langs_str}
- Return raw JSON only, no markdown, no explanation
"""

    messages = [
        {"role": "system", "content": "You are a professional transliterator and translator for Indian languages. Return ONLY raw valid JSON."},
        {"role": "user", "content": prompt}
    ]

    try:
        result = query_huggingface(messages, max_tokens=800, temperature=0.2)
        generated_text = result["choices"][0]["message"]["content"].strip()
        trans_data = robust_json_parse(generated_text)

        native = {}
        for lang in valid_languages:
            if lang in trans_data:
                native[lang] = {
                    "word": trans_data[lang].get("word", word),
                    "meaning": trans_data[lang].get("meaning", meaning)
                }
            else:
                native[lang] = {"word": word, "meaning": meaning}

        return native

    except Exception as e:
        logger.error(f"Error generating native translations for '{word}': {e}")
        return {lang: {"word": word, "meaning": meaning} for lang in valid_languages}


def save_vocabulary_to_db(vocab_data: dict, level: str, story_title: str, task_id: str) -> dict:
    """Save vocabulary word to MongoDB"""
    sentences_collection = app_db["sentences"]
    word = vocab_data.get("word", "").lower().strip()

    # Duplicate check
    existing = sentences_collection.find_one({
        "word": word,
        "level": level,
        "category": "vocabulary"
    })
    if existing:
        logger.info(f"Duplicate skipped: '{word}' level='{level}'")
        return {"status": "skipped", "word": word, "level": level}

    # sentence_id pattern: easy_1_vocab_algorithm
    sentence_id = f"{task_id}_vocab_{word.replace(' ', '_')}"

    document = {
        "sentence_id": sentence_id,
        "task_id": task_id,
        "level": level,
        "story_title": story_title,
        "category": "vocabulary",
        "word": word,
        "phonetic": vocab_data.get("phonetic", ""),
        "wordType": vocab_data.get("wordType", "Noun"),
        "meaning": vocab_data.get("meaning", ""),
        "domain": vocab_data.get("domain", ""),
        "forms": vocab_data.get("forms", []),
        "examples": vocab_data.get("examples", []),
        "synonyms": vocab_data.get("synonyms", []),
        "antonyms": vocab_data.get("antonyms", []),
        "native": vocab_data.get("native", {}),
        "created_at": datetime.utcnow()
    }

    result = sentences_collection.insert_one(document)
    logger.info(f"Inserted '{word}' → sentence_id: {sentence_id}")

    return {
        "status": "inserted",
        "word": word,
        "level": level,
        "task_id": task_id,
        "sentence_id": sentence_id,
        "id": str(result.inserted_id)
    }


# ---------------------------
# Routes
# ---------------------------

@vocabulary_bp.post("/api/vocabulary/generate")
def generate_vocabulary(data: VocabularyRequest):
    """Generate vocabulary for a batch of words"""
    # Validation (replaces Flask decorator)
    if not data.words or not isinstance(data.words, list):
        return JSONResponse(content={"message": "words must be a non-empty list"}, status_code=400)

    if not data.domain:
        return JSONResponse(content={"message": "domain is required"}, status_code=400)

    level = (data.level or "").lower()
    if level not in ["easy", "medium", "hard"]:
        return JSONResponse(content={"message": "level must be 'easy', 'medium', or 'hard'"}, status_code=400)

    if not data.story_title:
        return JSONResponse(content={"message": "story_title is required"}, status_code=400)

    try:
        words = data.words
        domain = data.domain
        story_title = data.story_title
        languages = data.languages if data.languages is not None else ["hindi", "telugu", "tamil"]

        # Validate languages
        valid_languages = [lang for lang in languages if lang in SUPPORTED_LANGUAGES]
        if not valid_languages:
            valid_languages = ["hindi", "telugu", "tamil"]

        # Get next task number
        task_number = get_next_task_number(level)
        task_id = f"{level}_{task_number}"

        logger.info(f"Starting batch | task_id={task_id} | words={words}")

        results = []
        inserted_count = 0
        skipped_count = 0

        for word in words:
            word = word.strip()
            if not word:
                continue

            try:
                # Generate English vocabulary data
                vocab_data = generate_vocabulary_data(word, domain)

                # Generate native translations
                native = generate_native_translations(
                    word=vocab_data["word"],
                    meaning=vocab_data["meaning"],
                    domain=domain,
                    languages=valid_languages
                )
                vocab_data["native"] = native

                # Save to MongoDB
                db_result = save_vocabulary_to_db(
                    vocab_data=vocab_data,
                    level=level,
                    story_title=story_title,
                    task_id=task_id
                )

                if db_result["status"] == "inserted":
                    inserted_count += 1
                else:
                    skipped_count += 1

                results.append({
                    **vocab_data,
                    "task_id": task_id,
                    "sentence_id": db_result.get("sentence_id", ""),
                    "level": level,
                    "story_title": story_title,
                    "category": "vocabulary",
                    "db_status": db_result["status"]
                })

            except Exception as e:
                logger.error(f"Error processing '{word}': {e}")
                results.append({
                    "word": word,
                    "level": level,
                    "error": str(e),
                    "db_status": "error"
                })

        return JSONResponse(content={
            "total": len(words),
            "processed": inserted_count,
            "skipped": skipped_count,
            "task_id": task_id,
            "results": results
        }, status_code=200)

    except Exception as e:
        logger.error(f"Error in generate_vocabulary: {e}")
        return JSONResponse(content={"message": str(e)}, status_code=500)


@vocabulary_bp.get("/api/vocabulary/search")
def search_vocabulary(word: str = Query("", description="Word to search"),
                      domain: str = Query("", description="Optional domain")):
    """Search for a vocabulary word"""
    try:
        word = word.strip()
        domain = domain.strip()

        if not word:
            return JSONResponse(content={"found": False, "message": "No word provided"}, status_code=400)

        sentences_collection = app_db["sentences"]

        # Search in database
        query = {
            "category": "vocabulary",
            "word": {"$regex": f"^{re.escape(word)}$", "$options": "i"}
        }
        if domain:
            query["domain"] = {"$regex": re.escape(domain), "$options": "i"}

        word_doc = sentences_collection.find_one(query)

        if word_doc:
            # Convert ObjectId to string
            word_doc["_id"] = str(word_doc["_id"])
            if isinstance(word_doc.get("created_at"), datetime):
                word_doc["created_at"] = word_doc["created_at"].isoformat()
            return JSONResponse(content={"found": True, "data": word_doc}, status_code=200)

        return JSONResponse(content={"found": False, "message": f"Word '{word}' not found"}, status_code=200)

    except Exception as e:
        logger.error(f"Error in search_vocabulary: {e}")
        return JSONResponse(content={"message": str(e)}, status_code=500)


@vocabulary_bp.get("/api/vocabulary/languages")
def get_supported_languages():
    """Get supported languages for translation"""
    return JSONResponse(content={"supported_languages": SUPPORTED_LANGUAGES}, status_code=200)