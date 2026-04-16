from datetime import datetime

from pydantic import BaseModel


class JobStatusResponse(BaseModel):
    id: str
    story_id: str | None = None
    job_type: str
    status: str
    error_message: str | None = None
    created_at: datetime
    started_at: datetime | None = None
    finished_at: datetime | None = None

