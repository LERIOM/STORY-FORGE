from app.services.story_service import run_generation_job
from app.tasks.celery_app import celery_app


@celery_app.task(name="story_forge.process_generation_job")
def process_generation_job(job_id: str) -> None:
    run_generation_job(job_id)
