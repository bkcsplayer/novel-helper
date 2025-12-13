import os
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, File, UploadFile, status, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import SessionLocal, engine
from models import Base, Chapter, User, Book
from services.ai_service import rewrite_memory
from email_service import send_email
from telegram_service import send_telegram
from whisper_service import transcribe_file
from seed_service import seed_demo
from health_service import collect_health

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BioWeaver API", version="0.1.0")

origins_raw = os.getenv("BACKEND_CORS_ORIGINS", "*")
origins = [o.strip() for o in origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _build_public_url(kind: str, filename: str) -> str:
    public_base = os.getenv("STORAGE_PUBLIC_BASE_URL", "").rstrip("/")
    return f"{public_base}/{kind}/{filename}" if public_base else filename


def _resolve_storage_path(kind: str, filename_or_url: str) -> str:
    base_dir = os.getenv(
        "STORAGE_AUDIO_PATH" if kind == "audio" else "STORAGE_BOOK_PATH",
        "/data/storage/audio" if kind == "audio" else "/data/storage/books",
    )
    name = os.path.basename(filename_or_url)
    return os.path.join(base_dir, name)


def _safe_delete(path: str) -> None:
    try:
        if os.path.isfile(path):
            os.remove(path)
    except Exception:
        pass


def require_admin(request: Request) -> None:
    """
    If ADMIN_TOKEN is set, require X-Admin-Token header to match.
    """
    expected = (os.getenv("ADMIN_TOKEN") or "").strip()
    if not expected:
        return
    provided = (request.headers.get("X-Admin-Token") or "").strip()
    if provided != expected:
        raise HTTPException(status_code=401, detail="unauthorized")


class ChapterOut(BaseModel):
    id: int
    user_id: int
    title: str
    anchor_prompt: Optional[str] = None
    segment_index: int
    audio_url: Optional[str] = None
    transcript_text: Optional[str] = None
    polished_text: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BookOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


@app.get("/health", status_code=status.HTTP_200_OK)
async def health():
    return {"status": "ok"}


@app.get("/get_chapters", response_model=List[ChapterOut])
async def get_chapters(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Chapter)
    if user_id is not None:
        query = query.filter(Chapter.user_id == user_id)
    chapters = query.order_by(Chapter.segment_index).all()
    return chapters


@app.get("/chapters", response_model=List[ChapterOut])
async def list_chapters(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    return await get_chapters(user_id=user_id, db=db)


@app.post("/upload_audio", response_model=ChapterOut)
async def upload_audio(
    user_id: int,
    title: str,
    anchor_prompt: str | None = None,
    segment_index: int = 0,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    storage_root = os.getenv("STORAGE_AUDIO_PATH", "/data/storage/audio")
    os.makedirs(storage_root, exist_ok=True)

    ext = os.path.splitext(file.filename)[1] or ".wav"
    safe_name = f"{uuid4().hex}{ext}"
    stored_fs_path = os.path.join(storage_root, safe_name)

    with open(stored_fs_path, "wb") as out_file:
        out_file.write(await file.read())

    audio_url = _build_public_url("audio", safe_name)

    chapter = Chapter(
        user_id=user_id,
        title=title,
        anchor_prompt=anchor_prompt,
        segment_index=segment_index,
        audio_url=audio_url,
        transcript_text=None,
        polished_text=None,
        status="pending",
    )
    db.add(chapter)
    db.commit()
    db.refresh(chapter)

    transcript_text = None
    polished_text = None
    try:
        transcript_text = await transcribe_file(stored_fs_path)
        polished_text = await rewrite_memory(anchor_prompt or "", transcript_text, None)
        chapter.transcript_text = transcript_text
        chapter.polished_text = polished_text
        chapter.status = "polished"
        db.add(chapter)
        db.commit()
        db.refresh(chapter)
    except Exception:
        # Keep as pending if transcribe/polish fails
        pass

    send_telegram(
        f"New upload: user {user_id}, title '{title}', anchor '{anchor_prompt}', file {safe_name}, "
        f"transcribed={'yes' if transcript_text else 'no'}"
    )

    return chapter


class GenerateBookRequest(BaseModel):
    user_id: int
    title: str
    chapter_ids: List[int]


class GenerateBookResponse(BaseModel):
    message: str
    book_title: str
    chapters: List[int]
    book_url: Optional[str] = None


class CreateUserRequest(BaseModel):
    name: str
    email: str


class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    anchor_prompt: Optional[str] = None
    status: Optional[str] = None
    transcript_text: Optional[str] = None
    polished_text: Optional[str] = None
    audio_url: Optional[str] = None
    segment_index: Optional[int] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


class BookUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    pdf_url: Optional[str] = None


@app.post("/generate_book", response_model=GenerateBookResponse)
async def generate_book(payload: GenerateBookRequest, db: Session = Depends(get_db)):
    chapters = (
        db.query(Chapter)
        .filter(Chapter.id.in_(payload.chapter_ids), Chapter.user_id == payload.user_id)
        .order_by(Chapter.segment_index)
        .all()
    )
    if not chapters:
        raise HTTPException(status_code=404, detail="no chapters found for user")

    storage_root = os.getenv("STORAGE_BOOK_PATH", "/data/storage/books")
    os.makedirs(storage_root, exist_ok=True)

    content_parts = []
    for ch in chapters:
        text = ch.polished_text or ch.transcript_text or ""
        content_parts.append(f"# {ch.title}\n\n{text}\n")
    book_body = "\n\n".join(content_parts)

    file_name = f"{uuid4().hex}.txt"
    file_path = os.path.join(storage_root, file_name)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(book_body)

    book_url = _build_public_url("books", file_name)

    book = Book(user_id=payload.user_id, title=payload.title, description=None, pdf_url=book_url)
    db.add(book)
    db.commit()
    db.refresh(book)

    send_email(
        subject=f"BioWeaver book generated: {payload.title}",
        body=f"User {payload.user_id} generated book with chapters {payload.chapter_ids}\nURL: {book_url}",
        to_address="cool@khtain.com",
    )
    send_telegram(f"Book generated: user {payload.user_id}, title '{payload.title}', url {book_url}")

    return {
        "message": "book generated",
        "book_title": payload.title,
        "chapters": payload.chapter_ids,
        "book_url": book_url,
    }


@app.get("/admin/stats")
async def admin_stats(db: Session = Depends(get_db)):
    users = db.query(User).count()
    chapters = db.query(Chapter).count()
    books = db.query(Book).count()
    return {"users": users, "chapters": chapters, "books": books}


@app.post("/admin/seed_demo")
async def admin_seed_demo(request: Request, db: Session = Depends(get_db)):
    require_admin(request)
    result = seed_demo(db)
    send_telegram(f"Demo seeded: user {result['user']['email']}, chapters +{result['created_chapters']}, books +{result['created_books']}")
    return result


@app.get("/admin/health")
async def admin_health(request: Request, db: Session = Depends(get_db)):
    require_admin(request)
    return collect_health(db)


class TranscribeRequest(BaseModel):
    transcript_text: str
    anchor_prompt: Optional[str] = None
    model: Optional[str] = None


@app.post("/chapters/{chapter_id}/transcribe", response_model=ChapterOut)
async def transcribe_and_polish(
    chapter_id: int,
    payload: TranscribeRequest,
    db: Session = Depends(get_db),
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="chapter not found")

    chapter.transcript_text = payload.transcript_text
    anchor = payload.anchor_prompt or chapter.anchor_prompt or ""
    polished = await rewrite_memory(anchor, payload.transcript_text, payload.model)
    chapter.polished_text = polished
    chapter.status = "polished"

    db.add(chapter)
    db.commit()
    db.refresh(chapter)

    send_telegram(f"Chapter polished: id {chapter_id}, title '{chapter.title}'")
    return chapter


@app.get("/chapters/{chapter_id}", response_model=ChapterOut)
async def get_chapter(chapter_id: int, db: Session = Depends(get_db)):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="chapter not found")
    return chapter


@app.get("/books", response_model=List[BookOut])
async def list_books(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Book)
    if user_id is not None:
        query = query.filter(Book.user_id == user_id)
    return query.order_by(Book.created_at.desc()).all()


@app.get("/books/{book_id}", response_model=BookOut)
async def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="book not found")
    return book


@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="book not found")
    if book.pdf_url:
        _safe_delete(_resolve_storage_path("books", book.pdf_url))
    db.delete(book)
    db.commit()
    return None


