"""
BioWeaver AI Service - Memory Polishing

Uses the "Slumdog Millionaire" montage narrative style:
- Anchor Object: A tangible item that triggers the memory
- Flashback Montage: Vivid, sensory-rich scenes from the past
- Philosophical Echo: A reflective, universal truth to close
"""

import os
import logging
from typing import Optional, Tuple

import httpx
from httpx import HTTPError

logger = logging.getLogger(__name__)

# Enhanced "Slumdog Millionaire" narrative system prompt
SLUMDOG_SYSTEM_PROMPT = """You are a master biographical writer, specializing in the "Slumdog Millionaire" montage narrative style.

Your task is to transform raw spoken memories into beautifully crafted, emotionally resonant biographical passages.

## Narrative Structure

1. **ANCHOR OBJECT** (Opening)
   - Begin with the tangible object that triggers the memory
   - Describe it with sensory detail: texture, weight, smell, temperature
   - Make it feel alive, like a doorway into the past

2. **MEMORY MONTAGE** (Middle)
   - Flash back through vivid, cinematic scenes
   - Use present tense for immediacy ("I see... I hear... I feel...")
   - Include sensory details: smells of antiseptic, murmurs in corridors, the weight of a stethoscope
   - Show, don't tell - let actions and details reveal emotions
   - Weave in dialogue fragments naturally

3. **PHILOSOPHICAL ECHO** (Closing)
   - End with a reflective, universal insight
   - Connect the personal to the universal human experience
   - Use poetic, memorable language that resonates

## Style Guidelines

- Write in first person, as if the narrator is speaking
- Keep the original facts and emotions intact
- Add literary beauty without inventing new facts
- Balance intimacy with universality
- Use varied sentence rhythms: short punchy sentences mixed with flowing descriptions
- Prefer concrete details over abstract statements
- The language should feel like wisdom earned through living

## Output

Return ONLY the polished narrative passage. No meta-commentary, no headers, just the story."""

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
# Use Claude 3 Opus for superior creative writing, fallback to Claude 3.5 Sonnet
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "anthropic/claude-3-opus-20240229")


def get_current_model() -> str:
    """Return the currently configured model name."""
    return OPENROUTER_MODEL


async def rewrite_memory(anchor_prompt: str, transcript: str, model: Optional[str] = None) -> Tuple[str, str]:
    """
    Call OpenRouter to polish the transcript in Slumdog montage style.
    Falls back to the original transcript on failure.
    
    Returns:
        Tuple of (polished_text, model_used)
    """
    chosen_model = model or OPENROUTER_MODEL

    if not OPENROUTER_API_KEY:
        logger.warning("No OPENROUTER_API_KEY configured, returning raw transcript")
        return transcript, ""

    if not transcript or not transcript.strip():
        logger.warning("Empty transcript, nothing to polish")
        return transcript, ""

    # Build a more detailed user prompt
    user_prompt = f"""## Anchor Object
{anchor_prompt or "A meaningful object from the past"}

## Raw Spoken Memory (Transcript)
{transcript}

---

Please transform this raw spoken memory into a beautifully crafted biographical passage using the Slumdog Millionaire montage style. Preserve all the facts and emotions, but add literary beauty and structure."""

    payload = {
        "model": chosen_model,
        "messages": [
            {"role": "system", "content": SLUMDOG_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.8,  # Slightly higher for creative writing
        "max_tokens": 2000,
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": os.getenv("PUBLIC_BASE_URL", "http://localhost"),
        "X-Title": "BioWeaver",
    }

    last_error = None
    for attempt in range(2):  # simple retry
        try:
            logger.info(f"Polishing with model {chosen_model}, attempt {attempt+1}")
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(f"{OPENROUTER_BASE_URL}/chat/completions", json=payload, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    result = data["choices"][0]["message"]["content"]
                    logger.info(f"Polish successful with {chosen_model}: {len(result)} chars")
                    return result, chosen_model
                else:
                    last_error = f"HTTP {resp.status_code}: {resp.text[:200]}"
                    logger.warning(f"Polish attempt {attempt+1} failed: {last_error}")
        except HTTPError as e:
            last_error = str(e)
            logger.warning(f"Polish HTTP error attempt {attempt+1}: {e}")
            continue
        except Exception as e:
            last_error = str(e)
            logger.error(f"Polish exception attempt {attempt+1}: {e}")
            break

    logger.error(f"Polish failed after retries: {last_error}")
    return transcript, ""
