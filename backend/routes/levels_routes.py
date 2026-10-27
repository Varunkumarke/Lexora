# from fastapi import APIRouter, Request, Query, Path
# from fastapi.responses import JSONResponse
# from datetime import datetime
# from bson import ObjectId
# import os
# from dotenv import load_dotenv
# import nltk
# import numpy as np
# from typing import Dict, List, Any, Optional
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity
# import re
# import traceback
# import requests
# from db import collection, db as app_db

# # Load environment variables
# load_dotenv()

# levels_routes = APIRouter()

# # NOTE: In main.py include with: app.include_router(levels_routes)
# # The database handle is imported from db (db.py must expose `db`).
# # If you prefer to attach it to the app, set `app.state.db = db` and
# # replace `app_db` usage below with `request.app.state.db`.

# # Download required NLTK data
# try:
#     nltk.data.find('tokenizers/punkt')
# except LookupError:
#     nltk.download('punkt', quiet=True)
# try:
#     nltk.data.find('tokenizers/punkt_tab')
# except LookupError:
#     nltk.download('punkt_tab', quiet=True)

# # ============================================
# # RELATION-FOCUSED STORY EVALUATOR
# # ============================================

# class RelationFocusedEvaluator:
#     """
#     Evaluator that focuses on finding the correct relation between sentences
#     """

#     def __init__(self):
#         """Initialize the relation-focused evaluator"""
#         self.vectorizer = TfidfVectorizer(
#             stop_words='english',
#             ngram_range=(1, 2),
#             max_features=1000
#         )

#         # All possible discourse relations
#         self.discourse_relations = {
#             'causal': ['because', 'since', 'therefore', 'thus', 'hence', 'consequently', 'as', 'so'],
#             'temporal': ['then', 'next', 'after', 'before', 'while', 'when', 'finally', 'later', 'as', 'during', 'meanwhile'],
#             'contrast': ['but', 'however', 'although', 'though', 'nevertheless', 'yet', 'whereas', 'while', 'on the other hand'],
#             'addition': ['and', 'also', 'furthermore', 'moreover', 'additionally', 'besides', 'in addition'],
#             'exemplification': ['for example', 'for instance', 'such as', 'specifically'],
#             'result': ['so', 'therefore', 'thus', 'consequently', 'as a result', 'hence'],
#             'purpose': ['so that', 'in order to', 'so as to'],
#             'condition': ['if', 'unless', 'provided that', 'as long as']
#         }

#         # Flatten all relations for checking
#         self.all_relations = []
#         for relations in self.discourse_relations.values():
#             self.all_relations.extend(relations)

#         print("✅ RelationFocusedEvaluator initialized")

#     def preprocess_text(self, text: str) -> str:
#         """Clean and preprocess text"""
#         text = text.lower()
#         text = re.sub(r'\s+', ' ', text)
#         return text.strip()

#     def calculate_similarity(self, text1: str, text2: str) -> float:
#         """Calculate cosine similarity between two texts"""
#         if not text1 or not text2:
#             return 0.0

#         text1_clean = self.preprocess_text(text1)
#         text2_clean = self.preprocess_text(text2)

#         try:
#             tfidf_matrix = self.vectorizer.fit_transform([text1_clean, text2_clean])
#             similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
#             return float(similarity)
#         except Exception as e:
#             print(f"Error calculating similarity: {e}")
#             return 0.0

#     def find_used_relation(self, text: str) -> Dict[str, Any]:
#         """Find which discourse relation is used in the text"""
#         text_lower = text.lower()

#         used_relation = None
#         relation_type = None

#         for rel_type, relations in self.discourse_relations.items():
#             for relation in relations:
#                 # Check if relation appears as a separate word (with word boundaries)
#                 pattern = r'\b' + re.escape(relation) + r'\b'
#                 if re.search(pattern, text_lower):
#                     used_relation = relation
#                     relation_type = rel_type
#                     break
#             if used_relation:
#                 break

#         # Also check for comma usage (implicit relation)
#         if ',' in text and not used_relation:
#             used_relation = ','
#             relation_type = 'implicit'

#         return {
#             'relation': used_relation,
#             'type': relation_type,
#             'text': text
#         }

#     def find_correct_combination(self, sentence_texts: List[str], reference_story: str) -> Dict[str, Any]:
#         """
#         Find how these sentences are actually combined in the reference story
#         Returns the correct combined version and the relation used
#         """
#         if not sentence_texts or len(sentence_texts) < 2:
#             return {
#                 'found': False,
#                 'message': 'Need at least 2 sentences to find a relation'
#             }

#         # Preprocess texts
#         reference_lower = reference_story.lower()
#         sentence_texts_lower = [self.preprocess_text(s) for s in sentence_texts]

#         # Tokenize the reference story into sentences
#         try:
#             reference_sentences = nltk.sent_tokenize(reference_story)
#         except Exception as e:
#             print(f"Error tokenizing reference story: {e}")
#             # Fallback to simple period splitting
#             reference_sentences = [s.strip() for s in reference_story.split('.') if s.strip()]

#         # Look through each sentence in the reference story
#         for ref_sent in reference_sentences:
#             ref_sent_lower = ref_sent.lower()

#             # Check if ALL sentence texts appear in this reference sentence
#             all_found = True
#             for text in sentence_texts_lower:
#                 if text not in ref_sent_lower:
#                     all_found = False
#                     break

#             if all_found:
#                 # We found the combined sentence!
#                 combined = ref_sent.strip()

#                 # Find what relation is used
#                 relation_info = self.find_used_relation(combined)

#                 return {
#                     'found': True,
#                     'correct_combination': combined,
#                     'relation_info': relation_info,
#                     'original_sentences': sentence_texts
#                 }

#         # If not found in the same sentence, try to find them in consecutive sentences
#         for i in range(len(reference_sentences) - 1):
#             current_sent = reference_sentences[i].lower()
#             next_sent = reference_sentences[i + 1].lower()

#             # Check if first sentence is in current_sent and second in next_sent
#             if (sentence_texts_lower[0] in current_sent and
#                 len(sentence_texts_lower) > 1 and
#                 sentence_texts_lower[1] in next_sent):

#                 combined = reference_sentences[i].strip() + " " + reference_sentences[i + 1].strip()
#                 relation_info = self.find_used_relation(combined)

#                 return {
#                     'found': True,
#                     'correct_combination': combined,
#                     'relation_info': relation_info,
#                     'original_sentences': sentence_texts
#                 }

#         # If still not found, check if sentences appear individually in the story
#         individual_sentences = []
#         for text in sentence_texts:
#             for sent in reference_sentences:
#                 if self.preprocess_text(text) in self.preprocess_text(sent):
#                     individual_sentences.append(sent)
#                     break

#         if len(individual_sentences) >= 2:
#             # Analyze what relation might be appropriate
#             suggested_relation = self.suggest_relation(sentence_texts[0], sentence_texts[1])

#             return {
#                 'found': False,
#                 'individual_sentences': individual_sentences,
#                 'suggested_relation': suggested_relation,
#                 'message': 'Sentences not found combined in reference. Suggested relation based on meaning.'
#             }

#         return {
#             'found': False,
#             'message': 'Could not find sentences in reference story'
#         }

#     def suggest_relation(self, sentence1: str, sentence2: str) -> Dict[str, Any]:
#         """Suggest an appropriate relation between two sentences based on their content"""
#         s1_lower = sentence1.lower()
#         s2_lower = sentence2.lower()

#         # Pattern 1: First sentence shows effect, second shows cause
#         effect_keywords = ['missed', 'failed', 'could not', 'did not', 'unable to', 'forgot', 'lost']
#         cause_keywords = ['because', 'since', 'due to', 'as a result of', 'woke up', 'was late', 'was sick', 'was tired']

#         # Check if first sentence has effect and second shows cause
#         has_effect = any(word in s1_lower for word in effect_keywords)
#         has_cause_indicators = any(word in s2_lower for word in ['late', 'early', 'sick', 'tired', 'forgot', 'busy', 'traffic'])

#         if has_effect and has_cause_indicators:
#             return {'relation': 'because', 'type': 'causal', 'explanation': 'Shows cause and effect'}

#         # Check for temporal relationships
#         temporal_keywords = ['then', 'after', 'before', 'when', 'while', 'during', 'later', 'next']
#         if any(word in s1_lower for word in temporal_keywords) or any(word in s2_lower for word in temporal_keywords):
#             return {'relation': 'then', 'type': 'temporal', 'explanation': 'Shows time sequence'}

#         # Check for contrast
#         contrast_keywords = ['but', 'however', 'although', 'though', 'yet', 'whereas']
#         if any(word in s1_lower for word in contrast_keywords) or any(word in s2_lower for word in contrast_keywords):
#             return {'relation': 'but', 'type': 'contrast', 'explanation': 'Shows contrast'}

#         # Check for result
#         result_keywords = ['so', 'therefore', 'thus', 'consequently']
#         if any(word in s1_lower for word in result_keywords) or any(word in s2_lower for word in result_keywords):
#             return {'relation': 'so', 'type': 'result', 'explanation': 'Shows result'}

#         # Default to addition
#         return {'relation': 'and', 'type': 'addition', 'explanation': 'Adds information'}

#     def evaluate_combination(self, user_combined: str, sentence_texts: List[str], reference_story: str) -> Dict[str, Any]:
#         """Evaluate the user's combination against the correct one"""
#         # Find correct combination
#         correct_info = self.find_correct_combination(sentence_texts, reference_story)

#         # Analyze user's combination
#         user_relation_info = self.find_used_relation(user_combined)

#         if correct_info['found']:
#             # Calculate similarity with correct combination
#             similarity = self.calculate_similarity(user_combined, correct_info['correct_combination'])

#             # Check if relation is correct
#             relation_correct = False
#             if user_relation_info['relation'] and correct_info['relation_info']['relation']:
#                 user_rel = user_relation_info['relation'].lower()
#                 correct_rel = correct_info['relation_info']['relation'].lower()
#                 relation_correct = user_rel == correct_rel

#             # Score based on similarity and relation correctness
#             similarity_score = similarity * 10  # Convert to 0-10 scale
#             relation_score = 10 if relation_correct else 5  # Penalty for wrong relation

#             overall_score = (similarity_score * 0.7) + (relation_score * 0.3)

#             return {
#                 'overall_score': round(float(overall_score), 2),
#                 'similarity_score': round(float(similarity), 3),
#                 'similarity_percentage': round(float(similarity) * 100, 1),
#                 'relation_correct': relation_correct,
#                 'user_relation': user_relation_info,
#                 'correct_combination': correct_info['correct_combination'],
#                 'correct_relation': correct_info['relation_info'],
#                 'is_correct': bool(overall_score >= 6.0),
#                 'feedback': self._generate_feedback(similarity, relation_correct, correct_info, user_combined),
#                 'found_in_reference': True
#             }
#         else:
#             # Couldn't find exact combination, use general evaluation
#             similarity = self.calculate_similarity(user_combined, reference_story)
#             similarity_score = similarity * 10

#             return {
#                 'overall_score': round(float(similarity_score), 2),
#                 'similarity_score': round(float(similarity), 3),
#                 'similarity_percentage': round(float(similarity) * 100, 1),
#                 'relation_correct': None,
#                 'user_relation': user_relation_info,
#                 'correct_combination': None,
#                 'suggested_relation': correct_info.get('suggested_relation'),
#                 'individual_sentences': correct_info.get('individual_sentences'),
#                 'is_correct': bool(similarity_score >= 6.0),
#                 'feedback': ["Sentences not found combined in reference. Check if you're combining the right sentences."],
#                 'found_in_reference': False
#             }

#     def _generate_feedback(self, similarity: float, relation_correct: bool, correct_info: Dict, user_combined: str = "") -> List[str]:
#         """Generate feedback based on evaluation"""
#         feedback = []

#         if similarity >= 0.8:
#             feedback.append("🎯 Excellent combination! Very close to the original.")
#         elif similarity >= 0.6:
#             feedback.append("👍 Good combination. Close to the reference.")
#         elif similarity >= 0.4:
#             feedback.append("📝 Reasonable attempt. Some differences from reference.")
#         else:
#             feedback.append("🔍 Needs improvement. Significant differences from reference.")

#         if correct_info.get('found', False):
#             if relation_correct:
#                 feedback.append("✅ Correct relation used!")
#             else:
#                 correct_rel = correct_info.get('relation_info', {}).get('relation', '')
#                 user_rel_info = self.find_used_relation(user_combined)
#                 user_rel = user_rel_info.get('relation', '')

#                 if correct_rel:
#                     if correct_rel == ',':
#                         feedback.append("ℹ️ Try connecting the sentences with a comma and appropriate conjunction.")
#                     else:
#                         feedback.append(f"ℹ️ The correct relation should be: '{correct_rel}'")

#                 # Add more specific feedback based on relation type
#                 correct_type = correct_info.get('relation_info', {}).get('type', '')
#                 if correct_type == 'causal':
#                     feedback.append("💡 This is a cause-effect relationship. The second sentence explains why the first happened.")
#                 elif correct_type == 'temporal':
#                     feedback.append("⏰ This shows a time sequence. Use words like 'then', 'after', or 'before'.")

#         return feedback


# # Global evaluator instance
# story_evaluator = RelationFocusedEvaluator()

# # --------------------------------------------
# # HELPER FUNCTIONS
# # --------------------------------------------

# def get_db_collections():
#     """Get database collections"""
#     sentences_collection = app_db["sentences"]
#     paragraphs_collection = app_db["educational_platform_db.paragraphs"]
#     return sentences_collection, paragraphs_collection


