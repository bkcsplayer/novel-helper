import os
import struct
from typing import Dict, List

from sqlalchemy.orm import Session

from models import Book, Chapter, User


def _ensure_silence_wav(audio_dir: str, filename: str = "demo-silence.wav") -> str:
    """
    Create a tiny 1-second silent WAV file if it doesn't exist.
    Returns absolute file path.
    """
    os.makedirs(audio_dir, exist_ok=True)
    path = os.path.join(audio_dir, filename)
    if os.path.exists(path):
        return path

    sample_rate = 8000
    duration_seconds = 1
    num_channels = 1
    bits_per_sample = 16
    num_samples = sample_rate * duration_seconds
    byte_rate = sample_rate * num_channels * (bits_per_sample // 8)
    block_align = num_channels * (bits_per_sample // 8)
    data_size = num_samples * block_align

    # RIFF header
    riff_chunk_size = 36 + data_size
    header = b"RIFF" + struct.pack("<I", riff_chunk_size) + b"WAVE"

    # fmt subchunk
    fmt_chunk = (
        b"fmt "
        + struct.pack("<I", 16)  # subchunk1 size
        + struct.pack("<H", 1)  # PCM
        + struct.pack("<H", num_channels)
        + struct.pack("<I", sample_rate)
        + struct.pack("<I", byte_rate)
        + struct.pack("<H", block_align)
        + struct.pack("<H", bits_per_sample)
    )

    # data subchunk (silence)
    data_chunk_header = b"data" + struct.pack("<I", data_size)
    silence = b"\x00" * data_size

    with open(path, "wb") as f:
        f.write(header)
        f.write(fmt_chunk)
        f.write(data_chunk_header)
        f.write(silence)
    return path


def seed_demo(db: Session) -> Dict:
    """
    Create demo user + chapters + book. Idempotent by demo email.
    """
    demo_email = "demo@bioweaver.local"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(name="Dr. Demo", email=demo_email)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Ensure demo audio exists and can be served via /static/audio/...
    audio_dir = os.getenv("STORAGE_AUDIO_PATH", "/data/storage/audio")
    _ensure_silence_wav(audio_dir)
    audio_url = os.getenv("STORAGE_PUBLIC_BASE_URL", "").rstrip("/") + "/audio/demo-silence.wav"
    if audio_url.startswith("/audio/") or audio_url == "/audio/demo-silence.wav":
        audio_url = "/static/audio/demo-silence.wav"

    anchors = [
        "The Stethoscope",
        "Old Clinic Sign",
        "Night Shift Pager",
        "First White Coat",
        "The Waiting Room Clock",
        "A Handwritten Prescription",
        "The Ambulance Siren",
        "A Cup of Cold Tea",
        "The Ward Window",
        "A Family Photo",
        "The Operating Lamp",
        "A Patient’s Letter",
        "The Hospital Elevator",
        "Rain on the Roof",
        "A Broken Pen",
        "The Library Card",
        "The Village Road",
        "A Wedding Invitation",
        "A Retirement Badge",
        "The Final Rounds",
    ]

    # If already seeded, avoid duplicating chapters/books
    existing_chapters = db.query(Chapter).filter(Chapter.user_id == user.id).count()
    created_chapters = 0
    if existing_chapters < 20:
        # keep segment_index continuous; leave existing ones intact
        start_index = existing_chapters
        for i in range(start_index, 20):
            anchor = anchors[i]
            title = f"Chapter {i+1}: {anchor}"
            # Simulate multi-segment storytelling in the title occasionally
            if i in (0, 6, 12):
                title += " (Segment 1 of 2)"
            status = "polished" if i < 6 else ("pending" if i < 10 else "polished")
            transcript = (
                f"I remember {anchor.lower()}—how it sat there, ordinary, until it became a doorway.\n"
                f"The scene returns in fragments: smells of antiseptic, murmurs in corridors, a pulse under my fingertips."
            )
            polished = (
                f"Anchor: {anchor}.\n"
                f"It begins in my palm—cool metal, warm purpose.\n"
                f"Then the montage: a village clinic at dawn, a crowded ward at midnight, a quiet promise whispered over a heartbeat.\n"
                f"And at the end, the echo: healing is time, lent to us, and never truly owned."
            )
            ch = Chapter(
                user_id=user.id,
                title=title,
                anchor_prompt=anchor,
                segment_index=i,
                audio_url=audio_url,
                transcript_text=transcript,
                polished_text=polished if status == "polished" else None,
                polished_by_model="demo/seed-data" if status == "polished" else None,
                status=status,
            )
            db.add(ch)
            created_chapters += 1
        db.commit()

    # Seed a demo "book" file
    existing_books = db.query(Book).filter(Book.user_id == user.id).count()
    created_books = 0
    if existing_books < 1:
        books_dir = os.getenv("STORAGE_BOOK_PATH", "/data/storage/books")
        os.makedirs(books_dir, exist_ok=True)
        demo_book_name = "demo-book.txt"
        demo_book_path = os.path.join(books_dir, demo_book_name)
        chapters = (
            db.query(Chapter)
            .filter(Chapter.user_id == user.id)
            .order_by(Chapter.segment_index)
            .all()
        )
        with open(demo_book_path, "w", encoding="utf-8") as f:
            f.write("# BioWeaver Demo Book\n\n")
            for ch in chapters:
                f.write(f"## {ch.title}\n\n")
                f.write((ch.polished_text or ch.transcript_text or "") + "\n\n")

        base = os.getenv("STORAGE_PUBLIC_BASE_URL", "").rstrip("/")
        book_url = f"{base}/books/{demo_book_name}" if base else f"/static/books/{demo_book_name}"
        book = Book(user_id=user.id, title="Demo Memory Book", description="Seeded demo output", pdf_url=book_url)
        db.add(book)
        db.commit()
        created_books = 1

    return {
        "user": {"id": user.id, "email": user.email, "name": user.name},
        "created_chapters": created_chapters,
        "created_books": created_books,
        "audio_url": "/static/audio/demo-silence.wav",
        "book_url": "/static/books/demo-book.txt",
    }


def clear_demo(db: Session) -> Dict:
    """
    Remove all demo data (demo user + related chapters + books).
    """
    demo_email = "demo@bioweaver.local"
    user = db.query(User).filter(User.email == demo_email).first()
    
    deleted_chapters = 0
    deleted_books = 0
    
    if user:
        # Delete chapters
        deleted_chapters = db.query(Chapter).filter(Chapter.user_id == user.id).delete()
        # Delete books
        deleted_books = db.query(Book).filter(Book.user_id == user.id).delete()
        # Delete user
        db.delete(user)
        db.commit()
    
    # Optionally clean up demo files
    audio_dir = os.getenv("STORAGE_AUDIO_PATH", "/data/storage/audio")
    demo_wav = os.path.join(audio_dir, "demo-silence.wav")
    if os.path.exists(demo_wav):
        try:
            os.remove(demo_wav)
        except:
            pass
    
    books_dir = os.getenv("STORAGE_BOOK_PATH", "/data/storage/books")
    demo_book = os.path.join(books_dir, "demo-book.txt")
    if os.path.exists(demo_book):
        try:
            os.remove(demo_book)
        except:
            pass
    
    return {
        "deleted_user": demo_email if user else None,
        "deleted_chapters": deleted_chapters,
        "deleted_books": deleted_books,
    }


