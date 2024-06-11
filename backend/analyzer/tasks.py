from celery import shared_task
from .models import Resume
from .utils import analyze_resume_text

@shared_task
def analyze_resume(resume_id):
    resume = Resume.objects.get(id=resume_id)
    text = f"{resume.personal_statement}\n{resume.education}\n{resume.work_experience}\n{resume.projects}"
    analysis = analyze_resume_text(text)
    resume.analysis = analysis
    resume.save()
    return analysis