# def get_mongo_task_id(level_name, task_id):
#     return f"{level_name.lower()}_{task_id}"


# def get_reference_story(level: str, task_id: str) -> str:
#     """Get the complete reference story from MongoDB"""
#     try:
#         sentences_collection, paragraphs_collection = get_db_collections()

#         # First: Try paragraph collection
#         paragraph_doc = paragraphs_collection.find_one({
#             "task_id": task_id,
#             "level": level
#         })

#         if paragraph_doc and "paragraph_text" in paragraph_doc:
#             print("paragraph_doc", paragraph_doc)
#             return paragraph_doc["paragraph_text"].strip()

#         # Fallback: reconstruct from sentences collection
#         sentences_cursor = sentences_collection.find(
#             {"task_id": task_id, "level": level}
#         ).sort("step_number", 1)

#         story_parts = [doc["text"] for doc in sentences_cursor if "text" in doc]

#         return " ".join(story_parts).strip()

#     except Exception as e:
#         print(f"❌ Error getting reference story for task_id={task_id}, level={level}: {e}")
#         return ""


# def get_sentence_texts(sentence_ids: List[str], sentences_collection) -> List[str]:
#     """Get the actual text of sentences given their IDs"""
#     if not sentence_ids:
#         return []

#     texts = []
#     for sent_id in sentence_ids:
#         sent_doc = sentences_collection.find_one({"sentence_id": sent_id})
#         if sent_doc:
#             texts.append(sent_doc["text"].strip())

#     return texts


# def extract_sentence_ids_from_selected(sentence_order: List[Any]) -> List[str]:
#     """
#     Extract all sentence IDs from the sentence order array
#     Handles both simple IDs and combined sentence objects
#     """
#     sentence_ids = []

#     for item in sentence_order:
#         if isinstance(item, dict):
#             if 'type' in item and item['type'] == 'combined' and 'sentences' in item:
#                 sentence_ids.extend(item['sentences'])
#             elif 'id' in item:
#                 sentence_ids.append(item['id'])
#         elif isinstance(item, str):
#             sentence_ids.append(item)
#         elif isinstance(item, list):
#             sentence_ids.extend(item)

#     return sentence_ids


# def extract_sentence_texts_from_final_structure(final_structure: List[Any], sentences_collection) -> List[str]:
#     """Extract sentence texts from the final structure sent by frontend"""
#     sentence_texts = []

#     for item in final_structure:
#         if isinstance(item, dict):
#             if item.get('type') == 'combined' and 'sentences' in item:
#                 for sent_id in item['sentences']:
#                     sent_doc = sentences_collection.find_one({"sentence_id": sent_id})
#                     if sent_doc:
#                         sentence_texts.append(sent_doc["text"].strip())
#             elif item.get('type') == 'sentence' and 'id' in item:
#                 sent_doc = sentences_collection.find_one({"sentence_id": item['id']})
#                 if sent_doc:
#                     sentence_texts.append(sent_doc["text"].strip())

#     return sentence_texts


# async def safe_json(request: Request):
#     """Parse JSON body safely; returns None if missing/invalid"""
#     try:
#         return await request.json()
#     except Exception:
#         return None


# # ============================================
# # ROUTES
# # ============================================

# @levels_routes.get("/api/levels")
# def get_levels():
#     """Get all levels summary from MongoDB"""
#     try:
#         pipeline = [
#             {
#                 "$group": {
#                     "_id": "$level",
#                     "taskCount": {"$addToSet": "$task_id"},
#                     "storyTitles": {"$addToSet": "$story_title"}
#                 }
#             }
#         ]

#         result = collection.aggregate(pipeline)

#         levels_summary = {}

#         for doc in result:
#             level = doc["_id"]
#             levels_summary[level] = {
#                 "name": level.capitalize(),
#                 "taskCount": len(doc["taskCount"]),
#                 "stories": doc["storyTitles"]
#             }

#         return JSONResponse(content=levels_summary, status_code=200)

#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)


# @levels_routes.get("/api/tasks/{category}/{level_name}")
# def get_tasks_by_category(category: str, level_name: str):
#     try:
#         level_name_lower = level_name.lower()

#         # Convert frontend category names to database category names
#         category_mapping = {
#             "Text Composition": "text_composition",
#             "Sentence Composition": "sentence_composition",
#             "Conversation": "conversations",  # DB has "conversations" not "conversation"
#             "Vocabulary": "vocabulary"
#         }

#         category_db = category_mapping.get(category, category.lower().replace(" ", "_"))

#         # ========== DEBUG START ==========
#         print("\n" + "=" * 50)
#         print(f"🔍 [DEBUG] API CALL: /api/tasks/{category}/{level_name}")
#         print(f"🔍 [DEBUG] Frontend category: '{category}'")
#         print(f"🔍 [DEBUG] Converted to category_db: '{category_db}'")
#         print(f"🔍 [DEBUG] Level: '{level_name_lower}'")
#         print(f"🔍 [DEBUG] Checking if '{category_db}' in ['text_composition', 'conversations']")
#         print(f"🔍 [DEBUG] Result: {category_db in ['text_composition', 'conversations']}")

#         if category not in category_mapping:
#             print(f"⚠️ [DEBUG] Category '{category}' not in mapping. Using default conversion.")

#         print("=" * 50)
#         # ========== DEBUG END ==========

#         # Check if category has data
#         if category_db not in ["text_composition", "conversations", "vocabulary"]:
#             print(f"⚠️ [BACKEND] Category '{category_db}' has no data - returning coming soon")
#             return JSONResponse(content={
#                 "category": category,
#                 "level": level_name_lower,
#                 "tasks": [],
#                 "coming_soon": True,
#                 "has_data": False,
#                 "message": f"Content for {category} is coming soon!"
#             }, status_code=200)

#         print(f"✅ [BACKEND] Category '{category_db}' is allowed - fetching data...")

#         # ========== VOCABULARY - FETCH FROM DB ==========
#         if category_db == "vocabulary":
#             sentences_collection, _ = get_db_collections()
#             pipeline = [
#                 {"$match": {"level": level_name_lower, "category": "vocabulary"}},
#                 {"$sort": {"created_at": 1}},
#                 {"$group": {
#                     "_id": "$task_id",
#                     "story_title": {"$first": "$story_title"},
#                     "words": {"$push": {
#                         "sentence_id": "$sentence_id",
#                         "word": "$word",
#                         "phonetic": "$phonetic",
#                         "wordType": "$wordType",
#                         "meaning": "$meaning",
#                         "domain": "$domain",
#                         "forms": "$forms",
#                         "examples": "$examples",
#                         "synonyms": "$synonyms",
#                         "antonyms": "$antonyms",
#                         "native": "$native",
#                         "image_url": "$image_url"
#                     }}
#                 }},
#                 {"$sort": {"_id": 1}}
#             ]
#             result = list(sentences_collection.aggregate(pipeline))
#             if not result:
#                 return JSONResponse(content={
#                     "category": category,
#                     "level": level_name_lower,
#                     "tasks": [],
#                     "coming_soon": False,
#                     "has_data": False,
#                     "message": f"No vocabulary tasks found for {level_name_lower} level"
#                 }, status_code=200)
#             tasks = []
#             for task in result:
#                 tasks.append({
#                     "id": task["_id"],
#                     "title": task["story_title"],
#                     "wordCount": len(task["words"]),
#                     "description": f"{len(task['words'])} vocabulary words to learn",
#                     "category": "vocabulary",
#                     "status": "ready",
#                     "words": task["words"]
#                 })
#             return JSONResponse(content={
#                 "category": category,
#                 "level": level_name_lower,
#                 "tasks": tasks,
#                 "coming_soon": False,
#                 "has_data": True,
#                 "message": f"Found {len(tasks)} vocabulary task groups"
#             }, status_code=200)

#         # ========== OTHER CATEGORIES ==========
#         print(f"\n📊 [DEBUG] Executing direct MongoDB queries...")

#         total_count = collection.count_documents({})
#         print(f"📊 [DEBUG] Total documents in collection: {total_count}")

#         query_filter = {
#             "level": level_name_lower,
#             "category": category_db
#         }
#         filtered_count = collection.count_documents(query_filter)
#         print(f"📊 [DEBUG] Query filter: {query_filter}")
#         print(f"📊 [DEBUG] Documents matching filter: {filtered_count}")

#         if filtered_count > 0:
#             sample_docs = list(collection.find(query_filter).limit(2))
#             print(f"📊 [DEBUG] Sample documents found:")
#             for i, doc in enumerate(sample_docs):
#                 print(f"  Document {i+1}:")
#                 print(f"    _id: {doc.get('_id')}")
#                 print(f"    sentence_id: {doc.get('sentence_id')}")
#                 print(f"    text: {doc.get('text')}")
#                 print(f"    category: {doc.get('category')}")
#                 print(f"    level: {doc.get('level')}")
#                 print(f"    task_id: {doc.get('task_id')}")
#         else:
#             print(f"❌ [DEBUG] NO DOCUMENTS FOUND with filter!")

#             all_categories = collection.distinct("category")
#             print(f"📋 [DEBUG] All categories in database: {all_categories}")

#             categories_for_level = collection.distinct("category", {"level": level_name_lower})
#             print(f"📋 [DEBUG] Categories for level '{level_name_lower}': {categories_for_level}")

#             print(f"🔎 [DEBUG] Searching for similar categories...")
#             all_docs = list(collection.find({"level": level_name_lower}).limit(5))
#             for doc in all_docs:
#                 if "conversation" in doc.get("category", "").lower():
#                     print(f"🔎 [DEBUG] Found related document:")
#                     print(f"    category: {doc.get('category')}")
#                     print(f"    text: {doc.get('text')}")

#         # ========== EXECUTE PIPELINE ==========
#         print(f"\n🚀 [DEBUG] Executing aggregation pipeline...")
#         pipeline = [
#             {
#                 "$match": {
#                     "level": level_name_lower,
#                     "category": category_db
#                 }
#             },
#             {"$sort": {"step_number": 1}},
#             {
#                 "$group": {
#                     "_id": "$task_id",
#                     "story_title": {"$first": "$story_title"},
#                     "sentences": {
#                         "$push": {
#                             "sentence_id": "$sentence_id",
#                             "text": "$text",
#                             "letter": "$letter",
#                             "step_number": "$step_number"
#                         }
#                     }
#                 }
#             }
#         ]

#         print(f"📋 [DEBUG] Pipeline stages:")
#         for i, stage in enumerate(pipeline):
#             print(f"  Stage {i+1}: {stage}")

#         result = list(collection.aggregate(pipeline))
#         print(f"✅ [DEBUG] Pipeline returned {len(result)} tasks")

#         if result:
#             print(f"📋 [DEBUG] First task in result:")
#             print(f"  task_id: {result[0].get('_id')}")
#             print(f"  story_title: {result[0].get('story_title')}")
#             print(f"  sentences count: {len(result[0].get('sentences', []))}")

#         print("=" * 50 + "\n")
#         # ========== END DEBUG ==========

#         if not result:
#             print(f"⚠️ [BACKEND] No tasks found for category '{category_db}'")
#             return JSONResponse(content={
#                 "category": category,
#                 "level": level_name_lower,
#                 "tasks": [],
#                 "coming_soon": False,
#                 "has_data": False,
#                 "message": "No tasks available for this level yet"
#             }, status_code=200)

#         tasks = []
#         for task in result:
#             tasks.append({
#                 "id": task["_id"],
#                 "title": task["story_title"],
#                 "sentenceCount": len(task["sentences"]),
#                 "sentences": task["sentences"]
#             })

#         print(f"📤 [BACKEND] Returning {len(tasks)} tasks for {category}")

#         return JSONResponse(content={
#             "category": category,
#             "level": level_name_lower,
#             "tasks": tasks,
#             "coming_soon": False,
#             "has_data": True,
#             "message": f"Found {len(tasks)} tasks"
#         }, status_code=200)

#     except Exception as e:
#         print(f"❌ [BACKEND] Error in get_tasks_by_category: {str(e)}")
#         traceback.print_exc()
#         return JSONResponse(content={"error": str(e)}, status_code=500)


# @levels_routes.get("/api/vocabulary/search")
# def search_vocabulary(word: str = Query("", description="Word to search"),
#                       domain: str = Query("", description="Optional domain")):
#     """Return cached vocabulary, or fetch a real dictionary entry and cache it."""
#     try:
#         word = word.strip()
#         domain = domain.strip()
#         if not word:
#             return JSONResponse(
#                 content={"found": False, "message": "No word provided"},
#                 status_code=400,
#             )

#         sentences_collection, _ = get_db_collections()
#         query = {
#             "category": "vocabulary",
#             "word": {"$regex": f"^{re.escape(word)}$", "$options": "i"},
#         }
#         if domain:
#             query["domain"] = {"$regex": f"^{re.escape(domain)}$", "$options": "i"}

#         # 1. Return cached data first; no external API call for known entries.
#         cached_doc = sentences_collection.find_one(query)
#         if cached_doc:
#             cached_doc["_id"] = str(cached_doc["_id"])
#             if isinstance(cached_doc.get("created_at"), datetime):
#                 cached_doc["created_at"] = cached_doc["created_at"].isoformat()
#             return JSONResponse(content={"found": True, "data": cached_doc, "cached": True}, status_code=200)

