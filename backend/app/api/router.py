from fastapi import APIRouter

from app.api.routes import auth, jobs, me, stories


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(me.router, tags=["me"])
api_router.include_router(stories.router, prefix="/stories", tags=["stories"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])

