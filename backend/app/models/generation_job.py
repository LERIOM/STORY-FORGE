from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class GenerationJob(Base):
    __tablename__ = "generation_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    story_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("stories.id"), nullable=True)
    source_story_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("stories.id"), nullable=True)
    job_type: Mapped[str] = mapped_column(String(64), default="create")
    status: Mapped[str] = mapped_column(String(32), default="queued")
    language: Mapped[str] = mapped_column(String(10), default="fr")
    context_text: Mapped[str] = mapped_column(Text)
    source_asset_keys: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="jobs")

