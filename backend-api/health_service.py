import os
import time
from typing import Any, Dict

import httpx
from sqlalchemy import text
from sqlalchemy.orm import Session


def _bool_env(name: str, default: bool = False) -> bool:
    val = (os.getenv(name, "") or "").strip().lower()
    if not val:
        return default
    return val in ("1", "true", "yes", "y", "on")


def collect_health(db: Session) -> Dict[str, Any]:
    """
    Lightweight service status checks for admin dashboard.
    By default, avoids sending messages/emails; can be made deeper via env flags.
    """
    result: Dict[str, Any] = {"ok": True}

    # DB
    db_start = time.time()
    db_ok = True
    db_error = None
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_ok = False
        db_error = str(e)
        result["ok"] = False
    result["db"] = {
        "ok": db_ok,
        "latency_ms": int((time.time() - db_start) * 1000),
        "error": db_error,
    }

    # Storage
    audio_path = os.getenv("STORAGE_AUDIO_PATH", "/data/storage/audio")
    book_path = os.getenv("STORAGE_BOOK_PATH", "/data/storage/books")
    storage_ok = True
    storage_error = None
    try:
        os.makedirs(audio_path, exist_ok=True)
        os.makedirs(book_path, exist_ok=True)
        # write check
        probe = os.path.join(book_path, ".healthcheck")
        with open(probe, "w", encoding="utf-8") as f:
            f.write("ok")
        os.remove(probe)
    except Exception as e:
        storage_ok = False
        storage_error = str(e)
        result["ok"] = False
    result["storage"] = {
        "ok": storage_ok,
        "audio_path": audio_path,
        "book_path": book_path,
        "error": storage_error,
    }

    # SMTP
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587") or "587")
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_ok = bool(smtp_host and smtp_user and os.getenv("SMTP_PASS", ""))
    result["smtp"] = {
        "configured": smtp_ok,
        "host": smtp_host,
        "port": smtp_port,
    }

    # Telegram
    tg_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    tg_chat_id = os.getenv("TELEGRAM_CHAT_ID", "")
    tg_configured = bool(tg_token and tg_chat_id)
    result["telegram"] = {"configured": tg_configured}

    # OpenRouter
    or_key = os.getenv("OPENROUTER_API_KEY", "")
    or_base = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
    or_model = os.getenv("OPENROUTER_MODEL", "")
    result["openrouter"] = {
        "configured": bool(or_key),
        "base_url": or_base,
        "model": or_model,
    }

    # Optional deep checks (no side effects)
    if _bool_env("HEALTHCHECK_DEEP", False):
        # Telegram: getMe
        try:
            if tg_token:
                r = httpx.get(f"https://api.telegram.org/bot{tg_token}/getMe", timeout=8)
                result["telegram"]["ok"] = r.status_code == 200 and r.json().get("ok") is True
            else:
                result["telegram"]["ok"] = False
        except Exception as e:
            result["telegram"]["ok"] = False
            result["telegram"]["error"] = str(e)
            result["ok"] = False

        # OpenRouter: list models (auth)
        try:
            if or_key:
                r = httpx.get(f"{or_base}/models", headers={"Authorization": f"Bearer {or_key}"}, timeout=10)
                result["openrouter"]["ok"] = r.status_code == 200
            else:
                result["openrouter"]["ok"] = False
        except Exception as e:
            result["openrouter"]["ok"] = False
            result["openrouter"]["error"] = str(e)
            result["ok"] = False

    return result