@app.patch("/books/{book_id}", response_model=BookOut)
async def update_book(book_id: int, payload: BookUpdate, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="book not found")
    if payload.title is not None:
        book.title = payload.title
    if payload.description is not None:
        book.description = payload.description
    if payload.pdf_url is not None:
        book.pdf_url = payload.pdf_url
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@app.get("/users", response_model=List[UserOut])
async def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users


@app.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return user


@app.post("/users")
async def create_user(payload: CreateUserRequest, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="email already exists")
    user = User(name=payload.name, email=payload.email)
    db.add(user)
    db.commit()
    db.refresh(user)
    send_telegram(f"New user created: {user.email}")
    return user


@app.patch("/users/{user_id}", response_model=UserOut)
async def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    if payload.email is not None and payload.email != user.email:
        exists = db.query(User).filter(User.email == payload.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="email already exists")
        user.email = payload.email
    if payload.name is not None:
        user.name = payload.name
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    db.delete(user)
    db.commit()
    return None


@app.post("/chapters/{chapter_id}/polish", response_model=ChapterOut)
async def polish_existing_transcript(
    chapter_id: int,
    model: Optional[str] = None,
    db: Session = Depends(get_db),
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="chapter not found")
    if not chapter.transcript_text:
        raise HTTPException(status_code=400, detail="no transcript to polish")

    anchor = chapter.anchor_prompt or ""
    polished = await rewrite_memory(anchor, chapter.transcript_text, model)
    chapter.polished_text = polished
    chapter.status = "polished"

    db.add(chapter)
    db.commit()
    db.refresh(chapter)

    send_telegram(f"Chapter polished (existing): id {chapter_id}, title '{chapter.title}'")
    return chapter


@app.patch("/chapters/{chapter_id}", response_model=ChapterOut)
async def update_chapter(
    chapter_id: int,
    payload: ChapterUpdate,
    db: Session = Depends(get_db),
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="chapter not found")

    if payload.title is not None:
        chapter.title = payload.title
    if payload.anchor_prompt is not None:
        chapter.anchor_prompt = payload.anchor_prompt
    if payload.status is not None:
        chapter.status = payload.status
    if payload.transcript_text is not None:
        chapter.transcript_text = payload.transcript_text
    if payload.polished_text is not None:
        chapter.polished_text = payload.polished_text
    if payload.audio_url is not None:
        chapter.audio_url = payload.audio_url
    if payload.segment_index is not None:
        chapter.segment_index = payload.segment_index

    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter


@app.delete("/chapters/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter(chapter_id: int, db: Session = Depends(get_db)):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="chapter not found")
    if chapter.audio_url:
        _safe_delete(_resolve_storage_path("audio", chapter.audio_url))
    db.delete(chapter)
    db.commit()
    return None
