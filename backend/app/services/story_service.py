from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import SessionLocal
from app.models.generation_job import GenerationJob
from app.models.spotify_connection import SpotifyConnection
from app.models.story import Story
from app.schemas.jobs import JobStatusResponse
from app.schemas.stories import SpotifyTrackResponse, StoryDetailResponse, StorySummaryResponse
from app.services.adapters.image_generator import MockImageGeneratorAdapter
from app.services.adapters.music_selector import MockMusicSelectorAdapter
from app.services.storage import get_storage_service


settings = get_settings()


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _ensure_spotify_connection(spotify_connection: SpotifyConnection | None) -> None:
    if not spotify_connection or not spotify_connection.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Spotify connection required")


def _enqueue_generation_job(job_id: str) -> None:
    from app.tasks.generation import process_generation_job

    process_generation_job.delay(job_id)


async def create_story_generation(
    user_id: str,
    spotify_connection: SpotifyConnection | None,
    context_text: str,
    language: str,
    images: list[UploadFile],
) -> JobStatusResponse:
    _ensure_spotify_connection(spotify_connection)
    normalized_context = context_text.strip()
    if len(images) < settings.min_upload_images or len(images) > settings.max_upload_images:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid image count")
    if not normalized_context:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Context is required")
    if len(normalized_context) > settings.max_context_length:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Context too long")

    storage = get_storage_service()
    source_keys: list[str] = []
    job_id = str(uuid4())

    for index, upload in enumerate(images):
        extension = Path(upload.filename or f"upload-{index}.jpg").suffix or ".jpg"
        source_key = await storage.save_upload(upload, folder=f"uploads/{job_id}", filename=f"source-{index}{extension}")
        source_keys.append(source_key)

    with SessionLocal() as db:
        job = GenerationJob(
            id=job_id,
            user_id=user_id,
            job_type="create",
            status="queued",
            language=language,
            context_text=normalized_context,
            source_asset_keys=source_keys,
        )
        db.add(job)
        db.commit()
        db.refresh(job)

    _enqueue_generation_job(job_id)
    return serialize_job(job)


def list_stories_for_user(user_id: str) -> list[StorySummaryResponse]:
    with SessionLocal() as db:
        stories = list(
            db.scalars(select(Story).where(Story.user_id == user_id).order_by(desc(Story.created_at)))
        )
        return [serialize_story_summary(story) for story in stories]


def get_story_for_user(story_id: str, user_id: str) -> StoryDetailResponse:
    with SessionLocal() as db:
        story = _load_story_or_404(db, story_id, user_id)
        return serialize_story_detail(story)


def delete_story_for_user(story_id: str, user_id: str) -> None:
    storage = get_storage_service()
    with SessionLocal() as db:
        story = _load_story_or_404(db, story_id, user_id)
        storage.delete(story.image_storage_key)
        db.delete(story)
        db.commit()


def regenerate_story_image(story_id: str, user_id: str, spotify_connection: SpotifyConnection | None) -> JobStatusResponse:
    _ensure_spotify_connection(spotify_connection)
    with SessionLocal() as db:
        story = _load_story_or_404(db, story_id, user_id)
        if not story.source_asset_keys:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Source images unavailable")

        job = GenerationJob(
            user_id=user_id,
            source_story_id=story.id,
            job_type="regenerate_image",
            status="queued",
            language=story.language,
            context_text=story.context_text,
            source_asset_keys=story.source_asset_keys,
        )
        db.add(job)
        db.commit()
        db.refresh(job)

    _enqueue_generation_job(job.id)
    return serialize_job(job)


def regenerate_story_music(story_id: str, user_id: str, spotify_connection: SpotifyConnection | None) -> JobStatusResponse:
    _ensure_spotify_connection(spotify_connection)
    with SessionLocal() as db:
        story = _load_story_or_404(db, story_id, user_id)
        job = GenerationJob(
            user_id=user_id,
            source_story_id=story.id,
            job_type="regenerate_music",
            status="queued",
            language=story.language,
            context_text=story.context_text,
            source_asset_keys=story.source_asset_keys,
        )
        db.add(job)
        db.commit()
        db.refresh(job)

    _enqueue_generation_job(job.id)
    return serialize_job(job)


