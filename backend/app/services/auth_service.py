from __future__ import annotations

import base64
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode, urlsplit

import httpx
from fastapi import HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.spotify_connection import SpotifyConnection
from app.models.user import User


settings = get_settings()
LOCAL_PLACEHOLDER_HOSTS = {"127.0.0.1", "localhost", "0.0.0.0"}


class SpotifyAuthService:
    def __init__(self, db: Session):
        self.db = db

    def build_authorization_url(self, request: Request, return_to: str) -> str:
        if not settings.spotify_client_id:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Spotify credentials missing")

        state = secrets.token_urlsafe(24)
        redirect_uri = self._resolve_spotify_redirect_uri(request)
        request.session["spotify_oauth_state"] = state
        request.session["spotify_return_to"] = self._normalize_return_to(return_to)
        request.session["spotify_redirect_uri"] = redirect_uri

        query = urlencode(
            {
                "response_type": "code",
                "client_id": settings.spotify_client_id,
                "scope": settings.spotify_scopes,
                "redirect_uri": redirect_uri,
                "state": state,
                "show_dialog": "true",
            }
        )
        return f"https://accounts.spotify.com/authorize?{query}"

    async def handle_callback(self, request: Request, code: str, state: str) -> str:
        expected_state = request.session.get("spotify_oauth_state")
        if not expected_state or expected_state != state:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")

        redirect_uri = request.session.get("spotify_redirect_uri") or self._resolve_spotify_redirect_uri(request)
        token_payload = await self._exchange_code_for_token(code, redirect_uri)
        profile = await self._fetch_profile(token_payload["access_token"])

        user = self._upsert_user_from_spotify(profile, token_payload)
        request.session["user_id"] = user.id

        return_to = request.session.get("spotify_return_to", "/fr/create")
        request.session.pop("spotify_oauth_state", None)
        request.session.pop("spotify_return_to", None)
        request.session.pop("spotify_redirect_uri", None)
        return f"{self._resolve_frontend_base_url(request)}{return_to}"

    async def _exchange_code_for_token(self, code: str, redirect_uri: str) -> dict:
        basic = base64.b64encode(f"{settings.spotify_client_id}:{settings.spotify_client_secret}".encode("utf-8")).decode("utf-8")
        headers = {
            "Authorization": f"Basic {basic}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post("https://accounts.spotify.com/api/token", data=data, headers=headers)
            if response.status_code >= 400:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Spotify token exchange failed")
            return response.json()

    async def _fetch_profile(self, access_token: str) -> dict:
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get("https://api.spotify.com/v1/me", headers=headers)
            if response.status_code >= 400:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Spotify profile fetch failed")
            return response.json()

    def _upsert_user_from_spotify(self, profile: dict, token_payload: dict) -> User:
        spotify_connection = self.db.scalar(
            select(SpotifyConnection).where(SpotifyConnection.spotify_user_id == profile["id"])
        )

        avatar_url = (profile.get("images") or [{}])[0].get("url")
        expires_in = token_payload.get("expires_in")
        token_expires_at = (
            datetime.now(timezone.utc) + timedelta(seconds=int(expires_in))
            if expires_in
            else None
        )

        if spotify_connection:
            user = spotify_connection.user
        else:
            user = User(
                display_name=profile.get("display_name"),
                email=profile.get("email"),
                avatar_url=avatar_url,
            )
            self.db.add(user)
            self.db.flush()
            spotify_connection = SpotifyConnection(user_id=user.id, spotify_user_id=profile["id"], access_token="")
            self.db.add(spotify_connection)

        user.display_name = profile.get("display_name") or user.display_name
        user.email = profile.get("email") or user.email
        user.avatar_url = avatar_url or user.avatar_url

        spotify_connection.access_token = token_payload["access_token"]
        spotify_connection.refresh_token = token_payload.get("refresh_token") or spotify_connection.refresh_token
        spotify_connection.scopes = token_payload.get("scope", settings.spotify_scopes)
        spotify_connection.token_expires_at = token_expires_at
        spotify_connection.profile_image_url = avatar_url
        spotify_connection.country = profile.get("country")
        spotify_connection.product = profile.get("product")
        spotify_connection.raw_profile = profile
        spotify_connection.is_active = True

        self.db.commit()
        self.db.refresh(user)
        return user

    def _normalize_return_to(self, return_to: str) -> str:
        if not return_to.startswith("/") or return_to.startswith("//"):
            return "/fr/create"
        return return_to

    def _resolve_frontend_base_url(self, request: Request) -> str:
        configured_url = settings.frontend_base_url.rstrip("/")
        parsed_url = urlsplit(configured_url)
        if not self._should_resolve_from_request(parsed_url.hostname):
            return configured_url

        scheme = self._resolve_request_scheme(request) or parsed_url.scheme or "http"
        hostname = self._resolve_request_hostname(request) or parsed_url.hostname or "127.0.0.1"
        port = self._resolve_public_port(
            request=request,
            scheme=scheme,
            hostname=hostname,
            local_fallback_port=parsed_url.port or 3000,
            use_request_port_for_local_host=False,
        )
        return self._build_absolute_url(scheme, hostname, port, parsed_url.path)

    def _resolve_spotify_redirect_uri(self, request: Request) -> str:
        configured_url = settings.spotify_redirect_uri.rstrip("/")
        parsed_url = urlsplit(configured_url)
        if not self._should_resolve_from_request(parsed_url.hostname):
            return configured_url

        scheme = self._resolve_request_scheme(request) or parsed_url.scheme or "http"
        hostname = self._resolve_request_hostname(request) or parsed_url.hostname or "127.0.0.1"
        port = self._resolve_public_port(
            request=request,
            scheme=scheme,
            hostname=hostname,
            local_fallback_port=parsed_url.port or 8000,
            use_request_port_for_local_host=True,
        )
        return self._build_absolute_url(scheme, hostname, port, parsed_url.path)

    def _resolve_request_scheme(self, request: Request) -> str:
        forwarded_proto = request.headers.get("x-forwarded-proto")
        if forwarded_proto:
            return forwarded_proto.split(",", maxsplit=1)[0].strip()
        return request.url.scheme

    def _resolve_request_hostname(self, request: Request) -> str | None:
        forwarded_host = request.headers.get("x-forwarded-host")
        if forwarded_host:
            return self._strip_port(forwarded_host.split(",", maxsplit=1)[0].strip())

        if request.url.hostname:
            return request.url.hostname

        host = request.headers.get("host")
        if host:
            return self._strip_port(host.split(",", maxsplit=1)[0].strip())

        return None

    def _resolve_request_port(self, request: Request) -> int | None:
        forwarded_host = request.headers.get("x-forwarded-host")
        if forwarded_host:
            port = self._extract_port(forwarded_host.split(",", maxsplit=1)[0].strip())
            if port is not None:
                return port

        forwarded_port = request.headers.get("x-forwarded-port")
        if forwarded_port:
            candidate = forwarded_port.split(",", maxsplit=1)[0].strip()
            if candidate.isdigit():
                return int(candidate)

        if request.url.port is not None:
            return request.url.port

        host = request.headers.get("host")
        if host:
            return self._extract_port(host.split(",", maxsplit=1)[0].strip())

        return None

    def _resolve_public_port(
        self,
        request: Request,
        scheme: str,
        hostname: str,
        local_fallback_port: int,
        use_request_port_for_local_host: bool,
    ) -> int | None:
        request_port = self._resolve_request_port(request)
        if hostname in LOCAL_PLACEHOLDER_HOSTS:
            if use_request_port_for_local_host and request_port is not None:
                return request_port
            return local_fallback_port

        if request_port is None or request_port == self._default_port_for_scheme(scheme):
            return None

        return request_port

    def _should_resolve_from_request(self, hostname: str | None) -> bool:
        return hostname in LOCAL_PLACEHOLDER_HOSTS

    def _default_port_for_scheme(self, scheme: str) -> int | None:
        if scheme == "http":
            return 80
        if scheme == "https":
            return 443
        return None

    def _build_absolute_url(self, scheme: str, hostname: str, port: int | None, path: str) -> str:
        netloc = hostname if port is None else f"{hostname}:{port}"
        return f"{scheme}://{netloc}{path}"

    def _strip_port(self, host: str) -> str:
        if host.startswith("[") and "]" in host:
            return host[1 : host.index("]")]

        if host.count(":") == 1:
            return host.split(":", maxsplit=1)[0]

        return host

    def _extract_port(self, host: str) -> int | None:
        if host.startswith("[") and "]" in host:
            remainder = host[host.index("]") + 1 :]
            if remainder.startswith(":") and remainder[1:].isdigit():
                return int(remainder[1:])
            return None

        if host.count(":") == 1:
            port = host.rsplit(":", maxsplit=1)[1]
            if port.isdigit():
                return int(port)

        return None
