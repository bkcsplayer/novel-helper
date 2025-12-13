# BioWeaver

多服务骨架：前端（React+Vite 移动端）、后台管理（React+Vite）、后端 API（FastAPI）、PostgreSQL、可选 Nginx 反代。

## 服务与端口
- backend-api: `${PORT_BACKEND:-18888}` → FastAPI
- frontend-mobile: `${PORT_FRONTEND:-18300}` → Vite React（iPhone 15 Pro Max 优化）
- admin-panel: `${PORT_ADMIN:-18400}`
- postgres: `${PORT_POSTGRES:-15432}`
- nginx (可选): `${PORT_NGINX:-18080}`

## 运行
1. 复制 `.env.example` 为 `.env`，填入实际值（DB、OpenAI、Telegram、SMTP 等）。
2. `docker-compose up --build -d`
3. 前端访问 `http://localhost:${PORT_NGINX}/`（或直接前端端口），管理后台 `/admin/`，API `/api/`。
4. 管理后台需要在 `admin-panel/.env` 设置 `VITE_API_BASE`（示例见 `admin-panel/.env.example`，默认可指向 `http://localhost:${PORT_BACKEND}`）。

## 目录
- `frontend-mobile/` 移动端（Tailwind+Shadcn 可扩展，Merriweather/Inter 字体，Vintage Paper 调色）
- `admin-panel/` 管理后台（列表展示用户、章节、音频链接）
- `backend-api/` FastAPI 核心逻辑，SQLAlchemy 模型（User/Chapter/Book），AI 占位
- `reverse-proxy/` Nginx 配置（路由 /、/admin、/api、/static）
- `storage/` 音频与生成文本/书籍的挂载卷

## 录音/章节设计
- 单段录音 ≤ 20 分钟；同一章节可多段语音（通过 `Chapter.segment_index` 顺序拼接）。
- 章节存储字段：音频 URL、原始转录、润色文本、状态。
- 书籍可汇总章节文本生成输出（待接入 AI）。

## 待集成
- Whisper STT / OpenAI LLM 调用（占位于 `services/ai_service.py`）
- 文件存储策略（本地卷/S3/MinIO）
- 认证、鉴权、后台编辑与导出功能
