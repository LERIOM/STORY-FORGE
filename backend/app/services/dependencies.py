from dataclasses import dataclass

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.spotify_connection import SpotifyConnection
from app.models.user import User
from app.schemas.auth import ProfileResponse, SpotifyConnectionResponse


@dataclass
class CurrentAccount:
    user: User
    spotify_connection: SpotifyConnection | None

    def to_profile(self) -> ProfileResponse:
        spotify = self.spotify_connection
        return ProfileResponse(
            id=self.user.id,
            display_name=self.user.display_name,
            email=self.user.email,
            locale=self.user.locale,
            avatar_url=self.user.avatar_url,
            spotify=SpotifyConnectionResponse(
                connected=bool(spotify and spotify.is_active),
                spotify_user_id=spotify.spotify_user_id if spotify else None,
                display_name=self.user.display_name,
                avatar_url=spotify.profile_image_url if spotify else self.user.avatar_url,
                product=spotify.product if spotify else None,
                updated_at=spotify.updated_at if spotify else None,
            ),
        )


def get_current_account(request: Request, db: Session = Depends(get_db)) -> CurrentAccount:
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        request.session.clear()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

    spotify_connection = db.scalar(select(SpotifyConnection).where(SpotifyConnection.user_id == user.id))
    return CurrentAccount(user=user, spotify_connection=spotify_connection)

