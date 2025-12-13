<div align="center">

# 🎭 BioWeaver

### *Weave Your Life Story into Art*

**Transform spoken memories into beautifully crafted biographical narratives**

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<br/>

[**🚀 Quick Start**](#-quick-start) · [**✨ Features**](#-features) · [**🏗️ Architecture**](#️-architecture) · [**📖 API Docs**](#-api-documentation)

<br/>

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     🎙️  "Tell me about your first patient, Doctor..."           ║
║                                                                  ║
║         📖 ──────────────────────────────── 📖                   ║
║                                                                  ║
║     🩺  The stethoscope was cold against my palm...              ║
║         I remember the smell of antiseptic,                      ║
║         the nervous flutter in my chest,                         ║
║         and Mrs. Chen's gentle smile...                          ║
║                                                                  ║
║         📖 ──────────────────────────────── 📖                   ║
║                                                                  ║
║     ✨  Voice → AI → Beautiful Narrative                         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

*Designed for elderly storytellers who want to preserve their legacy*

</div>

---

## 💫 The Vision

> *"Every life is a novel waiting to be written."*

**BioWeaver** is an AI-powered web application designed to help elderly individuals—especially doctors, teachers, and professionals with rich life experiences—transform their spoken memories into elegantly crafted biographical books.

Inspired by the narrative style of *Slumdog Millionaire*, BioWeaver captures the essence of personal stories through **anchor objects** (a stethoscope, a worn letter, a faded photograph) and weaves them into vivid, emotionally resonant chapters.

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🎙️ Voice-First Recording
- One-tap recording on mobile
- Support for iPhone audio formats
- Up to 20 minutes per segment
- Multiple segments per chapter

### 🤖 AI-Powered Transformation
- Whisper STT for accurate transcription
- Claude-powered narrative polishing
- "Slumdog Millionaire" montage style
- Preserves facts, adds literary flair

</td>
<td width="50%" valign="top">

### 📚 Memory Lane Timeline
- 20 curated "anchor prompts"
- Visual chapter progression
- Locked → Recording → Polished states
- Beautiful vintage paper aesthetic

### 📖 Book Generation
- Compile all chapters into one book
- Downloadable text format
- Email delivery to loved ones
- Telegram notifications

</td>
</tr>
</table>

---

## 🎨 Design Philosophy

<div align="center">

### *"Memory Lane" Theme*

| Element | Choice | Reason |
|---------|--------|--------|
| **Typography** | Merriweather + Inter | Elegant readability meets modern UI |
| **Palette** | Warm Parchment & Sepia | Nostalgic, timeless, comforting |
| **Layout** | Card-based Timeline | Intuitive chapter navigation |
| **Motion** | Gentle Framer Motion | Smooth, non-distracting transitions |

</div>

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   🎨 Color Palette                                          │
│                                                             │
│   ██████  Warm Parchment    #F5F5F0                        │
│   ██████  Deep Charcoal     #2C2C2C                        │
│   ██████  Golden Accent     #D4A373                        │
│   ██████  Antique Sepia     #8B7355                        │
│   ██████  Sage Green        #87A878                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

```
                            ┌─────────────────────────────────────────┐
                            │            🌐 NGINX (Port 18080)        │
                            │         Reverse Proxy & Load Balancer   │
                            └──────────────┬──────────────────────────┘
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
              ▼                            ▼                            ▼
   ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
   │   📱 Frontend        │    │   🖥️ Admin Panel    │    │   ⚡ Backend API     │
   │   Mobile-First       │    │   React-Admin       │    │   FastAPI           │
   │                       │    │                     │    │                     │
   │   • React + Vite     │    │   • MUI Theme       │    │   • SQLAlchemy ORM  │
   │   • Tailwind CSS     │    │   • CRUD Interface  │    │   • Whisper STT     │
   │   • Framer Motion    │    │   • System Status   │    │   • OpenRouter LLM  │
   │   • iPhone Optimized │    │   • Audio Playback  │    │   • File Storage    │
   └─────────────────────┘    └─────────────────────┘    └──────────┬──────────┘
                                                                     │
                    ┌────────────────────────────────────────────────┤
                    │                                                │
                    ▼                                                ▼
         ┌─────────────────────┐                        ┌─────────────────────┐
         │   🐘 PostgreSQL     │                        │   📁 File Storage   │
         │   Database          │                        │                     │
         │                     │                        │   • /audio/*.m4a    │
         │   • Users           │                        │   • /books/*.txt    │
         │   • Chapters        │                        │                     │
         │   • Books           │                        │                     │
         └─────────────────────┘                        └─────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- 4GB+ RAM recommended
- Ports: `18080` (or configure in `.env`)

### 1️⃣ Clone & Configure

```bash
git clone https://github.com/bkcsplayer/novel-helper.git
cd novel-helper

# Copy and edit environment variables
cp .env.example .env
nano .env
```

### 2️⃣ Configure Environment

```env
# Database
POSTGRES_DB=bioweaver
POSTGRES_USER=bioweaver
POSTGRES_PASSWORD=your_secure_password

# AI Services
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Notifications
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
SMTP_HOST=smtp.example.com
SMTP_USER=your_email
SMTP_PASSWORD=your_password
```

### 3️⃣ Launch

```bash
docker-compose up -d --build
```

### 4️⃣ Access

| Service | URL |
|---------|-----|
| 📱 Mobile App | http://localhost:18080/ |
| 🖥️ Admin Panel | http://localhost:18080/admin/ |
| 📡 API Docs | http://localhost:18080/api/docs |

---

## 📖 API Documentation

### Core Endpoints

```http
POST /api/users
# Create a new user

POST /api/upload_audio
# Upload voice recording → Auto transcribe → AI polish

POST /api/chapters/{id}/polish
# Re-polish a chapter with AI

POST /api/generate_book
# Compile all chapters into a book

GET /api/admin/health
# System health check (DB, SMTP, Telegram, AI)
```

### Example: Upload Audio

```bash
curl -X POST http://localhost:18080/api/upload_audio \
  -F "user_id=1" \
  -F "title=The Stethoscope" \
  -F "anchor_prompt=My grandfather's stethoscope" \
  -F "segment_index=1" \
  -F "file=@recording.m4a"
```

### Response

```json
{
  "id": 1,
  "title": "The Stethoscope",
  "status": "polished",
  "transcript_text": "I remember the first time I held...",
  "polished_text": "The cold metal of the stethoscope pressed against my palm like a key to another world..."
}
```

---

## 📱 Screenshots

<div align="center">

| 📱 Mobile Timeline | 🎙️ Recording Screen | 🖥️ Admin Dashboard |
|:---------------:|:----------------:|:---------------:|
| 20 Memory Cards | One-Tap Recording | Full CRUD Control |
| Vintage paper theme | Real-time waveform | React-Admin + MUI |
| Smooth animations | Audio preview | System health monitor |

**Live Demo:** https://novel.khtain.com/

</div>

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion |
| **Admin** | React-Admin, Material UI, Custom Theme |
| **Backend** | FastAPI, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL 16 Alpine |
| **AI/ML** | OpenRouter (Claude), OpenAI Whisper |
| **Infra** | Docker, Nginx, Docker Compose |
| **Notifications** | Telegram Bot API, SMTP Email |

</div>

---

## 📂 Project Structure

```
novel-helper/
├── 📱 frontend-mobile/          # Mobile-first React app
│   ├── src/
│   │   ├── App.tsx              # Main timeline & upload UI
│   │   ├── index.css            # Tailwind base styles
│   │   └── main.tsx             # React entry point
│   ├── tailwind.config.ts       # "Memory Lane" theme
│   └── Dockerfile
│
├── 🖥️ admin-panel/              # React-Admin dashboard
│   ├── src/
│   │   ├── AdminApp.tsx         # Admin root component
│   │   ├── dataProvider.ts      # REST API integration
│   │   ├── pages/
│   │   │   └── SystemStatus.tsx # Health dashboard
│   │   ├── resources/
│   │   │   ├── Users.tsx
│   │   │   ├── Chapters.tsx
│   │   │   └── Books.tsx
│   │   └── theme.ts             # MUI custom theme
│   └── Dockerfile
│
├── ⚡ backend-api/               # FastAPI server
│   ├── main.py                  # API endpoints
│   ├── models.py                # SQLAlchemy models
│   ├── db.py                    # Database connection
│   ├── services/
│   │   └── ai_service.py        # OpenRouter integration
│   ├── whisper_service.py       # Audio transcription
│   ├── email_service.py         # SMTP notifications
│   ├── telegram_service.py      # Telegram bot
│   ├── health_service.py        # System health checks
│   ├── seed_service.py          # Demo data generator
│   └── Dockerfile
│
├── 🔀 reverse-proxy/            # Nginx configuration
│   └── nginx.conf
│
├── 🐳 docker-compose.yml        # Service orchestration
├── 📋 .env.example              # Environment template
└── 📖 README.md                 # You are here!
```

---

## 🎯 Roadmap

- [x] Core recording & transcription
- [x] AI narrative polishing
- [x] Admin CRUD interface
- [x] Docker microservices
- [ ] PDF book generation
- [ ] Multi-language support
- [ ] Family sharing & collaboration
- [ ] Voice-to-voice narration
- [ ] Photo integration per chapter

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 💝 Made with Love for Storytellers

*"The stories of our elders are the treasures of humanity."*

<br/>

**[⬆ Back to Top](#-bioweaver)**

</div>