def get_job_for_user(job_id: str, user_id: str) -> JobStatusResponse:
    with SessionLocal() as db:
        job = db.scalar(select(GenerationJob).where(GenerationJob.id == job_id, GenerationJob.user_id == user_id))
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        return serialize_job(job)


def get_story_asset_for_user(story_id: str, user_id: str) -> tuple[Story, str]:
    storage = get_storage_service()
    with SessionLocal() as db:
        story = _load_story_or_404(db, story_id, user_id)
        path = storage.absolute_path(story.image_storage_key)
        if not path.exists():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story image missing")
        return story, str(path)


def run_generation_job(job_id: str) -> None:
    storage = get_storage_service()
    image_generator = MockImageGeneratorAdapter()
    music_selector = MockMusicSelectorAdapter()

    with SessionLocal() as db:
        job = db.scalar(select(GenerationJob).where(GenerationJob.id == job_id))
        if not job:
            return

        job.status = "running"
        job.started_at = _utcnow()
        db.commit()

        try:
            spotify_connection = db.scalar(select(SpotifyConnection).where(SpotifyConnection.user_id == job.user_id))
            source_story = (
                db.scalar(select(Story).where(Story.id == job.source_story_id))
                if job.source_story_id
                else None
            )

            source_keys = job.source_asset_keys or (source_story.source_asset_keys if source_story else None) or []
            source_paths = [storage.absolute_path(key) for key in source_keys if storage.exists(key)]

            if job.job_type == "regenerate_image" and not source_paths:
                raise RuntimeError("Source images have expired and image regeneration is no longer available.")

            if job.job_type == "regenerate_music" and source_story:
                image_storage_key = source_story.image_storage_key
                retention_until = source_story.source_retention_until
            else:
                image_bytes = image_generator.generate(source_paths=source_paths, context_text=job.context_text)
                image_storage_key = storage.save_bytes("generated", f"{uuid4()}.png", image_bytes)
                retention_until = _utcnow() + timedelta(hours=settings.source_retention_hours)

            track = music_selector.select_track(job.context_text, spotify_connection)

            story = Story(
                user_id=job.user_id,
                source_story_id=job.source_story_id,
                status="ready",
                language=job.language,
                context_text=job.context_text,
                image_storage_key=image_storage_key,
                source_asset_keys=source_keys or None,
                source_retention_until=retention_until,
                spotify_track_id=track.track_id,
                spotify_track_name=track.name,
                spotify_artist_name=track.artist,
                spotify_external_url=track.external_url,
                spotify_embed_url=track.embed_url,
                spotify_album_art_url=track.album_art_url,
            )
            db.add(story)
            db.flush()

            job.story_id = story.id
            job.status = "succeeded"
            job.finished_at = _utcnow()
            job.error_message = None
            db.commit()
        except Exception as exc:  # noqa: BLE001
            job.status = "failed"
            job.finished_at = _utcnow()
            job.error_message = str(exc)
            db.commit()
            raise


def serialize_story_summary(story: Story) -> StorySummaryResponse:
    return StorySummaryResponse(
        id=story.id,
        status=story.status,
        language=story.language,
        context_text=story.context_text,
        created_at=story.created_at,
        image_url=f"/api/v1/stories/{story.id}/image",
        download_url=f"/api/v1/stories/{story.id}/download",
        source_story_id=story.source_story_id,
        track=SpotifyTrackResponse(
            id=story.spotify_track_id,
            name=story.spotify_track_name,
            artist=story.spotify_artist_name,
            external_url=story.spotify_external_url,
            embed_url=story.spotify_embed_url,
            album_art_url=story.spotify_album_art_url,
        )
        if story.spotify_track_name
        else None,
    )


def serialize_story_detail(story: Story) -> StoryDetailResponse:
    summary = serialize_story_summary(story)
    return StoryDetailResponse(
        **summary.model_dump(),
        updated_at=story.updated_at,
        source_retention_until=story.source_retention_until,
    )


def serialize_job(job: GenerationJob) -> JobStatusResponse:
    return JobStatusResponse(
        id=job.id,
        story_id=job.story_id,
        job_type=job.job_type,
        status=job.status,
        error_message=job.error_message,
        created_at=job.created_at,
        started_at=job.started_at,
        finished_at=job.finished_at,
    )


def _load_story_or_404(db: Session, story_id: str, user_id: str) -> Story:
    story = db.scalar(select(Story).where(Story.id == story_id, Story.user_id == user_id))
    if not story:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    return story
