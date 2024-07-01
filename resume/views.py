from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib import messages
from .models import Resume, ResumeSection
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.http import require_POST, require_GET
import requests
import json
import logging

# LLM API 的 URL 和密钥
API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
API_KEY = "fa8169ddcea10641598540bf387bfc78.8L9Nr96gFTaR84ZQ"

ADVISOR_PROMPT = """
You are an AI interviewer helper candidates to optimize their resumes.

Analyze the content, and try your best to give them the ultimate optimization.
"""

def home(request):
    return render(request, 'resume/home.html')

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = UserCreationForm()
    return render(request, 'resume/register.html', {'form': form})

@login_required
def dashboard(request):
    resumes = Resume.objects.filter(user=request.user)
    return render(request, 'resume/dashboard.html', {'resumes': resumes})

@login_required
def resume_edit(request, resume_id=None):
    if resume_id:
        resume = get_object_or_404(Resume, id=resume_id, user=request.user)
        sections = resume.sections.all()
    else:
        resume = None
        sections = []

    if request.method == 'POST':
        if not request.body:
            return JsonResponse({'status': 'error', 'message': 'Empty request body'}, status=400)
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.POST

            new_name = data['name']
            if Resume.objects.filter(user=request.user, name=new_name).exclude(id=resume_id).exists():
                return JsonResponse({'status': 'error', 'message': 'A resume with this name already exists.'}, status=400)

            if resume:
                resume.name = new_name
                resume.save()
            else:
                resume = Resume.objects.create(user=request.user, name=new_name)

            ResumeSection.objects.filter(resume=resume).delete()
            for section_data in data['sections']:
                ResumeSection.objects.create(
                    resume=resume,
                    title=section_data['title'],
                    content=section_data['content'],
                    analysis=section_data['analysis'],
                    order=section_data['order']
                )
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return render(request, 'resume/resume_edit.html', {'resume': resume, 'sections': sections})

logger = logging.getLogger(__name__)

@login_required
@require_GET
def analyze_section(request):
    section_content = request.GET.get('content', '')
    if not section_content:
        logger.error("Empty section content received")
        return StreamingHttpResponse("data: Error: Empty section content\n\n", content_type='text/event-stream')
    def event_stream():
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        }
        data_to_llm = {
            "model": "glm-4",
            "messages": [
                {"role": "system", "content": ADVISOR_PROMPT},
                {"role": "user", "content": section_content}
            ],
            "stream": True,
        }

        try:
            with requests.post(API_URL, headers=headers, json=data_to_llm, stream=True) as response:
                logger.info(f"API response status code: {response.status_code}")
                if response.status_code != 200:
                    logger.error(f"Unexpected status code: {response.status_code}")
                    yield f"data: Error: Unexpected status code {response.status_code}\n\n"
                    return

                for line in response.iter_lines():
                    if line:
                        line = line.decode('utf-8')
                        if line.startswith('data:'):
                            if line.strip() == 'data: [DONE]':
                                break
                            try:
                                data = json.loads(line[6:])
                                if 'choices' in data and len(data['choices']) > 0:
                                    content = data['choices'][0]['delta'].get('content', '')
                                    if content:
                                        yield f"data: {content}\n\n"
                            except json.JSONDecodeError:
                                logger.error(f"Failed to parse JSON: {line}")
                                yield f"data: Error parsing JSON: {line}\n\n"
                            except KeyError:
                                yield f"data: Error accessing data: {line}\n\n"

        except requests.RequestException as e:
            yield f"data: Request Error: {str(e)}\n\n"
        except Exception as e:
            yield f"data: Unexpected Error: {str(e)}\n\n"

    return StreamingHttpResponse(event_stream(), content_type='text/event-stream')

@user_passes_test(lambda u: u.is_staff)
def admin_dashboard(request):
    resumes = Resume.objects.all()
    return render(request, 'resume/admin_dashboard.html', {'resumes': resumes})

@login_required
@require_POST
def bulk_delete_resumes(request):
    resume_ids = request.POST.getlist('resume_ids')
    Resume.objects.filter(id__in=resume_ids, user=request.user).delete()
    messages.success(request, f"{len(resume_ids)} resume(s) deleted successfully.")
    return redirect('dashboard')