#         # 2. Fetch a real English dictionary entry for words not in MongoDB.
#         dictionary_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{requests.utils.quote(word)}"
#         api_response = requests.get(dictionary_url, timeout=12)
#         if api_response.status_code == 404:
#             return JSONResponse(
#                 content={"found": False, "message": f"No dictionary entry found for '{word}'."},
#                 status_code=200,
#             )
#         api_response.raise_for_status()
#         entries = api_response.json()
#         if not isinstance(entries, list) or not entries:
#             return JSONResponse(content={"found": False, "message": f"No dictionary entry found for '{word}'."}, status_code=200)

#         entry = entries[0]
#         meanings = entry.get("meanings") or []
#         definitions = []
#         examples = []
#         synonyms = []
#         antonyms = []
#         word_type = "Word"
#         for meaning_item in meanings:
#             if word_type == "Word" and meaning_item.get("partOfSpeech"):
#                 word_type = meaning_item["partOfSpeech"].capitalize()
#             for definition_item in meaning_item.get("definitions", []):
#                 definition = definition_item.get("definition", "").strip()
#                 if definition and definition not in definitions:
#                     definitions.append(definition)
#                 example = definition_item.get("example")
#                 if example and example not in examples:
#                     examples.append(example)
#                 synonyms.extend(definition_item.get("synonyms", []))
#                 antonyms.extend(definition_item.get("antonyms", []))
#             synonyms.extend(meaning_item.get("synonyms", []))
#             antonyms.extend(meaning_item.get("antonyms", []))

#         meaning = definitions[0] if definitions else "No definition is available from the dictionary source."
#         if not definitions:
#             return JSONResponse(content={"found": False, "message": f"No definition available for '{word}'."}, status_code=200)

#         phonetic = entry.get("phonetic") or next(
#             (item.get("text") for item in entry.get("phonetics", []) if item.get("text")), ""
#         )
#         generation_domain = domain or "General"
#         clean_word = entry.get("word", word).strip()
#         slug = re.sub(r"[^a-z0-9]+", "_", clean_word.lower()).strip("_") or "word"
#         timestamp = int(datetime.utcnow().timestamp())
#         task_id = f"easy_search_{slug}_{timestamp}"
#         sentence_id = f"{task_id}_vocab_{slug}"

#         # Dictionary API does not provide these fields consistently; leave them empty
#         # rather than inventing values. Native translations fall back gracefully in the UI.
#         vocab_doc = {
#             "sentence_id": sentence_id,
#             "task_id": task_id,
#             "level": "easy",
#             "story_title": "Dictionary API Search",
#             "category": "vocabulary",
#             "word": clean_word,
#             "phonetic": phonetic,
#             "wordType": word_type,
#             "meaning": meaning,
#             "domain": generation_domain,
#             "forms": [],
#             "examples": examples[:3],
#             "synonyms": list(dict.fromkeys(synonyms))[:6],
#             "antonyms": list(dict.fromkeys(antonyms))[:6],
#             "native": {},
#             "source": "dictionaryapi.dev",
#             "source_url": dictionary_url,
#             "created_at": datetime.utcnow(),
#         }

#         # Recheck before insert to reduce duplicate records from concurrent searches.
#         cached_doc = sentences_collection.find_one(query)
#         if cached_doc:
#             cached_doc["_id"] = str(cached_doc["_id"])
#             if isinstance(cached_doc.get("created_at"), datetime):
#                 cached_doc["created_at"] = cached_doc["created_at"].isoformat()
#             return JSONResponse(content={"found": True, "data": cached_doc, "cached": True}, status_code=200)

#         insert_result = sentences_collection.insert_one(vocab_doc)
#         vocab_doc["_id"] = str(insert_result.inserted_id)
#         vocab_doc["created_at"] = vocab_doc["created_at"].isoformat()
#         return JSONResponse(
#             content={"found": True, "data": vocab_doc, "cached": False, "source": "dictionaryapi.dev"},
#             status_code=200,
#         )

#     except requests.RequestException as e:
#         print(f"Dictionary API request failed for '{word}': {e}")
#         return JSONResponse(
#             content={"found": False, "message": "The dictionary service is temporarily unavailable. Please try again."},
#             status_code=502,
#         )
#     except Exception as e:
#         print(f"Error in search_vocabulary: {e}")
#         traceback.print_exc()
#         return JSONResponse(content={"found": False, "message": "Unable to search for this word."}, status_code=500)


# @levels_routes.get("/api/levels/{level_name}/tasks/{task_id}")
# def get_task(level_name: str, task_id: str):
#     """Get a specific task from MongoDB by level and task_id"""
#     try:
#         level_name_lower = level_name.lower()

#         sentences_collection, _ = get_db_collections()

#         sentences_cursor = sentences_collection.find(
#             {
#                 "level": level_name_lower,
#                 "task_id": task_id
#             }
#         ).sort("step_number", 1)

#         sentences = []
#         category = "text_composition"  # Default
#         for doc in sentences_cursor:
#             sentences.append({
#                 "sentence_id": doc["sentence_id"],
#                 "text": doc["text"],
#                 "letter": doc.get("letter", ""),
#                 "step_number": doc.get("step_number", 0)
#             })
#             if "category" in doc:
#                 category = doc["category"]

#         if not sentences:
#             return JSONResponse(content={"error": "Task not found"}, status_code=404)

#         story_doc = sentences_collection.find_one(
#             {"level": level_name_lower, "task_id": task_id},
#             {"story_title": 1, "category": 1, "_id": 0}
#         )

#         task = {
#             "id": task_id,
#             "title": story_doc.get("story_title", f"Task {task_id}") if story_doc else f"Task {task_id}",
#             "category": story_doc.get("category", "text_composition") if story_doc else "text_composition",
#             "sentenceCount": len(sentences),
#             "sentences": sentences
#         }

#         return JSONResponse(content={
#             "level": level_name_lower,
#             "task": task,
#             "has_data": True
#         }, status_code=200)

#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)


# @levels_routes.get("/api/select-relations/{level_name}/{task_id}")
# def get_task_relations(level_name: str, task_id: str):
#     """Get select relations data for a specific task FROM MONGODB"""
#     try:
#         level_name_lower = level_name.lower()

#         sentences_collection, _ = get_db_collections()

#         sentences_cursor = sentences_collection.find(
#             {
#                 "level": level_name_lower,
#                 "task_id": task_id,
#                 "category": "text_composition"
#             }
#         ).sort("step_number", 1)

#         sentences = []
#         for doc in sentences_cursor:
#             sentences.append({
#                 "text": doc.get("text", ""),
#                 "sentence_id": doc.get("sentence_id", ""),
#                 "letter": doc.get("letter", ""),
#                 "step_number": doc.get("step_number", 0),
#                 "level": doc.get("level", ""),
#                 "task_id": doc.get("task_id", "")
#             })

#         if not sentences:
#             return JSONResponse(content={"error": "No sentences found for this task"}, status_code=404)

#         story_doc = sentences_collection.find_one(
#             {"level": level_name_lower, "task_id": task_id},
#             {"story_title": 1, "_id": 0}
#         )

#         task_title = story_doc.get("story_title", f"Task {task_id}") if story_doc else f"Task {task_id}"

#         return JSONResponse(content={
#             "level": level_name_lower,
#             "taskId": task_id,
#             "taskTitle": task_title,
#             "sentences": sentences,
#             "instructions": "Select and combine sentences using appropriate relations (because, and, then, however, etc.)"
#         }, status_code=200)
#     except Exception as e:
#         traceback.print_exc()
#         return JSONResponse(content={"error": str(e)}, status_code=500)


# # ============================================
# # EVALUATION ENDPOINT
# # ============================================

# @levels_routes.post("/api/evaluate-combination")
# async def evaluate_combination(request: Request):
#     """Evaluate the combined sentence with focus on CORRECT RELATIONS"""
#     try:
#         data = await safe_json(request)

#         if not data:
#             return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

#         task_id = data.get("task_id")
#         level = data.get("level")
#         combined_text = (data.get("combined_text", "") or "").strip()
#         selected_sentences_data = data.get("selected_sentences", [])

#         print(f"📥 Received evaluation request:")
#         print(f"   Task ID: {task_id}")
#         print(f"   Level: {level}")
#         print(f"   Selected sentences data: {selected_sentences_data}")
#         print(f"   Combined text: '{combined_text}'")

#         if not all([task_id, level, combined_text]):
#             return JSONResponse(content={
#                 "status": "error",
#                 "message": "Missing required fields: task_id, level, combined_text"
#             }, status_code=400)

#         sentences_collection, paragraphs_collection = get_db_collections()

#         reference_story = get_reference_story(level, task_id)

#         print("📚 Reference story returned:", repr(reference_story))

#         if not reference_story:
#             return JSONResponse(content={
#                 "status": "error",
#                 "message": f"No reference story found for task_id: {task_id}, level: {level}"
#             }, status_code=404)

#         # Extract sentence IDs
#         selected_sentence_ids = []
#         if isinstance(selected_sentences_data, list):
#             selected_sentence_ids = extract_sentence_ids_from_selected(selected_sentences_data)
#         elif isinstance(selected_sentences_data, str):
#             selected_sentence_ids = [selected_sentences_data]

#         # Get sentence texts
#         sentence_texts = []
#         if selected_sentence_ids:
#             sentence_texts = get_sentence_texts(selected_sentence_ids, sentences_collection)
#         else:
#             sentence_texts = extract_sentence_texts_from_final_structure(selected_sentences_data, sentences_collection)

#         if not sentence_texts:
#             return JSONResponse(content={
#                 "status": "error",
#                 "message": "Could not extract sentence texts from selected_sentences"
#             }, status_code=400)

#         if len(sentence_texts) < 2:
#             return JSONResponse(content={
#                 "status": "error",
#                 "message": "Please select at least 2 sentences to combine"
#             }, status_code=400)

#         evaluation_result = story_evaluator.evaluate_combination(combined_text, sentence_texts, reference_story)

#         similarity_percentage = evaluation_result.get('similarity_percentage', 0)
#         overall_score = evaluation_result['overall_score']

#         if similarity_percentage >= 80:
#             message = "🎯 Excellent! Your combination is very close to the reference."
#         elif similarity_percentage >= 60:
#             message = "👍 Good job! Your combination is mostly correct."
#         elif similarity_percentage >= 40:
#             message = "📝 Getting there. Check the relation you used."
#         else:
#             message = "🔍 Review how these sentences should be connected."

#         response = {
#             "status": "success",
#             "is_correct": evaluation_result['is_correct'],
#             "overall_score": overall_score,
#             "similarity_score": round(overall_score * 10, 1),
#             "similarity_percentage": similarity_percentage,
#             "message": message,
#             "user_combined_text": combined_text,
#             "selected_sentences": sentence_texts,
#             "selected_sentence_ids": selected_sentence_ids,
#             "user_relation": evaluation_result.get('user_relation', {}),
#             "feedback": evaluation_result.get('feedback', []),
#             "found_in_reference": evaluation_result.get('found_in_reference', False),
#             "reference_story": reference_story
#         }

#         if evaluation_result.get('correct_combination'):
#             response["expected_correct_text"] = evaluation_result['correct_combination']
#             response["correct_relation"] = evaluation_result.get('correct_relation', {})
#             response["relation_correct"] = evaluation_result.get('relation_correct', False)
#         elif evaluation_result.get('suggested_relation'):
#             response["suggested_relation"] = evaluation_result['suggested_relation']
#             response["individual_sentences"] = evaluation_result.get('individual_sentences', [])

#         return JSONResponse(content=response, status_code=200)

#     except Exception as e:
#         print(f"❌ CRITICAL ERROR in evaluate-combination: {str(e)}")
#         traceback.print_exc()
#         return JSONResponse(content={
#             "status": "error",
#             "message": f"Internal server error: {str(e)}"
#         }, status_code=500)


# # ============================================
# # OTHER ROUTES
# # ============================================

# @levels_routes.get("/api/get-sentences-with-id/{recipe_id}")
# def get_sentences_with_id(recipe_id: str):
#     """Get sentences/instructions for a specific recipe FROM MONGODB"""
#     try:
#         sentences_collection, _ = get_db_collections()

#         sentences_cursor = sentences_collection.find(
#             {"task_id": recipe_id}
#         ).sort("step_number", 1)

#         sentences = []
#         for doc in sentences_cursor:
#             sentences.append({
#                 "text": doc["text"],
#                 "sentence_id": doc["sentence_id"],
#                 "letter": doc.get("letter", ""),
#                 "step_number": doc.get("step_number", 0),
#                 "level": doc.get("level", ""),
#                 "task_id": doc.get("task_id", "")
#             })

#         if not sentences:
#             return JSONResponse(content={
#                 "status": "error",
#                 "message": f"No sentences found for recipe_id: {recipe_id}"
#             }, status_code=404)

#         return JSONResponse(content={
#             "status": "success",
#             "recipe_id": recipe_id,
#             "sentences": sentences,
#         }, status_code=200)

#     except Exception as e:
#         return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# # Initialize discourse relations
# discourse_relations = []


# @levels_routes.post("/api/add-discourse")
# async def add_discourse(request: Request):
#     """Add a discourse relation between two sentences"""
#     try:
#         data = await safe_json(request)

#         if not data:
#             return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

#         sentence1_id = data.get("sentence1_id")
#         sentence2_id = data.get("sentence2_id")
#         relation = data.get("relation")

#         if not all([sentence1_id, sentence2_id, relation]):
#             return JSONResponse(content={
#                 "status": "error",
#                 "message": "Missing required fields: sentence1_id, sentence2_id, relation",
#             }, status_code=400)

