"""
Slumdog Style system prompt (for reference):
"Capture the memory montage. Start with the anchor object. Flashback to the past. End with a philosophical echo."
"""

import os
from typing import Optional

import httpx
from httpx import HTTPError

SLUMDOG_SYSTEM_PROMPT = (
    "Capture the memory montage. Start with the anchor object. "
    "Flashback to the past. End with a philosophical echo."
)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/anthropic/claude-3.5-sonnet")


async def rewrite_memory(anchor_prompt: str, transcript: str, model: Optional[str] = None) -> str:
    """
    Call OpenRouter to polish the transcript in Slumdog montage style.
    Falls back to the original transcript on failure.
    """
    chosen_model = model or OPENROUTER_MODEL

    if not OPENROUTER_API_KEY:
        return transcript

    payload = {
        "model": chosen_model,
        "messages": [
            {"role": "system", "content": SLUMDOG_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Anchor: {anchor_prompt}\nTranscript:\n{transcript}\nReturn a polished montage-style passage.",
            },
        ],
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": os.getenv("PUBLIC_BASE_URL", "http://localhost"),
        "X-Title": "BioWeaver",
    }

    for _ in range(2):  # simple retry
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(f"{OPENROUTER_BASE_URL}/chat/completions", json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        except HTTPError:
            continue
        except Exception:
            break
    return transcript
