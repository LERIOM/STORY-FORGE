from datetime import datetime, timezone

from app.models.story import Story
from app.services.story_service import serialize_story_summary


def test_story_summary_serialization_contains_routes():
    story = Story(
        id="story-1",
        user_id="user-1",
        status="ready",
        language="fr",
        context_text="Test story",
        image_storage_key="generated/story-1.png",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    payload = serialize_story_summary(story)

    assert payload.image_url == "/api/v1/stories/story-1/image"
    assert payload.download_url == "/api/v1/stories/story-1/download"
