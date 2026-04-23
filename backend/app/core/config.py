from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Story Forge API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    expose_api_docs: bool = True

    database_url: str = "sqlite:///./storyforge.db"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"
    celery_task_always_eager: bool = True

    storage_backend: str = "local"
    storage_local_root: str = str(Path("data/storage").resolve())
    source_retention_hours: int = 24

    session_secret: str = "change-me"
    secure_cookies: bool = False
    frontend_base_url: str = "http://0.0.0.0:3000"
    allowed_hosts: list[str] = Field(default_factory=lambda: ["127.0.0.1", "localhost", "0.0.0.0"])
    cors_allowed_origins: list[str] = Field(
        default_factory=lambda: ["http://127.0.0.1:3000", "http://localhost:3000", "http://0.0.0.0:3000"]
    )
    cors_allowed_origin_regex: str | None = (
        r"^https?://"
        r"(localhost|127\.0\.0\.1|0\.0\.0\.0|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|"
        r"172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})"
        r"(?::\d+)?$"
    )

    spotify_client_id: str = ""
    spotify_client_secret: str = ""
    spotify_redirect_uri: str = "http://0.0.0.0:8000/api/v1/auth/spotify/callback"
    spotify_scopes: str = "user-read-email user-top-read"

    min_upload_images: int = 1
    max_upload_images: int = 5
    max_context_length: int = 400

    image_generator_mode: str = "mock"
    music_selector_mode: str = "mock"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("cors_allowed_origin_regex", mode="before")
    @classmethod
    def normalize_empty_origin_regex(cls, value: str | None) -> str | None:
        if value in (None, ""):
            return None
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
