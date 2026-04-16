from starlette.requests import Request

from app.services.auth_service import SpotifyAuthService, settings


def make_request(
    *,
    host: str,
    forwarded_host: str | None = None,
    forwarded_proto: str | None = None,
    forwarded_port: str | None = None,
) -> Request:
    headers: list[tuple[bytes, bytes]] = [(b"host", host.encode("utf-8"))]
    if forwarded_host:
        headers.append((b"x-forwarded-host", forwarded_host.encode("utf-8")))
    if forwarded_proto:
        headers.append((b"x-forwarded-proto", forwarded_proto.encode("utf-8")))
    if forwarded_port:
        headers.append((b"x-forwarded-port", forwarded_port.encode("utf-8")))

    scope = {
        "type": "http",
        "method": "GET",
        "scheme": "http",
        "path": "/api/v1/auth/spotify/login",
        "query_string": b"",
        "headers": headers,
        "client": ("127.0.0.1", 12345),
        "server": ("127.0.0.1", 8000),
    }
    return Request(scope)


def test_resolve_local_placeholder_urls_keep_dev_ports(monkeypatch):
    monkeypatch.setattr(settings, "frontend_base_url", "http://0.0.0.0:3000")
    monkeypatch.setattr(settings, "spotify_redirect_uri", "http://0.0.0.0:8000/api/v1/auth/spotify/callback")

    service = SpotifyAuthService(db=None)
    request = make_request(host="127.0.0.1:8000")

    assert service._resolve_frontend_base_url(request) == "http://127.0.0.1:3000"
    assert service._resolve_spotify_redirect_uri(request) == "http://127.0.0.1:8000/api/v1/auth/spotify/callback"


def test_resolve_public_urls_drop_internal_ports_for_placeholder_config(monkeypatch):
    monkeypatch.setattr(settings, "frontend_base_url", "http://0.0.0.0:3000")
    monkeypatch.setattr(settings, "spotify_redirect_uri", "http://0.0.0.0:8000/api/v1/auth/spotify/callback")

    service = SpotifyAuthService(db=None)
    request = make_request(
        host="storyforge.sandbag.ch",
        forwarded_host="storyforge.sandbag.ch",
        forwarded_proto="https",
    )

    assert service._resolve_frontend_base_url(request) == "https://storyforge.sandbag.ch"
    assert service._resolve_spotify_redirect_uri(request) == "https://storyforge.sandbag.ch/api/v1/auth/spotify/callback"


def test_resolve_public_urls_keep_non_default_forwarded_port(monkeypatch):
    monkeypatch.setattr(settings, "frontend_base_url", "http://0.0.0.0:3000")
    monkeypatch.setattr(settings, "spotify_redirect_uri", "http://0.0.0.0:8000/api/v1/auth/spotify/callback")

    service = SpotifyAuthService(db=None)
    request = make_request(
        host="storyforge.sandbag.ch",
        forwarded_host="storyforge.sandbag.ch:8443",
        forwarded_proto="https",
    )

    assert service._resolve_frontend_base_url(request) == "https://storyforge.sandbag.ch:8443"
    assert service._resolve_spotify_redirect_uri(request) == "https://storyforge.sandbag.ch:8443/api/v1/auth/spotify/callback"