#         discourse_entry = {
#             "id": len(discourse_relations) + 1,
#             "sentence1_id": sentence1_id,
#             "sentence2_id": sentence2_id,
#             "relation": relation,
#             "timestamp": datetime.now().isoformat(),
#         }

#         discourse_relations.append(discourse_entry)

#         return JSONResponse(content={
#             "status": "success",
#             "message": "Discourse relation added successfully",
#             "data": discourse_entry,
#         }, status_code=200)

#     except Exception as e:
#         return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# @levels_routes.post("/api/remove-discourse")
# async def remove_discourse(request: Request):
#     """Remove discourse relations for given sentence IDs"""
#     try:
#         data = await safe_json(request)

#         if not data:
#             return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

#         sentence_ids = data.get("sentence_ids", [])

#         if not sentence_ids:
#             return JSONResponse(content={"status": "error", "message": "No sentence_ids provided"}, status_code=400)

#         global discourse_relations
#         original_count = len(discourse_relations)

#         discourse_relations = [
#             rel
#             for rel in discourse_relations
#             if rel["sentence1_id"] not in sentence_ids
#             and rel["sentence2_id"] not in sentence_ids
#         ]

#         removed_count = original_count - len(discourse_relations)

#         return JSONResponse(content={
#             "status": "success",
#             "message": f"Removed {removed_count} discourse relation(s)",
#             "removed_count": removed_count,
#         }, status_code=200)

#     except Exception as e:
#         return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# @levels_routes.get("/api/get-discourse/{recipe_id}")
# def get_discourse(recipe_id: str):
#     """Get all discourse relations for a recipe"""
#     try:
#         return JSONResponse(content={
#             "status": "success",
#             "recipe_id": recipe_id,
#             "relations": discourse_relations,
#         }, status_code=200)
#     except Exception as e:
#         return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# @levels_routes.post("/api/generate-running-text")
# async def generate_running_text(request: Request):
#     """Generate running text from ordered sentences"""
#     try:
#         data = await safe_json(request)

#         if not data:
#             return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

#         recipe_id = data.get("recipe_id")
#         sentence_order = data.get("sentence_order", [])
#         ui_language = data.get("ui_language", "english")
#         evaluate = data.get("evaluate", False)

#         if not recipe_id or not sentence_order:
#             return JSONResponse(content={
#                 "status": "error",
#                 "message": "Missing required fields: recipe_id, sentence_order",
#             }, status_code=400)

#         sentences_collection, _ = get_db_collections()

#         sentences_cursor = sentences_collection.find(
#             {"task_id": recipe_id}
#         ).sort("step_number", 1)

#         sentence_map = {}
#         for doc in sentences_cursor:
#             sentence_map[doc["sentence_id"]] = doc["text"]

#         if not sentence_map:
#             return JSONResponse(content={
#                 "status": "error",
#                 "message": f"No sentences found for recipe_id: {recipe_id}"
#             }, status_code=404)

#         generated_sentences = []
#         sentence_ids_for_eval = []

#         for item in sentence_order:
#             if isinstance(item, dict):
#                 if 'type' in item and item['type'] == 'combined':
#                     if 'text' in item and item['text']:
#                         combined_text = item['text']
#                         generated_sentences.append(combined_text)
#                         if 'sentences' in item:
#                             sentence_ids_for_eval.extend(item['sentences'])
#                     elif 'sentences' in item:
#                         combined_parts = []
#                         for sid in item['sentences']:
#                             text = sentence_map.get(sid, "")
#                             if text:
#                                 combined_parts.append(text)
#                         if combined_parts:
#                             combined_text = " ".join(combined_parts)
#                             generated_sentences.append(combined_text)
#                             sentence_ids_for_eval.extend(item['sentences'])
#                 elif 'id' in item:
#                     text = sentence_map.get(item['id'], "")
#                     if text:
#                         generated_sentences.append(text)
#                         sentence_ids_for_eval.append(item['id'])
#             elif isinstance(item, list):
#                 combined_parts = []
#                 for sid in item:
#                     text = sentence_map.get(sid, "")
#                     if text:
#                         combined_parts.append(text)
#                 if combined_parts:
#                     combined_text = " ".join(combined_parts)
#                     generated_sentences.append(combined_text)
#                     sentence_ids_for_eval.extend(item)
#             elif isinstance(item, str):
#                 text = sentence_map.get(item, "")
#                 if text:
#                     generated_sentences.append(text)
#                     sentence_ids_for_eval.append(item)

#         # Join with period and space
#         running_text = ". ".join(generated_sentences)
#         if running_text and not running_text.endswith('.'):
#             running_text += '.'
#         running_text = running_text.replace('..', '.')

#         paragraph_wrapped = f"<p>{running_text}</p>"

#         response = {
#             "status": "success",
#             "generated_text": running_text,
#             "generator_response": {
#                 "paragraph": running_text,
#                 "paragraph_wrapped": paragraph_wrapped,
#             },
#             "sentence_count": len(generated_sentences),
#         }

#         if evaluate and running_text:
#             try:
#                 level = recipe_id.split("_")[0] if "_" in recipe_id else ""
#                 reference_story = get_reference_story(level, recipe_id)

#                 if reference_story:
#                     eval_sentence_texts = get_sentence_texts(sentence_ids_for_eval, sentences_collection)
#                     evaluation_result = story_evaluator.evaluate_combination(running_text, eval_sentence_texts, reference_story)

#                     response["evaluation"] = {
#                         "is_correct": evaluation_result['is_correct'],
#                         "overall_score": evaluation_result['overall_score'],
#                         "similarity_percentage": evaluation_result.get('similarity_percentage', 0),
#                         "feedback": evaluation_result.get('feedback', [])
#                     }

#             except Exception as eval_error:
#                 print(f"⚠️ Evaluation error: {eval_error}")

#         return JSONResponse(content=response, status_code=200)

#     except Exception as e:
#         print(f"❌ ERROR in generate-running-text: {str(e)}")
#         traceback.print_exc()
#         return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# @levels_routes.post("/api/submit-relations")
# async def submit_relations(request: Request):
#     """Submit selected relations for evaluation"""
#     try:
#         data = await safe_json(request)

#         if not data:
#             return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

#         response = {
#             "status": "success",
#             "message": "Relations submitted successfully",
#             "timestamp": datetime.now().isoformat(),
#             "data": data,
#         }

#         return JSONResponse(content=response, status_code=200)

#     except Exception as e:
#         return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# @levels_routes.get("/api/get-paragraph/{task_id}/{level}")
# def get_paragraph(task_id: str, level: str):
#     """Get the correct paragraph for debugging"""
#     try:
#         reference_story = get_reference_story(level, task_id)

#         if not reference_story:
#             return JSONResponse(content={
#                 "status": "error",
#                 "message": f"No paragraph found for task_id: {task_id}, level: {level}"
#             }, status_code=404)

#         return JSONResponse(content={
#             "status": "success",
#             "task_id": task_id,
#             "level": level,
#             "paragraph_text": reference_story,
#             "paragraph_id": f"{level}_{task_id}"
#         }, status_code=200)

#     except Exception as e:
#         return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# @levels_routes.post("/api/test-relation-evaluator")
# async def test_relation_evaluator(request: Request):
#     """Test the relation evaluator with custom text"""
#     try:
#         data = await safe_json(request)

#         if not data:
#             return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

#         test_text = (data.get("text", "") or "").strip()
#         sentence1 = (data.get("sentence1", "") or "").strip()
#         sentence2 = (data.get("sentence2", "") or "").strip()
#         reference_text = (data.get("reference_text", "") or "").strip()

#         if not all([test_text, sentence1, sentence2, reference_text]):
#             return JSONResponse(content={
#                 "status": "error",
#                 "message": "All fields required: text, sentence1, sentence2, reference_text"
#             }, status_code=400)

#         evaluation_result = story_evaluator.evaluate_combination(
#             test_text,
#             [sentence1, sentence2],
#             reference_text
#         )

#         return JSONResponse(content={
#             "status": "success",
#             "test_text": test_text,
#             "evaluation": evaluation_result,
#             "timestamp": datetime.now().isoformat()
#         }, status_code=200)

#     except Exception as e:
#         return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# @levels_routes.get("/api/relation-evaluation-info")
# def relation_evaluation_info():
#     """Get information about the relation-focused evaluation model"""
#     return JSONResponse(content={
#         "status": "success",
#         "model": "Relation-Focused Story Evaluator",
#         "version": "1.0",
#         "supported_relations": {
#             "causal": ["because", "since", "therefore", "thus", "hence", "consequently"],
#             "temporal": ["then", "next", "after", "before", "while", "when", "finally"],
#             "contrast": ["but", "however", "although", "though", "nevertheless", "yet"],
#             "addition": ["and", "also", "furthermore", "moreover", "additionally"]
#         },
#         "scoring": {
#             "scale": "0-10",
#             "threshold": "6.0+ for 'correct'",
#             "weights": {
#                 "similarity": "70%",
#                 "relation_correctness": "30%"
#             }
#         }
#     }, status_code=200)


# @levels_routes.get("/api/debug-test")
# def debug_test():
#     print("🎯🎯🎯 DEBUG TEST ENDPOINT HIT 🎯🎯🎯")
#     print(f"Current time: {datetime.now()}")

#     try:
#         count = collection.count_documents({})
#         print(f"📊 Total documents in collection: {count}")

#         conv_count = collection.count_documents({"category": "conversations"})
#         print(f"📊 Conversations documents: {conv_count}")

#         categories = collection.distinct("category")
#         print(f"📊 All categories in DB: {categories}")

#     except Exception as e:
#         print(f"❌ MongoDB error: {e}")

#     return JSONResponse(content={
#         "status": "debug test successful",
#         "message": "Check terminal for debug output"
#     })


# @levels_routes.post("/api/save-generated-text")
# async def save_generated_text(request: Request):
#     """Save generated text to database"""
#     try:
#         data = await safe_json(request)

#         if not data:
#             return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

#         generated_text = data.get("generated_text")
#         level = data.get("level")
#         task_id = data.get("task_id")
#         final_structure = data.get("final_structure", [])
#         evaluation_result = data.get("evaluation_result", {})

#         if not all([generated_text, level, task_id]):
#             return JSONResponse(content={
#                 "status": "error",
#                 "message": "Missing required fields: generated_text, level, task_id"
#             }, status_code=400)

#         sentences_collection, _ = get_db_collections()

#         story_doc = sentences_collection.find_one(
#             {"task_id": task_id, "level": level},
#             {"story_title": 1}
#         )

#         if story_doc and "story_title" in story_doc:
#             title = story_doc["story_title"]
#         else:
#             title = f"Task {task_id}"

#         saved_texts_collection = app_db["saved_texts"]

#         saved_text = {
#             "generated_text": generated_text,
#             "level": level,
#             "task_id": task_id,
#             "title": title,
#             "final_structure": final_structure,
#             "evaluation_result": evaluation_result,
#             "created_at": datetime.utcnow()
#         }

#         result = saved_texts_collection.insert_one(saved_text)
#         saved_text["_id"] = str(result.inserted_id)
#         saved_text["created_at"] = saved_text["created_at"].isoformat()

#         return JSONResponse(content={
#             "status": "success",
#             "message": "Text saved successfully",
#             "saved_text_id": str(result.inserted_id),
#             "data": saved_text
#         }, status_code=200)

#     except Exception as e:
#         print(f"❌ Error saving text: {str(e)}")
#         traceback.print_exc()
#         return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# @levels_routes.get("/api/get-saved-texts")
# def get_saved_texts():
#     """Get all saved texts from database"""
#     try:
#         saved_texts_collection = app_db["saved_texts"]

#         saved_texts = list(saved_texts_collection.find().sort("created_at", -1))

#         for text in saved_texts:
#             text["_id"] = str(text["_id"])
#             if "created_at" in text and isinstance(text["created_at"], datetime):
#                 text["created_at"] = text["created_at"].isoformat()

#             if "title" not in text:
#                 text["title"] = f"Task {text.get('task_id', 'Unknown')}"

#         return JSONResponse(content={
#             "status": "success",
#             "count": len(saved_texts),
#             "saved_texts": saved_texts
#         }, status_code=200)

#     except Exception as e:
#         print(f"❌ Error getting saved texts: {str(e)}")
#         traceback.print_exc()
#         return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# @levels_routes.delete("/api/delete-saved-text/{text_id}")
# def delete_saved_text(text_id: str):
#     """Delete a saved text by ID"""
#     try:
#         if not text_id:
#             return JSONResponse(content={"status": "error", "message": "Text ID required"}, status_code=400)

#         saved_texts_collection = app_db["saved_texts"]

#         result = saved_texts_collection.delete_one({"_id": ObjectId(text_id)})

#         if result.deleted_count == 0:
#             return JSONResponse(content={"status": "error", "message": "Text not found"}, status_code=404)

#         return JSONResponse(content={
#             "status": "success",
#             "message": "Text deleted successfully",
#             "deleted_count": result.deleted_count
#         }, status_code=200)

#     except Exception as e:
#         print(f"❌ Error deleting text: {str(e)}")
#         traceback.print_exc()
#         return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)




from fastapi import APIRouter, Request, Query, Path
from fastapi.responses import JSONResponse
from datetime import datetime
from bson import ObjectId
import os
from dotenv import load_dotenv
import nltk
import numpy as np
from typing import Dict, List, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import traceback
import requests
from db import collection, db as app_db

# Load environment variables
load_dotenv()

levels_routes = APIRouter()

