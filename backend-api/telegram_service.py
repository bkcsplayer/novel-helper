import os

import httpx


def send_telegram(message: str) -> None:
    """Send a Telegram message using bot token/chat id from env."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return

    api_url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message}

    try:
        httpx.post(api_url, json=payload, timeout=10)
    except Exception:
        return

