from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    chapters = relationship("Chapter", back_populates="user", cascade="all, delete-orphan")
    books = relationship("Book", back_populates="user", cascade="all, delete-orphan")


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    anchor_prompt = Column(String(255), nullable=True)
    segment_index = Column(Integer, default=0, nullable=False)
    audio_url = Column(String(512), nullable=True)
    transcript_text = Column(Text, nullable=True)
    polished_text = Column(Text, nullable=True)
    polished_by_model = Column(String(100), nullable=True)  # Track which AI model was used
    status = Column(String(50), default="pending", nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    user = relationship("User", back_populates="chapters")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    pdf_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    user = relationship("User", back_populates="books")
