from fastapi import APIRouter, Depends, File, Form, Response, UploadFile, status
from fastapi.responses import FileResponse

from app.schemas.jobs import JobStatusResponse
from app.schemas.stories import StoryDetailResponse, StorySummaryResponse
from app.services.dependencies import CurrentAccount, get_current_account
from app.services.story_service import (
    create_story_generation,
    delete_story_for_user,
    get_story_asset_for_user,
    get_story_for_user,
    list_stories_for_user,
    regenerate_story_image,
    regenerate_story_music,
)


router = APIRouter()


@router.post("", response_model=JobStatusResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_story(
    context: str = Form(...),
    language: str = Form("fr"),
    images: list[UploadFile] = File(...),
    account: CurrentAccount = Depends(get_current_account),
) -> JobStatusResponse:
    return await create_story_generation(
        user_id=account.user.id,
        spotify_connection=account.spotify_connection,
        context_text=context,
        language=language,
        images=images,
    )


@router.get("", response_model=list[StorySummaryResponse])
async def list_stories(account: CurrentAccount = Depends(get_current_account)) -> list[StorySummaryResponse]:
    return list_stories_for_user(account.user.id)


@router.get("/{story_id}", response_model=StoryDetailResponse)
async def get_story(story_id: str, account: CurrentAccount = Depends(get_current_account)) -> StoryDetailResponse:
    return get_story_for_user(story_id=story_id, user_id=account.user.id)


@router.delete("/{story_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_story(story_id: str, account: CurrentAccount = Depends(get_current_account)) -> Response:
    delete_story_for_user(story_id=story_id, user_id=account.user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{story_id}/regenerate-image", response_model=JobStatusResponse, status_code=status.HTTP_202_ACCEPTED)
async def regenerate_image(story_id: str, account: CurrentAccount = Depends(get_current_account)) -> JobStatusResponse:
    return regenerate_story_image(story_id=story_id, user_id=account.user.id, spotify_connection=account.spotify_connection)


@router.post("/{story_id}/regenerate-music", response_model=JobStatusResponse, status_code=status.HTTP_202_ACCEPTED)
async def regenerate_music(story_id: str, account: CurrentAccount = Depends(get_current_account)) -> JobStatusResponse:
    return regenerate_story_music(story_id=story_id, user_id=account.user.id, spotify_connection=account.spotify_connection)


@router.get("/{story_id}/download")
async def download_story(story_id: str, account: CurrentAccount = Depends(get_current_account)) -> FileResponse:
    story, file_path = get_story_asset_for_user(story_id=story_id, user_id=account.user.id)
    return FileResponse(
        file_path,
        media_type="image/png",
        filename=f"storyforge-{story.id}.png",
    )


@router.get("/{story_id}/image")
async def story_image(story_id: str, account: CurrentAccount = Depends(get_current_account)) -> FileResponse:
    _, file_path = get_story_asset_for_user(story_id=story_id, user_id=account.user.id)
    return FileResponse(file_path, media_type="image/png")

