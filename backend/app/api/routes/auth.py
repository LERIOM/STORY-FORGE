from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import ProfileResponse
from app.services.auth_service import SpotifyAuthService
from app.services.dependencies import CurrentAccount, get_current_account


router = APIRouter()


@router.get("/spotify/login")
async def spotify_login(
    request: Request,
    db: Session = Depends(get_db),
    return_to: str = Query("/fr/create"),
) -> RedirectResponse:
    auth_service = SpotifyAuthService(db)
    return RedirectResponse(auth_service.build_authorization_url(request, return_to))


@router.get("/spotify/callback")
async def spotify_callback(
    request: Request,
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    auth_service = SpotifyAuthService(db)
    redirect_target = await auth_service.handle_callback(request, code=code, state=state)
    return RedirectResponse(redirect_target, status_code=status.HTTP_302_FOUND)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(request: Request) -> None:
    request.session.clear()


@router.get("/session", response_model=ProfileResponse)
async def get_session(account: CurrentAccount = Depends(get_current_account)) -> ProfileResponse:
    if not account.spotify_connection:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Spotify connection required")
    return account.to_profile()
