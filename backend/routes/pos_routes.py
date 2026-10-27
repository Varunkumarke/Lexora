from flask import Blueprint, request, jsonify
from utils.pos_tagger import analyze_term

term_routes = Blueprint("term_routes", __name__)


@term_routes.route("/api/term/analyze", methods=["POST"])
def analyze():
    """
    Request:
    {
      "text": "ran"
    }
    OR
    {
      "text": "web applications"
    }
    """

    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "'text' is required"}), 400

    text = data["text"].strip()

    if not text:
        return jsonify({"error": "Text cannot be empty"}), 400

    result = analyze_term(text)
    return jsonify(result), 200
