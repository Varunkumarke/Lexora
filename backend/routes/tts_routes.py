from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response
from utils.tts_utils import generate_term_audio

tts_routes = APIRouter()


@tts_routes.post("/api/tts")
async def text_to_speech(request: Request):
    """
    Request body:
    {
      "text": "recursion"
    }

    Response:
    MP3 audio stream
    """

    try:
        data = await request.json()
    except Exception:
        data = None

    if not data or "text" not in data:
        return JSONResponse(
            content={"error": "'text' is required"},
            status_code=400
        )

    text = data["text"].strip()

    if not text:
        return JSONResponse(
            content={"error": "Text cannot be empty"},
            status_code=400
        )

    try:
        audio_bytes = generate_term_audio(text)

        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=tts.mp3"
            }
        )

    except Exception as e:
        return JSONResponse(
            content={"error": f"TTS generation failed: {str(e)}"},
            status_code=500
        )