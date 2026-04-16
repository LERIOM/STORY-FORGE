from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Story(Base):
    __tablename__ = "stories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    source_story_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("stories.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="ready")
    language: Mapped[str] = mapped_column(String(10), default="fr")
    context_text: Mapped[str] = mapped_column(Text)

    image_storage_key: Mapped[str] = mapped_column(String(1024))
    source_asset_keys: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    source_retention_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    spotify_track_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    spotify_track_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    spotify_artist_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    spotify_external_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    spotify_embed_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    spotify_album_art_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user: Mapped["User"] = relationship(back_populates="stories", foreign_keys=[user_id])
    source_story: Mapped["Story | None"] = relationship(remote_side=[id])

