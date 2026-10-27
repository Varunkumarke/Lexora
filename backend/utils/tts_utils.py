from gtts import gTTS
from io import BytesIO

def generate_term_audio(term: str) -> bytes:
    """
    Generate an MP3 audio file for a given domain term using Google TTS.
    Returns the audio as bytes (in-memory), not saved to disk.
    """
    tts = gTTS(text=term, lang="en")
    # tts = gTTS(text=term, lang="hi")
    audio_bytes = BytesIO()
    tts.write_to_fp(audio_bytes)
    audio_bytes.seek(0)
    return audio_bytes.read()
