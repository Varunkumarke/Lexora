from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from utils.definition import get_software_definition
from utils.pos_tagger import analyze_term

term_routes = APIRouter()


@term_routes.post("/api/term/analyzeword")
async def analyze_term_api(request: Request):
    """
    {
      "term": "3d video coding"
    }
    """

    data = await request.json()

    if not data or "term" not in data:
        return JSONResponse(
            content={"error": "'term' is required"},
            status_code=400
        )

    term = data["term"].strip()

    if not term:
        return JSONResponse(
            content={"error": "Term cannot be empty"},
            status_code=400
        )

    definition = get_software_definition(term)
    pos_info = analyze_term(term)

    return {
        "term": term,
        "definition": definition,
        "linguistic": pos_info
    }