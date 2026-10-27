<p align="center">
  <img src="frontend/public/storyforge-logo.png" alt="Story Forge" width="120"/>
</p>

# Story Forge

> A mobile-first web app that turns your photos and a few words into a vertical story, paired with a Spotify track that fits the mood.

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-37814A?logo=celery&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![Spotify](https://img.shields.io/badge/Spotify%20API-1DB954?logo=spotify&logoColor=white)

Team project (with Gabin Vrillault and classmates).

## Features

- **Sign in with Spotify** and use your listening habits.
- **Create a story** from one or more images and a short written context.
- **AI generation** of the story visual, plus a Spotify track picked to match it, run as background jobs.
- **Library** of past stories, with regeneration of the image or the music.
- **PNG export**, English / French interface, built for phones first.

## How it works

```
Next.js (app router) ──► /api/v1 ──► FastAPI ──► Celery workers ──► story image + track
                                       │            │
                                  PostgreSQL      Redis
                                  (users, stories, jobs)
```

## Monorepo structure

- `frontend/`: Next.js app router client and UI shell
- `backend/`: FastAPI orchestrator, Spotify OAuth, story generation pipeline and jobs
- `docker-compose.yml`: local full-stack setup with PostgreSQL and Redis

## Local Docker workflow

This compose file is intentionally local-only. It now binds published ports to `127.0.0.1` so databases and app ports are not exposed on all interfaces by default.

1. Copy `.env.example` or `.env.docker.example` and set Spotify credentials.
2. Run:

```bash
docker compose up --build
```

3. Open:

- Frontend: `http://127.0.0.1:3000`
- Backend docs: `http://127.0.0.1:8000/docs`

## Production deployment

Use the dedicated production stack instead of `docker-compose.yml`.

- `docker-compose.prod.yml`: production Docker Compose stack
- `.env.production.example`: production environment template
- `deploy/PRODUCTION.md`: server setup, Nginx, Certbot and security checklist

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
