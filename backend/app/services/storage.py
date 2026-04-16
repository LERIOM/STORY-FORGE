from __future__ import annotations

from pathlib import Path

from fastapi import UploadFile

from app.core.config import get_settings


settings = get_settings()


class LocalStorageService:
    def __init__(self, root: str | None = None):
        self.root = Path(root or settings.storage_local_root)
        self.root.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, upload: UploadFile, folder: str, filename: str) -> str:
        target_dir = self.root / folder
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / filename
        content = await upload.read()
        target_path.write_bytes(content)
        return target_path.relative_to(self.root).as_posix()

    def save_bytes(self, folder: str, filename: str, content: bytes) -> str:
        target_dir = self.root / folder
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / filename
        target_path.write_bytes(content)
        return target_path.relative_to(self.root).as_posix()

    def absolute_path(self, storage_key: str) -> Path:
        return self.root / storage_key

    def exists(self, storage_key: str) -> bool:
        return self.absolute_path(storage_key).exists()

    def delete(self, storage_key: str) -> None:
        path = self.absolute_path(storage_key)
        if path.exists():
            path.unlink()


def get_storage_service() -> LocalStorageService:
    return LocalStorageService()

