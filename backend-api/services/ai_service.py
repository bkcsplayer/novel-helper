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
SLUMDOG_SYSTEM_PROMPT = """你是一位传记写作大师，专精于「贫民窟的百万富翁」蒙太奇叙事风格。

你的任务是将原始口述记忆转化为优美动人、情感丰沛的传记篇章。

## 🎯 核心要求：字数延展

**目标字数：每个章节 500-800 字**

- 如果原始内容少于 300 字：必须**大幅延展**，添加细节、场景、对话、感官描写，直到达到 500-800 字
- 如果原始内容在 300-600 字：适当润色和延展，增加文学性和细节
- 如果原始内容超过 600 字：精心润色和整理结构，保持或略微扩展

**绝不能**只是简单地重复原文或添加标点！必须创造性地丰富内容。

## 📖 叙事结构

1. **锚定物开篇** (约 80-120 字)
   - 以触发记忆的具象物品开始
   - 描述它的质感、重量、气味、温度
   - 让它如同一扇通往过去的门

2. **记忆蒙太奇** (约 300-500 字)
   - 用电影般的场景闪回
   - 使用现在时增强临场感（"我看见...我听到...我感受到..."）
   - 加入感官细节：消毒水的气味、走廊的低语、听诊器的重量
   - 展示而非讲述——用动作和细节揭示情感
   - 自然地穿插对话片段
   - **添加合理的想象细节**来丰富场景

3. **哲理回响** (约 80-120 字)
   - 以反思性的普世洞见收尾
   - 将个人经历与人类共同体验相连
   - 使用诗意、令人难忘的语言

## ✍️ 风格指南

- 使用第一人称，仿佛讲述者在亲口诉说
- 保留原始的事实和情感核心
- 大胆添加文学性的描写和合理想象
- 在亲密与普世之间保持平衡
- 句式节奏变化：短促有力的句子与流畅的长句交织
- 偏好具象细节而非抽象陈述
- 语言应有岁月沉淀的智慧感

## 📝 输出要求

- 只返回润色后的叙事篇章
- 不要加任何标题、编号、元评论
- 确保输出达到 500-800 字
- 使用中文写作"""

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

    # Calculate original word count
    original_chars = len(transcript)
    
    # Build a more detailed user prompt (in Chinese)
    user_prompt = f"""## 锚定物
{anchor_prompt or "一个有意义的老物件"}

## 原始口述内容（{original_chars} 字）
{transcript}

---

## 任务要求

请将以上口述内容转化为一篇优美的传记篇章。

**字数要求**：
- 原文只有 {original_chars} 字
- 请延展到 **500-800 字**
- 必须大幅丰富场景、细节、对话、感官描写

**重要**：
1. 不要只是简单润色原文，要创造性地延展
2. 添加符合情境的想象细节（如天气、环境、人物表情、对话等）
3. 使用蒙太奇叙事手法，让读者身临其境
4. 保持第一人称叙述

请直接输出润色后的完整篇章（500-800字），不要加任何标题或解释。"""

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