# NOTE: In main.py include with: app.include_router(levels_routes)
# The database handle is imported from db (db.py must expose `db`).
# If you prefer to attach it to the app, set `app.state.db = db` and
# replace `app_db` usage below with `request.app.state.db`.

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', quiet=True)

# ============================================
# RELATION-FOCUSED STORY EVALUATOR
# ============================================

class RelationFocusedEvaluator:
    """
    Evaluator that focuses on finding the correct relation between sentences
    """

    def __init__(self):
        """Initialize the relation-focused evaluator"""
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=1000
        )

        # All possible discourse relations
        self.discourse_relations = {
            'causal': ['because', 'since', 'therefore', 'thus', 'hence', 'consequently', 'as', 'so'],
            'temporal': ['then', 'next', 'after', 'before', 'while', 'when', 'finally', 'later', 'as', 'during', 'meanwhile'],
            'contrast': ['but', 'however', 'although', 'though', 'nevertheless', 'yet', 'whereas', 'while', 'on the other hand'],
            'addition': ['and', 'also', 'furthermore', 'moreover', 'additionally', 'besides', 'in addition'],
            'exemplification': ['for example', 'for instance', 'such as', 'specifically'],
            'result': ['so', 'therefore', 'thus', 'consequently', 'as a result', 'hence'],
            'purpose': ['so that', 'in order to', 'so as to'],
            'condition': ['if', 'unless', 'provided that', 'as long as']
        }

        # Flatten all relations for checking
        self.all_relations = []
        for relations in self.discourse_relations.values():
            self.all_relations.extend(relations)

        print("✅ RelationFocusedEvaluator initialized")

    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess text"""
        text = text.lower()
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts"""
        if not text1 or not text2:
            return 0.0

        text1_clean = self.preprocess_text(text1)
        text2_clean = self.preprocess_text(text2)

        try:
            tfidf_matrix = self.vectorizer.fit_transform([text1_clean, text2_clean])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except Exception as e:
            print(f"Error calculating similarity: {e}")
            return 0.0

    def find_used_relation(self, text: str) -> Dict[str, Any]:
        """Find which discourse relation is used in the text"""
        text_lower = text.lower()

        used_relation = None
        relation_type = None

        for rel_type, relations in self.discourse_relations.items():
            for relation in relations:
                # Check if relation appears as a separate word (with word boundaries)
                pattern = r'\b' + re.escape(relation) + r'\b'
                if re.search(pattern, text_lower):
                    used_relation = relation
                    relation_type = rel_type
                    break
            if used_relation:
                break

        # Also check for comma usage (implicit relation)
        if ',' in text and not used_relation:
            used_relation = ','
            relation_type = 'implicit'

        return {
            'relation': used_relation,
            'type': relation_type,
            'text': text
        }

    def find_correct_combination(self, sentence_texts: List[str], reference_story: str) -> Dict[str, Any]:
        """
        Find how these sentences are actually combined in the reference story
        Returns the correct combined version and the relation used
        """
        if not sentence_texts or len(sentence_texts) < 2:
            return {
                'found': False,
                'message': 'Need at least 2 sentences to find a relation'
            }

        # Preprocess texts
        reference_lower = reference_story.lower()
        sentence_texts_lower = [self.preprocess_text(s) for s in sentence_texts]

        # Tokenize the reference story into sentences
        try:
            reference_sentences = nltk.sent_tokenize(reference_story)
        except Exception as e:
            print(f"Error tokenizing reference story: {e}")
            # Fallback to simple period splitting
            reference_sentences = [s.strip() for s in reference_story.split('.') if s.strip()]

        # Look through each sentence in the reference story
        for ref_sent in reference_sentences:
            ref_sent_lower = ref_sent.lower()

            # Check if ALL sentence texts appear in this reference sentence
            all_found = True
            for text in sentence_texts_lower:
                if text not in ref_sent_lower:
                    all_found = False
                    break

            if all_found:
                # We found the combined sentence!
                combined = ref_sent.strip()

                # Find what relation is used
                relation_info = self.find_used_relation(combined)

                return {
                    'found': True,
                    'correct_combination': combined,
                    'relation_info': relation_info,
                    'original_sentences': sentence_texts
                }

        # If not found in the same sentence, try to find them in consecutive sentences
        for i in range(len(reference_sentences) - 1):
            current_sent = reference_sentences[i].lower()
            next_sent = reference_sentences[i + 1].lower()

            # Check if first sentence is in current_sent and second in next_sent
            if (sentence_texts_lower[0] in current_sent and
                len(sentence_texts_lower) > 1 and
                sentence_texts_lower[1] in next_sent):

                combined = reference_sentences[i].strip() + " " + reference_sentences[i + 1].strip()
                relation_info = self.find_used_relation(combined)

                return {
                    'found': True,
                    'correct_combination': combined,
                    'relation_info': relation_info,
                    'original_sentences': sentence_texts
                }

        # If still not found, check if sentences appear individually in the story
        individual_sentences = []
        for text in sentence_texts:
            for sent in reference_sentences:
                if self.preprocess_text(text) in self.preprocess_text(sent):
                    individual_sentences.append(sent)
                    break

        if len(individual_sentences) >= 2:
            # Analyze what relation might be appropriate
            suggested_relation = self.suggest_relation(sentence_texts[0], sentence_texts[1])

            return {
                'found': False,
                'individual_sentences': individual_sentences,
                'suggested_relation': suggested_relation,
                'message': 'Sentences not found combined in reference. Suggested relation based on meaning.'
            }

        return {
            'found': False,
            'message': 'Could not find sentences in reference story'
        }

    def suggest_relation(self, sentence1: str, sentence2: str) -> Dict[str, Any]:
        """Suggest an appropriate relation between two sentences based on their content"""
        s1_lower = sentence1.lower()
        s2_lower = sentence2.lower()

        # Pattern 1: First sentence shows effect, second shows cause
        effect_keywords = ['missed', 'failed', 'could not', 'did not', 'unable to', 'forgot', 'lost']
        cause_keywords = ['because', 'since', 'due to', 'as a result of', 'woke up', 'was late', 'was sick', 'was tired']

        # Check if first sentence has effect and second shows cause
        has_effect = any(word in s1_lower for word in effect_keywords)
        has_cause_indicators = any(word in s2_lower for word in ['late', 'early', 'sick', 'tired', 'forgot', 'busy', 'traffic'])

        if has_effect and has_cause_indicators:
            return {'relation': 'because', 'type': 'causal', 'explanation': 'Shows cause and effect'}

        # Check for temporal relationships
        temporal_keywords = ['then', 'after', 'before', 'when', 'while', 'during', 'later', 'next']
        if any(word in s1_lower for word in temporal_keywords) or any(word in s2_lower for word in temporal_keywords):
            return {'relation': 'then', 'type': 'temporal', 'explanation': 'Shows time sequence'}

        # Check for contrast
        contrast_keywords = ['but', 'however', 'although', 'though', 'yet', 'whereas']
        if any(word in s1_lower for word in contrast_keywords) or any(word in s2_lower for word in contrast_keywords):
            return {'relation': 'but', 'type': 'contrast', 'explanation': 'Shows contrast'}

        # Check for result
        result_keywords = ['so', 'therefore', 'thus', 'consequently']
        if any(word in s1_lower for word in result_keywords) or any(word in s2_lower for word in result_keywords):
            return {'relation': 'so', 'type': 'result', 'explanation': 'Shows result'}

        # Default to addition
        return {'relation': 'and', 'type': 'addition', 'explanation': 'Adds information'}

    def evaluate_combination(self, user_combined: str, sentence_texts: List[str], reference_story: str) -> Dict[str, Any]:
        """Evaluate the user's combination against the correct one"""
        # Find correct combination
        correct_info = self.find_correct_combination(sentence_texts, reference_story)

        # Analyze user's combination
        user_relation_info = self.find_used_relation(user_combined)

        if correct_info['found']:
            # Calculate similarity with correct combination
            similarity = self.calculate_similarity(user_combined, correct_info['correct_combination'])

            # Check if relation is correct
            relation_correct = False
            if user_relation_info['relation'] and correct_info['relation_info']['relation']:
                user_rel = user_relation_info['relation'].lower()
                correct_rel = correct_info['relation_info']['relation'].lower()
                relation_correct = user_rel == correct_rel

            # Score based on similarity and relation correctness
            similarity_score = similarity * 10  # Convert to 0-10 scale
            relation_score = 10 if relation_correct else 5  # Penalty for wrong relation

            overall_score = (similarity_score * 0.7) + (relation_score * 0.3)

            return {
                'overall_score': round(float(overall_score), 2),
                'similarity_score': round(float(similarity), 3),
                'similarity_percentage': round(float(similarity) * 100, 1),
                'relation_correct': relation_correct,
                'user_relation': user_relation_info,
                'correct_combination': correct_info['correct_combination'],
                'correct_relation': correct_info['relation_info'],
                'is_correct': bool(overall_score >= 6.0),
                'feedback': self._generate_feedback(similarity, relation_correct, correct_info, user_combined),
                'found_in_reference': True
            }
        else:
            # Couldn't find exact combination, use general evaluation
            similarity = self.calculate_similarity(user_combined, reference_story)
            similarity_score = similarity * 10

            return {
                'overall_score': round(float(similarity_score), 2),
                'similarity_score': round(float(similarity), 3),
                'similarity_percentage': round(float(similarity) * 100, 1),
                'relation_correct': None,
                'user_relation': user_relation_info,
                'correct_combination': None,
                'suggested_relation': correct_info.get('suggested_relation'),
                'individual_sentences': correct_info.get('individual_sentences'),
                'is_correct': bool(similarity_score >= 6.0),
                'feedback': ["Sentences not found combined in reference. Check if you're combining the right sentences."],
                'found_in_reference': False
            }

    def _generate_feedback(self, similarity: float, relation_correct: bool, correct_info: Dict, user_combined: str = "") -> List[str]:
        """Generate feedback based on evaluation"""
        feedback = []

        if similarity >= 0.8:
            feedback.append("🎯 Excellent combination! Very close to the original.")
        elif similarity >= 0.6:
            feedback.append("👍 Good combination. Close to the reference.")
        elif similarity >= 0.4:
            feedback.append("📝 Reasonable attempt. Some differences from reference.")
        else:
            feedback.append("🔍 Needs improvement. Significant differences from reference.")

        if correct_info.get('found', False):
            if relation_correct:
                feedback.append("✅ Correct relation used!")
            else:
                correct_rel = correct_info.get('relation_info', {}).get('relation', '')
                user_rel_info = self.find_used_relation(user_combined)
                user_rel = user_rel_info.get('relation', '')

                if correct_rel:
                    if correct_rel == ',':
                        feedback.append("ℹ️ Try connecting the sentences with a comma and appropriate conjunction.")
                    else:
                        feedback.append(f"ℹ️ The correct relation should be: '{correct_rel}'")

                # Add more specific feedback based on relation type
                correct_type = correct_info.get('relation_info', {}).get('type', '')
                if correct_type == 'causal':
                    feedback.append("💡 This is a cause-effect relationship. The second sentence explains why the first happened.")
                elif correct_type == 'temporal':
                    feedback.append("⏰ This shows a time sequence. Use words like 'then', 'after', or 'before'.")

        return feedback


# Global evaluator instance
story_evaluator = RelationFocusedEvaluator()

# --------------------------------------------
# HELPER FUNCTIONS
# --------------------------------------------

def get_db_collections():
    """Get database collections"""
    sentences_collection = app_db["sentences"]
    paragraphs_collection = app_db["educational_platform_db.paragraphs"]
    return sentences_collection, paragraphs_collection


def get_mongo_task_id(level_name, task_id):
    return f"{level_name.lower()}_{task_id}"


def get_reference_story(level: str, task_id: str) -> str:
    """Get the complete reference story from MongoDB"""
    try:
        sentences_collection, paragraphs_collection = get_db_collections()

        # First: Try paragraph collection
        paragraph_doc = paragraphs_collection.find_one({
            "task_id": task_id,
            "level": level
        })

        if paragraph_doc and "paragraph_text" in paragraph_doc:
            print("paragraph_doc", paragraph_doc)
            return paragraph_doc["paragraph_text"].strip()

        # Fallback: reconstruct from sentences collection
        sentences_cursor = sentences_collection.find(
            {"task_id": task_id, "level": level}
        ).sort("step_number", 1)

        story_parts = [doc["text"] for doc in sentences_cursor if "text" in doc]

        return " ".join(story_parts).strip()

    except Exception as e:
        print(f"❌ Error getting reference story for task_id={task_id}, level={level}: {e}")
        return ""


def get_sentence_texts(sentence_ids: List[str], sentences_collection) -> List[str]:
    """Get the actual text of sentences given their IDs"""
    if not sentence_ids:
        return []

    texts = []
    for sent_id in sentence_ids:
        sent_doc = sentences_collection.find_one({"sentence_id": sent_id})
        if sent_doc:
            texts.append(sent_doc["text"].strip())

    return texts


def extract_sentence_ids_from_selected(sentence_order: List[Any]) -> List[str]:
    """
    Extract all sentence IDs from the sentence order array
    Handles both simple IDs and combined sentence objects
    """
    sentence_ids = []

    for item in sentence_order:
        if isinstance(item, dict):
            if 'type' in item and item['type'] == 'combined' and 'sentences' in item:
                sentence_ids.extend(item['sentences'])
            elif 'id' in item:
                sentence_ids.append(item['id'])
        elif isinstance(item, str):
            sentence_ids.append(item)
        elif isinstance(item, list):
            sentence_ids.extend(item)

    return sentence_ids


