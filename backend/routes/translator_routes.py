from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from utils.translator import translate_text

translator_routes = APIRouter()


@translator_routes.post("/api/translate")
async def translate(request: Request):
    """
    Request body:
    {
      "text": "Hello world",
      "target_language": "hin",
      "source_language": "eng"
    }
    """

    try:
        data = await request.json()
    except Exception:
        data = None

    if not data:
        return JSONResponse(
            content={"error": "Request body is required"},
            status_code=400
        )

    text = data.get("text")
    target_language = data.get("target_language")
    source_language = data.get("source_language", "eng")

    if not text:
        return JSONResponse(
            content={"error": "'text' is required"},
            status_code=400
        )

    if not target_language:
        return JSONResponse(
            content={"error": "'target_language' is required"},
            status_code=400
        )

    result = translate_text(
        text=text,
        source_language=source_language,
        target_language=target_language
    )

    if "error" in result:
        return JSONResponse(content=result, status_code=400)

    return {
        "input": {
            "text": text,
            "source_language": source_language,
            "target_language": target_language
        },
        "output": result
    }