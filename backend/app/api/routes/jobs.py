from fastapi import APIRouter, Depends

from app.schemas.jobs import JobStatusResponse
from app.services.dependencies import CurrentAccount, get_current_account
from app.services.story_service import get_job_for_user


router = APIRouter()


@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    account: CurrentAccount = Depends(get_current_account),
) -> JobStatusResponse:
    return get_job_for_user(job_id=job_id, user_id=account.user.id)