def extract_sentence_texts_from_final_structure(final_structure: List[Any], sentences_collection) -> List[str]:
    """Extract sentence texts from the final structure sent by frontend"""
    sentence_texts = []

    for item in final_structure:
        if isinstance(item, dict):
            if item.get('type') == 'combined' and 'sentences' in item:
                for sent_id in item['sentences']:
                    sent_doc = sentences_collection.find_one({"sentence_id": sent_id})
                    if sent_doc:
                        sentence_texts.append(sent_doc["text"].strip())
            elif item.get('type') == 'sentence' and 'id' in item:
                sent_doc = sentences_collection.find_one({"sentence_id": item['id']})
                if sent_doc:
                    sentence_texts.append(sent_doc["text"].strip())

    return sentence_texts


async def safe_json(request: Request):
    """Parse JSON body safely; returns None if missing/invalid"""
    try:
        return await request.json()
    except Exception:
        return None


# ============================================
# ROUTES
# ============================================

@levels_routes.get("/api/levels")
def get_levels():
    """Get all levels summary from MongoDB"""
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$level",
                    "taskCount": {"$addToSet": "$task_id"},
                    "storyTitles": {"$addToSet": "$story_title"}
                }
            }
        ]

        result = collection.aggregate(pipeline)

        levels_summary = {}

        for doc in result:
            level = doc["_id"]
            levels_summary[level] = {
                "name": level.capitalize(),
                "taskCount": len(doc["taskCount"]),
                "stories": doc["storyTitles"]
            }

        return JSONResponse(content=levels_summary, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@levels_routes.get("/api/tasks/{category}/{level_name}")
def get_tasks_by_category(category: str, level_name: str):
    try:
        level_name_lower = level_name.lower()

        # Convert frontend category names to database category names
        category_mapping = {
            "Text Composition": "text_composition",
            "Sentence Composition": "sentence_composition",
            "Conversation": "conversations",  # DB has "conversations" not "conversation"
            "Vocabulary": "vocabulary"
        }

        category_db = category_mapping.get(category, category.lower().replace(" ", "_"))

        # ========== DEBUG START ==========
        print("\n" + "=" * 50)
        print(f"🔍 [DEBUG] API CALL: /api/tasks/{category}/{level_name}")
        print(f"🔍 [DEBUG] Frontend category: '{category}'")
        print(f"🔍 [DEBUG] Converted to category_db: '{category_db}'")
        print(f"🔍 [DEBUG] Level: '{level_name_lower}'")
        print(f"🔍 [DEBUG] Checking if '{category_db}' in ['text_composition', 'conversations']")
        print(f"🔍 [DEBUG] Result: {category_db in ['text_composition', 'conversations']}")

        if category not in category_mapping:
            print(f"⚠️ [DEBUG] Category '{category}' not in mapping. Using default conversion.")

        print("=" * 50)
        # ========== DEBUG END ==========

        # Check if category has data
        if category_db not in ["text_composition", "conversations", "vocabulary"]:
            print(f"⚠️ [BACKEND] Category '{category_db}' has no data - returning coming soon")
            return JSONResponse(content={
                "category": category,
                "level": level_name_lower,
                "tasks": [],
                "coming_soon": True,
                "has_data": False,
                "message": f"Content for {category} is coming soon!"
            }, status_code=200)

        print(f"✅ [BACKEND] Category '{category_db}' is allowed - fetching data...")

        # ========== VOCABULARY - FETCH FROM DB ==========
        if category_db == "vocabulary":
            sentences_collection, _ = get_db_collections()
            pipeline = [
                {"$match": {"level": level_name_lower, "category": "vocabulary"}},
                {"$sort": {"created_at": 1}},
                {"$group": {
                    "_id": "$task_id",
                    "story_title": {"$first": "$story_title"},
                    "words": {"$push": {
                        "sentence_id": "$sentence_id",
                        "word": "$word",
                        "phonetic": "$phonetic",
                        "wordType": "$wordType",
                        "meaning": "$meaning",
                        "domain": "$domain",
                        "forms": "$forms",
                        "examples": "$examples",
                        "synonyms": "$synonyms",
                        "antonyms": "$antonyms",
                        "native": "$native",
                        "image_url": "$image_url"
                    }}
                }},
                {"$sort": {"_id": 1}}
            ]
            result = list(sentences_collection.aggregate(pipeline))
            if not result:
                return JSONResponse(content={
                    "category": category,
                    "level": level_name_lower,
                    "tasks": [],
                    "coming_soon": False,
                    "has_data": False,
                    "message": f"No vocabulary tasks found for {level_name_lower} level"
                }, status_code=200)
            tasks = []
            for task in result:
                tasks.append({
                    "id": task["_id"],
                    "title": task["story_title"],
                    "wordCount": len(task["words"]),
                    "description": f"{len(task['words'])} vocabulary words to learn",
                    "category": "vocabulary",
                    "status": "ready",
                    "words": task["words"]
                })
            return JSONResponse(content={
                "category": category,
                "level": level_name_lower,
                "tasks": tasks,
                "coming_soon": False,
                "has_data": True,
                "message": f"Found {len(tasks)} vocabulary task groups"
            }, status_code=200)

        # ========== OTHER CATEGORIES ==========
        print(f"\n📊 [DEBUG] Executing direct MongoDB queries...")

        total_count = collection.count_documents({})
        print(f"📊 [DEBUG] Total documents in collection: {total_count}")

        query_filter = {
            "level": level_name_lower,
            "category": category_db
        }
        filtered_count = collection.count_documents(query_filter)
        print(f"📊 [DEBUG] Query filter: {query_filter}")
        print(f"📊 [DEBUG] Documents matching filter: {filtered_count}")

        if filtered_count > 0:
            sample_docs = list(collection.find(query_filter).limit(2))
            print(f"📊 [DEBUG] Sample documents found:")
            for i, doc in enumerate(sample_docs):
                print(f"  Document {i+1}:")
                print(f"    _id: {doc.get('_id')}")
                print(f"    sentence_id: {doc.get('sentence_id')}")
                print(f"    text: {doc.get('text')}")
                print(f"    category: {doc.get('category')}")
                print(f"    level: {doc.get('level')}")
                print(f"    task_id: {doc.get('task_id')}")
        else:
            print(f"❌ [DEBUG] NO DOCUMENTS FOUND with filter!")

            all_categories = collection.distinct("category")
            print(f"📋 [DEBUG] All categories in database: {all_categories}")

            categories_for_level = collection.distinct("category", {"level": level_name_lower})
            print(f"📋 [DEBUG] Categories for level '{level_name_lower}': {categories_for_level}")

            print(f"🔎 [DEBUG] Searching for similar categories...")
            all_docs = list(collection.find({"level": level_name_lower}).limit(5))
            for doc in all_docs:
                if "conversation" in doc.get("category", "").lower():
                    print(f"🔎 [DEBUG] Found related document:")
                    print(f"    category: {doc.get('category')}")
                    print(f"    text: {doc.get('text')}")

        # ========== EXECUTE PIPELINE ==========
        print(f"\n🚀 [DEBUG] Executing aggregation pipeline...")
        pipeline = [
            {
                "$match": {
                    "level": level_name_lower,
                    "category": category_db
                }
            },
            {"$sort": {"step_number": 1}},
            {
                "$group": {
                    "_id": "$task_id",
                    "story_title": {"$first": "$story_title"},
                    "sentences": {
                        "$push": {
                            "sentence_id": "$sentence_id",
                            "text": "$text",
                            "letter": "$letter",
                            "step_number": "$step_number"
                        }
                    }
                }
            }
        ]

        print(f"📋 [DEBUG] Pipeline stages:")
        for i, stage in enumerate(pipeline):
            print(f"  Stage {i+1}: {stage}")

        result = list(collection.aggregate(pipeline))
        print(f"✅ [DEBUG] Pipeline returned {len(result)} tasks")

        if result:
            print(f"📋 [DEBUG] First task in result:")
            print(f"  task_id: {result[0].get('_id')}")
            print(f"  story_title: {result[0].get('story_title')}")
            print(f"  sentences count: {len(result[0].get('sentences', []))}")

        print("=" * 50 + "\n")
        # ========== END DEBUG ==========

        if not result:
            print(f"⚠️ [BACKEND] No tasks found for category '{category_db}'")
            return JSONResponse(content={
                "category": category,
                "level": level_name_lower,
                "tasks": [],
                "coming_soon": False,
                "has_data": False,
                "message": "No tasks available for this level yet"
            }, status_code=200)

        tasks = []
        for task in result:
            tasks.append({
                "id": task["_id"],
                "title": task["story_title"],
                "sentenceCount": len(task["sentences"]),
                "sentences": task["sentences"]
            })

        print(f"📤 [BACKEND] Returning {len(tasks)} tasks for {category}")

        return JSONResponse(content={
            "category": category,
            "level": level_name_lower,
            "tasks": tasks,
            "coming_soon": False,
            "has_data": True,
            "message": f"Found {len(tasks)} tasks"
        }, status_code=200)

    except Exception as e:
        print(f"❌ [BACKEND] Error in get_tasks_by_category: {str(e)}")
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


def _unique_words(values, limit=6):
    """Normalize API word lists into unique, non-empty strings."""
    result = []
    seen = set()
    for value in values or []:
        if isinstance(value, dict):
            value = value.get("word", "")
        if not isinstance(value, str):
            continue
        value = value.strip()
        key = value.casefold()
        if value and key not in seen:
            seen.add(key)
            result.append(value)
        if len(result) >= limit:
            break
    return result


def _fetch_related_words(word: str, relation: str, limit=6):
    """Get synonyms/antonyms from Datamuse when the dictionary lacks them."""
    try:
        response = requests.get(
            "https://api.datamuse.com/words",
            params={relation: word, "max": limit},
            timeout=5,
        )
        response.raise_for_status()
        payload = response.json()
        return _unique_words([item.get("word") for item in payload if isinstance(item, dict)], limit)
    except (requests.RequestException, ValueError, TypeError) as exc:
        print(f"Related-word lookup failed ({relation}) for '{word}': {exc}")
        return []


def _translate_text(text: str, target_language: str) -> str:
    """Translate English text through MyMemory; return empty when unavailable."""
    if not isinstance(text, str) or not text.strip():
        return ""
    try:
        response = requests.get(
            "https://api.mymemory.translated.net/get",
            params={"q": text.strip()[:450], "langpair": f"en|{target_language}"},
            timeout=7,
        )
        response.raise_for_status()
        payload = response.json()
        translated = (payload.get("responseData") or {}).get("translatedText", "")
        if not isinstance(translated, str):
            return ""
        translated = translated.strip()
        # MyMemory sometimes returns the original text when it cannot translate.
        if not translated or translated.casefold() == text.strip().casefold():
            return ""
        return translated
    except (requests.RequestException, ValueError, TypeError) as exc:
        print(f"Translation lookup failed for language '{target_language}': {exc}")
        return ""


def _enrich_vocabulary_fields(doc: dict) -> dict:
    """Fill missing related words and native translations without replacing valid data."""
    word = str(doc.get("word") or "").strip()
    meaning = str(doc.get("meaning") or "").strip()
    if not word:
        return doc

    synonyms = _unique_words(doc.get("synonyms"), 6)
    antonyms = _unique_words(doc.get("antonyms"), 6)
    if len(synonyms) < 3:
        synonyms = _unique_words(synonyms + _fetch_related_words(word, "rel_syn", 6), 6)
    if len(antonyms) < 3:
        antonyms = _unique_words(antonyms + _fetch_related_words(word, "rel_ant", 6), 6)
    doc["synonyms"] = synonyms
    doc["antonyms"] = antonyms

    native = doc.get("native") if isinstance(doc.get("native"), dict) else {}
    language_codes = {"hindi": "hi", "telugu": "te", "tamil": "ta"}
    for language, code in language_codes.items():
        existing = native.get(language) if isinstance(native.get(language), dict) else {}
        translated_word = existing.get("word") or _translate_text(word, code)
        translated_meaning = existing.get("meaning") or _translate_text(meaning, code)
        native[language] = {
            **existing,
            "word": translated_word or existing.get("word", ""),
            "meaning": translated_meaning or existing.get("meaning", ""),
        }
    doc["native"] = native
    return doc



def _fetch_wikimedia_image(word: str) -> dict:
    """Find a relevant Wikimedia Commons image without requiring an API key."""
    try:
        response = requests.get(
            "https://commons.wikimedia.org/w/api.php",
            params={
                "action": "query",
                "generator": "search",
                "gsrsearch": f"{word} filetype:bitmap",
                "gsrnamespace": 6,
                "gsrlimit": 10,
                "prop": "imageinfo",
                "iiprop": "url|extmetadata",
                "iiurlwidth": 700,
                "format": "json",
            },
            headers={
                "User-Agent": "learnsphereVocabulary/1.0 (educational learning app)"
            },
            timeout=8,
        )
        response.raise_for_status()
        pages = response.json().get("query", {}).get("pages", {})

        for page in pages.values():
            image_info = (page.get("imageinfo") or [{}])[0]
            image_url = image_info.get("thumburl") or image_info.get("url")

            if not image_url:
                continue

            metadata = image_info.get("extmetadata", {})

            def metadata_value(key):
                value = metadata.get(key, {}).get("value", "")
                return re.sub(r"<[^>]*>", "", str(value)).strip()

            return {
                "image_url": image_url,
                "image_source": "Wikimedia Commons",
                "image_source_url": page.get("canonicalurl", ""),
                "image_artist": metadata_value("Artist"),
                "image_license": metadata_value("LicenseShortName"),
            }

    except (requests.RequestException, ValueError, TypeError) as e:
        print(f"Wikimedia image search failed for '{word}': {e}")
    except Exception as e:
        print(f"Unexpected image search error for '{word}': {e}")

    return {}


@levels_routes.get("/api/vocabulary/search")
def search_vocabulary(word: str = Query("", description="Word to search"),
                      domain: str = Query("", description="Optional domain")):
    """Return cached vocabulary, or fetch a real dictionary entry and cache it."""
    try:
        word = word.strip()
        domain = domain.strip()
        if not word:
            return JSONResponse(
                content={"found": False, "message": "No word provided"},
                status_code=400,
            )

        sentences_collection, _ = get_db_collections()
        query = {
            "category": "vocabulary",
            "word": {"$regex": f"^{re.escape(word)}$", "$options": "i"},
        }
        if domain:
            query["domain"] = {"$regex": f"^{re.escape(domain)}$", "$options": "i"}

        # 1. Return cached data, enriching missing synonyms/antonyms/translations.
        cached_doc = sentences_collection.find_one(query)
        if cached_doc:
            original_id = cached_doc.get("_id")
            enriched = _enrich_vocabulary_fields(dict(cached_doc))
            # updates = {
            #     "synonyms": enriched.get("synonyms", []),
            #     "antonyms": enriched.get("antonyms", []),
            #     "native": enriched.get("native", {}),
            # }

            updates = {
                "synonyms": enriched.get("synonyms", []),
                "antonyms": enriched.get("antonyms", []),
                "native": enriched.get("native", {}),
            }

            # Fetch an image only when this cached word has no image yet.
            if not cached_doc.get("image_url"):
                image_data = _fetch_wikimedia_image(cached_doc.get("word", word))
                if image_data:
                    updates.update(image_data)
            # Persist enrichment so we don't need to call these services on every search.
            sentences_collection.update_one({"_id": original_id}, {"$set": updates})
            cached_doc.update(updates)
            cached_doc["_id"] = str(original_id)
            if isinstance(cached_doc.get("created_at"), datetime):
                cached_doc["created_at"] = cached_doc["created_at"].isoformat()
            return JSONResponse(content={"found": True, "data": cached_doc, "cached": True}, status_code=200)

        # 2. Fetch a real English dictionary entry for words not in MongoDB.
        dictionary_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{requests.utils.quote(word)}"
        api_response = requests.get(dictionary_url, timeout=12)
        if api_response.status_code == 404:
            return JSONResponse(
                content={"found": False, "message": f"No dictionary entry found for '{word}'."},
                status_code=200,
            )
        api_response.raise_for_status()
        entries = api_response.json()
        if not isinstance(entries, list) or not entries:
            return JSONResponse(content={"found": False, "message": f"No dictionary entry found for '{word}'."}, status_code=200)

        entry = entries[0]
        meanings = entry.get("meanings") or []
        definitions = []
        examples = []
        synonyms = []
        antonyms = []
        word_type = "Word"
        for meaning_item in meanings:
            if word_type == "Word" and meaning_item.get("partOfSpeech"):
                word_type = meaning_item["partOfSpeech"].capitalize()
            for definition_item in meaning_item.get("definitions", []):
                definition = definition_item.get("definition", "").strip()
                if definition and definition not in definitions:
                    definitions.append(definition)
                example = definition_item.get("example")
                if example and example not in examples:
                    examples.append(example)
                synonyms.extend(definition_item.get("synonyms", []))
                antonyms.extend(definition_item.get("antonyms", []))
            synonyms.extend(meaning_item.get("synonyms", []))
            antonyms.extend(meaning_item.get("antonyms", []))

        meaning = definitions[0] if definitions else "No definition is available from the dictionary source."
        if not definitions:
            return JSONResponse(content={"found": False, "message": f"No definition available for '{word}'."}, status_code=200)

        phonetic = entry.get("phonetic") or next(
            (item.get("text") for item in entry.get("phonetics", []) if item.get("text")), ""
        )
        generation_domain = domain or "General"
        clean_word = entry.get("word", word).strip()
        slug = re.sub(r"[^a-z0-9]+", "_", clean_word.lower()).strip("_") or "word"
        timestamp = int(datetime.utcnow().timestamp())
        task_id = f"easy_search_{slug}_{timestamp}"
        sentence_id = f"{task_id}_vocab_{slug}"

        vocab_doc = {
            "sentence_id": sentence_id,
            "task_id": task_id,
            "level": "easy",
            "story_title": "Dictionary API Search",
            "category": "vocabulary",
            "word": clean_word,
            "phonetic": phonetic,
            "wordType": word_type,
            "meaning": meaning,
            "domain": generation_domain,
            "forms": [],
            "examples": examples[:3],
            "synonyms": list(dict.fromkeys(synonyms))[:6],
            "antonyms": list(dict.fromkeys(antonyms))[:6],
            "native": {},
            "source": "dictionaryapi.dev",
            "source_url": dictionary_url,
            "created_at": datetime.utcnow(),
        }

        # Fill related words and translations using supplemental APIs when available.
        # vocab_doc = _enrich_vocabulary_fields(vocab_doc)
        # Fill related words and translations using supplemental APIs when available.
        vocab_doc = _enrich_vocabulary_fields(vocab_doc)

                # Automatically fetch and cache a relevant image.
        vocab_doc.update(_fetch_wikimedia_image(clean_word))

        # Recheck before insert to reduce duplicate records from concurrent searches.
        cached_doc = sentences_collection.find_one(query)
        if cached_doc:
            cached_doc["_id"] = str(cached_doc["_id"])
            if isinstance(cached_doc.get("created_at"), datetime):
                cached_doc["created_at"] = cached_doc["created_at"].isoformat()
            return JSONResponse(content={"found": True, "data": cached_doc, "cached": True}, status_code=200)

        insert_result = sentences_collection.insert_one(vocab_doc)
        vocab_doc["_id"] = str(insert_result.inserted_id)
        vocab_doc["created_at"] = vocab_doc["created_at"].isoformat()
        return JSONResponse(
            content={"found": True, "data": vocab_doc, "cached": False, "source": "dictionaryapi.dev"},
            status_code=200,
        )

    except requests.RequestException as e:
        print(f"Dictionary API request failed for '{word}': {e}")
        return JSONResponse(
            content={"found": False, "message": "The dictionary service is temporarily unavailable. Please try again."},
            status_code=502,
        )
    except Exception as e:
        print(f"Error in search_vocabulary: {e}")
        traceback.print_exc()
        return JSONResponse(content={"found": False, "message": "Unable to search for this word."}, status_code=500)


@levels_routes.get("/api/levels/{level_name}/tasks/{task_id}")
def get_task(level_name: str, task_id: str):
    """Get a specific task from MongoDB by level and task_id"""
    try:
        level_name_lower = level_name.lower()

        sentences_collection, _ = get_db_collections()

        sentences_cursor = sentences_collection.find(
            {
                "level": level_name_lower,
                "task_id": task_id
            }
        ).sort("step_number", 1)

        sentences = []
        category = "text_composition"  # Default
        for doc in sentences_cursor:
            sentences.append({
                "sentence_id": doc["sentence_id"],
                "text": doc["text"],
                "letter": doc.get("letter", ""),
                "step_number": doc.get("step_number", 0)
            })
            if "category" in doc:
                category = doc["category"]

        if not sentences:
            return JSONResponse(content={"error": "Task not found"}, status_code=404)

        story_doc = sentences_collection.find_one(
            {"level": level_name_lower, "task_id": task_id},
            {"story_title": 1, "category": 1, "_id": 0}
        )

        task = {
            "id": task_id,
            "title": story_doc.get("story_title", f"Task {task_id}") if story_doc else f"Task {task_id}",
            "category": story_doc.get("category", "text_composition") if story_doc else "text_composition",
            "sentenceCount": len(sentences),
            "sentences": sentences
        }

        return JSONResponse(content={
            "level": level_name_lower,
            "task": task,
            "has_data": True
        }, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@levels_routes.get("/api/select-relations/{level_name}/{task_id}")
def get_task_relations(level_name: str, task_id: str):
    """Get select relations data for a specific task FROM MONGODB"""
    try:
        level_name_lower = level_name.lower()

        sentences_collection, _ = get_db_collections()

        sentences_cursor = sentences_collection.find(
            {
                "level": level_name_lower,
                "task_id": task_id,
                "category": "text_composition"
            }
        ).sort("step_number", 1)

        sentences = []
        for doc in sentences_cursor:
            sentences.append({
                "text": doc.get("text", ""),
                "sentence_id": doc.get("sentence_id", ""),
                "letter": doc.get("letter", ""),
                "step_number": doc.get("step_number", 0),
                "level": doc.get("level", ""),
                "task_id": doc.get("task_id", "")
            })

        if not sentences:
            return JSONResponse(content={"error": "No sentences found for this task"}, status_code=404)

        story_doc = sentences_collection.find_one(
            {"level": level_name_lower, "task_id": task_id},
            {"story_title": 1, "_id": 0}
        )

        task_title = story_doc.get("story_title", f"Task {task_id}") if story_doc else f"Task {task_id}"

        return JSONResponse(content={
            "level": level_name_lower,
            "taskId": task_id,
            "taskTitle": task_title,
            "sentences": sentences,
            "instructions": "Select and combine sentences using appropriate relations (because, and, then, however, etc.)"
        }, status_code=200)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


# ============================================
# EVALUATION ENDPOINT
# ============================================

@levels_routes.post("/api/evaluate-combination")
async def evaluate_combination(request: Request):
    """Evaluate the combined sentence with focus on CORRECT RELATIONS"""
    try:
        data = await safe_json(request)

        if not data:
            return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

        task_id = data.get("task_id")
        level = data.get("level")
        combined_text = (data.get("combined_text", "") or "").strip()
        selected_sentences_data = data.get("selected_sentences", [])

        print(f"📥 Received evaluation request:")
        print(f"   Task ID: {task_id}")
        print(f"   Level: {level}")
        print(f"   Selected sentences data: {selected_sentences_data}")
        print(f"   Combined text: '{combined_text}'")

        if not all([task_id, level, combined_text]):
            return JSONResponse(content={
                "status": "error",
                "message": "Missing required fields: task_id, level, combined_text"
            }, status_code=400)

        sentences_collection, paragraphs_collection = get_db_collections()

        reference_story = get_reference_story(level, task_id)

        print("📚 Reference story returned:", repr(reference_story))

        if not reference_story:
            return JSONResponse(content={
                "status": "error",
                "message": f"No reference story found for task_id: {task_id}, level: {level}"
            }, status_code=404)

        # Extract sentence IDs
        selected_sentence_ids = []
        if isinstance(selected_sentences_data, list):
            selected_sentence_ids = extract_sentence_ids_from_selected(selected_sentences_data)
        elif isinstance(selected_sentences_data, str):
            selected_sentence_ids = [selected_sentences_data]

        # Get sentence texts
        sentence_texts = []
        if selected_sentence_ids:
            sentence_texts = get_sentence_texts(selected_sentence_ids, sentences_collection)
        else:
            sentence_texts = extract_sentence_texts_from_final_structure(selected_sentences_data, sentences_collection)

        if not sentence_texts:
            return JSONResponse(content={
                "status": "error",
                "message": "Could not extract sentence texts from selected_sentences"
            }, status_code=400)

        if len(sentence_texts) < 2:
            return JSONResponse(content={
                "status": "error",
                "message": "Please select at least 2 sentences to combine"
            }, status_code=400)

        evaluation_result = story_evaluator.evaluate_combination(combined_text, sentence_texts, reference_story)

        similarity_percentage = evaluation_result.get('similarity_percentage', 0)
        overall_score = evaluation_result['overall_score']

        if similarity_percentage >= 80:
            message = "🎯 Excellent! Your combination is very close to the reference."
        elif similarity_percentage >= 60:
            message = "👍 Good job! Your combination is mostly correct."
        elif similarity_percentage >= 40:
            message = "📝 Getting there. Check the relation you used."
        else:
            message = "🔍 Review how these sentences should be connected."

        response = {
            "status": "success",
            "is_correct": evaluation_result['is_correct'],
            "overall_score": overall_score,
            "similarity_score": round(overall_score * 10, 1),
            "similarity_percentage": similarity_percentage,
            "message": message,
            "user_combined_text": combined_text,
            "selected_sentences": sentence_texts,
            "selected_sentence_ids": selected_sentence_ids,
            "user_relation": evaluation_result.get('user_relation', {}),
            "feedback": evaluation_result.get('feedback', []),
            "found_in_reference": evaluation_result.get('found_in_reference', False),
            "reference_story": reference_story
        }

        if evaluation_result.get('correct_combination'):
            response["expected_correct_text"] = evaluation_result['correct_combination']
            response["correct_relation"] = evaluation_result.get('correct_relation', {})
            response["relation_correct"] = evaluation_result.get('relation_correct', False)
        elif evaluation_result.get('suggested_relation'):
            response["suggested_relation"] = evaluation_result['suggested_relation']
            response["individual_sentences"] = evaluation_result.get('individual_sentences', [])

        return JSONResponse(content=response, status_code=200)

    except Exception as e:
        print(f"❌ CRITICAL ERROR in evaluate-combination: {str(e)}")
        traceback.print_exc()
        return JSONResponse(content={
            "status": "error",
            "message": f"Internal server error: {str(e)}"
        }, status_code=500)


# ============================================
# OTHER ROUTES
# ============================================

@levels_routes.get("/api/get-sentences-with-id/{recipe_id}")
def get_sentences_with_id(recipe_id: str):
    """Get sentences/instructions for a specific recipe FROM MONGODB"""
    try:
        sentences_collection, _ = get_db_collections()

        sentences_cursor = sentences_collection.find(
            {"task_id": recipe_id}
        ).sort("step_number", 1)

        sentences = []
        for doc in sentences_cursor:
            sentences.append({
                "text": doc["text"],
                "sentence_id": doc["sentence_id"],
                "letter": doc.get("letter", ""),
                "step_number": doc.get("step_number", 0),
                "level": doc.get("level", ""),
                "task_id": doc.get("task_id", "")
            })

        if not sentences:
            return JSONResponse(content={
                "status": "error",
                "message": f"No sentences found for recipe_id: {recipe_id}"
            }, status_code=404)

        return JSONResponse(content={
            "status": "success",
            "recipe_id": recipe_id,
            "sentences": sentences,
        }, status_code=200)

    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


# Initialize discourse relations
discourse_relations = []


@levels_routes.post("/api/add-discourse")
async def add_discourse(request: Request):
    """Add a discourse relation between two sentences"""
    try:
        data = await safe_json(request)

        if not data:
            return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

        sentence1_id = data.get("sentence1_id")
        sentence2_id = data.get("sentence2_id")
        relation = data.get("relation")

        if not all([sentence1_id, sentence2_id, relation]):
            return JSONResponse(content={
                "status": "error",
                "message": "Missing required fields: sentence1_id, sentence2_id, relation",
            }, status_code=400)

        discourse_entry = {
            "id": len(discourse_relations) + 1,
            "sentence1_id": sentence1_id,
            "sentence2_id": sentence2_id,
            "relation": relation,
            "timestamp": datetime.now().isoformat(),
        }

        discourse_relations.append(discourse_entry)

        return JSONResponse(content={
            "status": "success",
            "message": "Discourse relation added successfully",
            "data": discourse_entry,
        }, status_code=200)

    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@levels_routes.post("/api/remove-discourse")
async def remove_discourse(request: Request):
    """Remove discourse relations for given sentence IDs"""
    try:
        data = await safe_json(request)

        if not data:
            return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

        sentence_ids = data.get("sentence_ids", [])

        if not sentence_ids:
            return JSONResponse(content={"status": "error", "message": "No sentence_ids provided"}, status_code=400)

        global discourse_relations
        original_count = len(discourse_relations)

        discourse_relations = [
            rel
            for rel in discourse_relations
            if rel["sentence1_id"] not in sentence_ids
            and rel["sentence2_id"] not in sentence_ids
        ]

        removed_count = original_count - len(discourse_relations)

        return JSONResponse(content={
            "status": "success",
            "message": f"Removed {removed_count} discourse relation(s)",
            "removed_count": removed_count,
        }, status_code=200)

    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@levels_routes.get("/api/get-discourse/{recipe_id}")
def get_discourse(recipe_id: str):
    """Get all discourse relations for a recipe"""
    try:
        return JSONResponse(content={
            "status": "success",
            "recipe_id": recipe_id,
            "relations": discourse_relations,
        }, status_code=200)
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@levels_routes.post("/api/generate-running-text")
async def generate_running_text(request: Request):
    """Generate running text from ordered sentences"""
    try:
        data = await safe_json(request)

        if not data:
            return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

        recipe_id = data.get("recipe_id")
        sentence_order = data.get("sentence_order", [])
        ui_language = data.get("ui_language", "english")
        evaluate = data.get("evaluate", False)

        if not recipe_id or not sentence_order:
            return JSONResponse(content={
                "status": "error",
                "message": "Missing required fields: recipe_id, sentence_order",
            }, status_code=400)

        sentences_collection, _ = get_db_collections()

        sentences_cursor = sentences_collection.find(
            {"task_id": recipe_id}
        ).sort("step_number", 1)

        sentence_map = {}
        for doc in sentences_cursor:
            sentence_map[doc["sentence_id"]] = doc["text"]

        if not sentence_map:
            return JSONResponse(content={
                "status": "error",
                "message": f"No sentences found for recipe_id: {recipe_id}"
            }, status_code=404)

        generated_sentences = []
        sentence_ids_for_eval = []

        for item in sentence_order:
            if isinstance(item, dict):
                if 'type' in item and item['type'] == 'combined':
                    if 'text' in item and item['text']:
                        combined_text = item['text']
                        generated_sentences.append(combined_text)
                        if 'sentences' in item:
                            sentence_ids_for_eval.extend(item['sentences'])
                    elif 'sentences' in item:
                        combined_parts = []
                        for sid in item['sentences']:
                            text = sentence_map.get(sid, "")
                            if text:
                                combined_parts.append(text)
                        if combined_parts:
                            combined_text = " ".join(combined_parts)
                            generated_sentences.append(combined_text)
                            sentence_ids_for_eval.extend(item['sentences'])
                elif 'id' in item:
                    text = sentence_map.get(item['id'], "")
                    if text:
                        generated_sentences.append(text)
                        sentence_ids_for_eval.append(item['id'])
            elif isinstance(item, list):
                combined_parts = []
                for sid in item:
                    text = sentence_map.get(sid, "")
                    if text:
                        combined_parts.append(text)
                if combined_parts:
                    combined_text = " ".join(combined_parts)
                    generated_sentences.append(combined_text)
                    sentence_ids_for_eval.extend(item)
            elif isinstance(item, str):
                text = sentence_map.get(item, "")
                if text:
                    generated_sentences.append(text)
                    sentence_ids_for_eval.append(item)

        # Join with period and space
        running_text = ". ".join(generated_sentences)
        if running_text and not running_text.endswith('.'):
            running_text += '.'
        running_text = running_text.replace('..', '.')

        paragraph_wrapped = f"<p>{running_text}</p>"

        response = {
            "status": "success",
            "generated_text": running_text,
            "generator_response": {
                "paragraph": running_text,
                "paragraph_wrapped": paragraph_wrapped,
            },
            "sentence_count": len(generated_sentences),
        }

        if evaluate and running_text:
            try:
                level = recipe_id.split("_")[0] if "_" in recipe_id else ""
                reference_story = get_reference_story(level, recipe_id)

                if reference_story:
                    eval_sentence_texts = get_sentence_texts(sentence_ids_for_eval, sentences_collection)
                    evaluation_result = story_evaluator.evaluate_combination(running_text, eval_sentence_texts, reference_story)

                    response["evaluation"] = {
                        "is_correct": evaluation_result['is_correct'],
                        "overall_score": evaluation_result['overall_score'],
                        "similarity_percentage": evaluation_result.get('similarity_percentage', 0),
                        "feedback": evaluation_result.get('feedback', [])
                    }

            except Exception as eval_error:
                print(f"⚠️ Evaluation error: {eval_error}")

        return JSONResponse(content=response, status_code=200)

    except Exception as e:
        print(f"❌ ERROR in generate-running-text: {str(e)}")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@levels_routes.post("/api/submit-relations")
async def submit_relations(request: Request):
    """Submit selected relations for evaluation"""
    try:
        data = await safe_json(request)

        if not data:
            return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

        response = {
            "status": "success",
            "message": "Relations submitted successfully",
            "timestamp": datetime.now().isoformat(),
            "data": data,
        }

        return JSONResponse(content=response, status_code=200)

    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@levels_routes.get("/api/get-paragraph/{task_id}/{level}")
def get_paragraph(task_id: str, level: str):
    """Get the correct paragraph for debugging"""
    try:
        reference_story = get_reference_story(level, task_id)

        if not reference_story:
            return JSONResponse(content={
                "status": "error",
                "message": f"No paragraph found for task_id: {task_id}, level: {level}"
            }, status_code=404)

        return JSONResponse(content={
            "status": "success",
            "task_id": task_id,
            "level": level,
            "paragraph_text": reference_story,
            "paragraph_id": f"{level}_{task_id}"
        }, status_code=200)

    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@levels_routes.post("/api/test-relation-evaluator")
async def test_relation_evaluator(request: Request):
    """Test the relation evaluator with custom text"""
    try:
        data = await safe_json(request)

        if not data:
            return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

        test_text = (data.get("text", "") or "").strip()
        sentence1 = (data.get("sentence1", "") or "").strip()
        sentence2 = (data.get("sentence2", "") or "").strip()
        reference_text = (data.get("reference_text", "") or "").strip()

        if not all([test_text, sentence1, sentence2, reference_text]):
            return JSONResponse(content={
                "status": "error",
                "message": "All fields required: text, sentence1, sentence2, reference_text"
            }, status_code=400)

        evaluation_result = story_evaluator.evaluate_combination(
            test_text,
            [sentence1, sentence2],
            reference_text
        )

        return JSONResponse(content={
            "status": "success",
            "test_text": test_text,
            "evaluation": evaluation_result,
            "timestamp": datetime.now().isoformat()
        }, status_code=200)

    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@levels_routes.get("/api/relation-evaluation-info")
def relation_evaluation_info():
    """Get information about the relation-focused evaluation model"""
    return JSONResponse(content={
        "status": "success",
        "model": "Relation-Focused Story Evaluator",
        "version": "1.0",
        "supported_relations": {
            "causal": ["because", "since", "therefore", "thus", "hence", "consequently"],
            "temporal": ["then", "next", "after", "before", "while", "when", "finally"],
            "contrast": ["but", "however", "although", "though", "nevertheless", "yet"],
            "addition": ["and", "also", "furthermore", "moreover", "additionally"]
        },
        "scoring": {
            "scale": "0-10",
            "threshold": "6.0+ for 'correct'",
            "weights": {
                "similarity": "70%",
                "relation_correctness": "30%"
            }
        }
    }, status_code=200)


@levels_routes.get("/api/debug-test")
def debug_test():
    print("🎯🎯🎯 DEBUG TEST ENDPOINT HIT 🎯🎯🎯")
    print(f"Current time: {datetime.now()}")

    try:
        count = collection.count_documents({})
        print(f"📊 Total documents in collection: {count}")

        conv_count = collection.count_documents({"category": "conversations"})
        print(f"📊 Conversations documents: {conv_count}")

        categories = collection.distinct("category")
        print(f"📊 All categories in DB: {categories}")

    except Exception as e:
        print(f"❌ MongoDB error: {e}")

    return JSONResponse(content={
        "status": "debug test successful",
        "message": "Check terminal for debug output"
    })


@levels_routes.post("/api/save-generated-text")
async def save_generated_text(request: Request):
    """Save generated text to database"""
    try:
        data = await safe_json(request)

        if not data:
            return JSONResponse(content={"status": "error", "message": "No data provided"}, status_code=400)

        generated_text = data.get("generated_text")
        level = data.get("level")
        task_id = data.get("task_id")
        final_structure = data.get("final_structure", [])
        evaluation_result = data.get("evaluation_result", {})

        if not all([generated_text, level, task_id]):
            return JSONResponse(content={
                "status": "error",
                "message": "Missing required fields: generated_text, level, task_id"
            }, status_code=400)

        sentences_collection, _ = get_db_collections()

        story_doc = sentences_collection.find_one(
            {"task_id": task_id, "level": level},
            {"story_title": 1}
        )

        if story_doc and "story_title" in story_doc:
            title = story_doc["story_title"]
        else:
            title = f"Task {task_id}"

        saved_texts_collection = app_db["saved_texts"]

        saved_text = {
            "generated_text": generated_text,
            "level": level,
            "task_id": task_id,
            "title": title,
            "final_structure": final_structure,
            "evaluation_result": evaluation_result,
            "created_at": datetime.utcnow()
        }

        result = saved_texts_collection.insert_one(saved_text)
        saved_text["_id"] = str(result.inserted_id)
        saved_text["created_at"] = saved_text["created_at"].isoformat()

        return JSONResponse(content={
            "status": "success",
            "message": "Text saved successfully",
            "saved_text_id": str(result.inserted_id),
            "data": saved_text
        }, status_code=200)

    except Exception as e:
        print(f"❌ Error saving text: {str(e)}")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@levels_routes.get("/api/get-saved-texts")
def get_saved_texts():
    """Get all saved texts from database"""
    try:
        saved_texts_collection = app_db["saved_texts"]

        saved_texts = list(saved_texts_collection.find().sort("created_at", -1))

        for text in saved_texts:
            text["_id"] = str(text["_id"])
            if "created_at" in text and isinstance(text["created_at"], datetime):
                text["created_at"] = text["created_at"].isoformat()

            if "title" not in text:
                text["title"] = f"Task {text.get('task_id', 'Unknown')}"

        return JSONResponse(content={
            "status": "success",
            "count": len(saved_texts),
            "saved_texts": saved_texts
        }, status_code=200)

    except Exception as e:
        print(f"❌ Error getting saved texts: {str(e)}")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)


@levels_routes.delete("/api/delete-saved-text/{text_id}")
def delete_saved_text(text_id: str):
    """Delete a saved text by ID"""
    try:
        if not text_id:
            return JSONResponse(content={"status": "error", "message": "Text ID required"}, status_code=400)

        saved_texts_collection = app_db["saved_texts"]

        result = saved_texts_collection.delete_one({"_id": ObjectId(text_id)})

        if result.deleted_count == 0:
            return JSONResponse(content={"status": "error", "message": "Text not found"}, status_code=404)

        return JSONResponse(content={
            "status": "success",
            "message": "Text deleted successfully",
            "deleted_count": result.deleted_count
        }, status_code=200)

    except Exception as e:
        print(f"❌ Error deleting text: {str(e)}")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)