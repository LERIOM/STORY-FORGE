from datetime import datetime

from pydantic import BaseModel


class SpotifyConnectionResponse(BaseModel):
    connected: bool
    spotify_user_id: str | None = None
    display_name: str | None = None
    avatar_url: str | None = None
    product: str | None = None
    updated_at: datetime | None = None


class ProfileResponse(BaseModel):
    id: str
    display_name: str | None = None
    email: str | None = None
    locale: str
    avatar_url: str | None = None
    spotify: SpotifyConnectionResponse

