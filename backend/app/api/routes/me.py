from fastapi import APIRouter, Depends

from app.schemas.auth import ProfileResponse
from app.services.dependencies import CurrentAccount, get_current_account


router = APIRouter()


@router.get("/me", response_model=ProfileResponse)
async def me(account: CurrentAccount = Depends(get_current_account)) -> ProfileResponse:
    return account.to_profile()

