from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('login/', auth_views.LoginView.as_view(template_name='resume/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('resume/new/', views.resume_edit, name='resume_new'),
    path('resume/<int:resume_id>/edit/', views.resume_edit, name='resume_edit'),
    path('api/analyze_section/', views.analyze_section, name='analyze-section'),
    path('admin_dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('bulk-delete-resumes/', views.bulk_delete_resumes, name='bulk_delete_resumes'),
]