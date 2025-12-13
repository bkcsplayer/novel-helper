import os
import mimetypes
import httpx
from httpx import HTTPError


async def transcribe_file(file_path: str) -> str:
    """
    Call Whisper transcription via OpenRouter audio endpoint.
    Falls back to empty string on failure to keep pipeline non-blocking.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
    model = os.getenv("WHISPER_MODEL", "openai/whisper-1")

    if not api_key or not os.path.exists(file_path):
        return ""

    mime, _ = mimetypes.guess_type(file_path)
    mime = mime or "audio/wav"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": os.getenv("PUBLIC_BASE_URL", "http://localhost"),
        "X-Title": "BioWeaver",
    }

    data = {"model": model, "response_format": "text"}

    for _ in range(2):  # simple retry
        try:
            async with httpx.AsyncClient(timeout=60) as client:
                with open(file_path, "rb") as f:
                    files = {"file": (os.path.basename(file_path), f, mime)}
                    resp = await client.post(f"{base_url}/audio/transcriptions", headers=headers, data=data, files=files)
                    resp.raise_for_status()
                    return resp.text.strip()
        except HTTPError:
            continue
        except Exception:
            break
    return ""

