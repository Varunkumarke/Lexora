from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from utils.definition import get_software_definition

definition_routes = APIRouter()


@definition_routes.post("/api/definition")
async def get_definition(request: Request):
    """
    Accepts:
    {
      "word": "recursion"
    }
    OR
    {
      "words": ["recursion", "compiler"]
    }
    """

    data = await request.json()

    if not data:
        return JSONResponse(
            content={"error": "Request body is required"},
            status_code=400
        )

    # Single word
    if "word" in data:
        word = data["word"]
        definition = get_software_definition(word)

        return {
            "word": word,
            "definition": definition
        }

    # Multiple words
    if "words" in data:
        words = data["words"]

        if not isinstance(words, list) or not words:
            return JSONResponse(
                content={"error": "'words' must be a non-empty list"},
                status_code=400
            )

        results = {}
        for word in words:
            results[word] = get_software_definition(word)

        return {"results": results}

    return JSONResponse(
        content={"error": "Provide either 'word' or 'words'"},
        status_code=400
    )