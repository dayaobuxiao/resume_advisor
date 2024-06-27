from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from .models import Resume, ResumeSection
from django.http import JsonResponse
import json

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
            if resume:
                resume.name = data['name']
                resume.save()
            else:
                resume = Resume.objects.create(user=request.user, name=data['name'])

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

@login_required
def analyze_resume(request, resume_id):
    resume = get_object_or_404(Resume, id=resume_id, user=request.user)
    # Placeholder for AI analysis logic
    for section in resume.sections.all():
        section.analysis = f"AI analysis for {section.title}: This is a placeholder."
        section.save()
    return JsonResponse({'status': 'success'})


@user_passes_test(lambda u: u.is_staff)
def admin_dashboard(request):
    resumes = Resume.objects.all()
    return render(request, 'resume/admin_dashboard.html', {'resumes': resumes})