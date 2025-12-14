import os
import mimetypes
import httpx
from httpx import HTTPError
import logging

logger = logging.getLogger(__name__)


async def transcribe_file(file_path: str) -> str:
    """
    Call Whisper transcription via OpenAI API.
    OpenRouter does NOT support audio endpoints, so we use OpenAI directly.
    Falls back to empty string on failure to keep pipeline non-blocking.
    """
    # Try OpenAI API first (for Whisper)
    openai_api_key = os.getenv("OPENAI_API_KEY")
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    
    # Use OpenAI for Whisper if available, otherwise try OpenRouter (likely won't work)
    if openai_api_key:
        api_key = openai_api_key
        base_url = "https://api.openai.com/v1"
    else:
        api_key = openrouter_api_key
        base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
        logger.warning("No OPENAI_API_KEY set. OpenRouter does not support Whisper audio API. Transcription may fail.")

    model = os.getenv("WHISPER_MODEL", "whisper-1")

    if not api_key:
        logger.error("No API key configured for transcription")
        return ""
    
    if not os.path.exists(file_path):
        logger.error(f"Audio file not found: {file_path}")
        return ""

    mime, _ = mimetypes.guess_type(file_path)
    mime = mime or "audio/wav"
    
    logger.info(f"Transcribing {file_path} with {model} via {base_url}")

    headers = {
        "Authorization": f"Bearer {api_key}",
    }

    data = {"model": model, "response_format": "text"}
    last_error = None

    for attempt in range(2):  # simple retry
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                with open(file_path, "rb") as f:
                    files = {"file": (os.path.basename(file_path), f, mime)}
                    resp = await client.post(f"{base_url}/audio/transcriptions", headers=headers, data=data, files=files)
                    if resp.status_code == 200:
                        result = resp.text.strip()
                        logger.info(f"Transcription successful: {len(result)} chars")
                        return result
                    else:
                        last_error = f"HTTP {resp.status_code}: {resp.text[:200]}"
                        logger.warning(f"Transcription attempt {attempt+1} failed: {last_error}")
        except HTTPError as e:
            last_error = str(e)
            logger.warning(f"Transcription HTTP error attempt {attempt+1}: {e}")
            continue
        except Exception as e:
            last_error = str(e)
            logger.error(f"Transcription exception attempt {attempt+1}: {e}")
            break
    
    logger.error(f"Transcription failed after retries: {last_error}")
    return ""

