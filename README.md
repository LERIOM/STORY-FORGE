# Story Forge

Story Forge is a mobile-first web app that generates a single vertical story from user images and written context, then suggests a Spotify track alongside the visual result.

## Monorepo structure

- `frontend/`: Next.js app router client and UI shell
- `backend/`: FastAPI orchestrator, Spotify OAuth, story generation pipeline and jobs
- `docker-compose.yml`: local full-stack setup with PostgreSQL and Redis

## Local Docker workflow

1. Copy `.env.example` or `.env.docker.example` and set Spotify credentials.
2. Run:

```bash
docker compose up --build
```

3. Open:

- Frontend: `http://127.0.0.1:3000`
- Backend docs: `http://127.0.0.1:8000/docs`

## Notes

- The backend keeps uploaded source images only for a short configurable retention window.
- Story downloads are exported as PNG only.
- Spotify tracks are shown through metadata and embed/link on the site, not embedded inside the downloaded file.
- The backend is intentionally organized by layers: routes, services, models, schemas, tasks and adapters.
- The frontend is organized by responsibility: layout shell, landing, creation workflow, library, detail view and profile.

## Reverse proxy deployment

When the app is served behind Nginx or another reverse proxy, keep port `8000` internal and expose a single public origin such as `https://storyforge.sandbag.ch`.

- `FRONTEND_BASE_URL=https://storyforge.sandbag.ch`
- `NEXT_PUBLIC_API_BASE_URL=https://storyforge.sandbag.ch/api/v1`
- `SPOTIFY_REDIRECT_URI=https://storyforge.sandbag.ch/api/v1/auth/spotify/callback`

The reverse proxy should forward `/api/v1/` to the backend service on port `8000` and serve the frontend on the same public host. Do not publish OAuth URLs with `:8000` unless that port is intentionally exposed to users.
