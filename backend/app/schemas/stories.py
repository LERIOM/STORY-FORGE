from datetime import datetime

from pydantic import BaseModel


class SpotifyTrackResponse(BaseModel):
    id: str | None = None
    name: str | None = None
    artist: str | None = None
    external_url: str | None = None
    embed_url: str | None = None
    album_art_url: str | None = None


class StorySummaryResponse(BaseModel):
    id: str
    status: str
    language: str
    context_text: str
    created_at: datetime
    image_url: str
    download_url: str
    source_story_id: str | None = None
    track: SpotifyTrackResponse | None = None


class StoryDetailResponse(StorySummaryResponse):
    updated_at: datetime
    source_retention_until: datetime | None = None

