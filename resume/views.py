from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib import messages
from .models import Resume, ResumeSection
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import requests
import json

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


# 假设的LLM API调用函数
def call_llm_api(content):
    # 这里是调用LLM API的逻辑
    data = {
        "model": "glm-4",
        "messages": [
            {"role": "system", "content": ADVISOR_PROMPT},
            {"role": "user", "content": content}
        ],
        "max_tokens": 500,
        "temperature": 0.7,
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    # 发送请求到LLM
    response = requests.post(API_URL, headers=headers, json=data)
    result = response.json()["choices"][0]["message"]["content"].strip()
    return result

@login_required
def analyze_section(request):
    data = json.loads(request.body)
    section_content = data.get('content', '')

    # 调用LLM API进行分析
    analysis_result = call_llm_api(section_content)

    return JsonResponse({
        'status': 'success',
        'analysis': analysis_result
    })

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