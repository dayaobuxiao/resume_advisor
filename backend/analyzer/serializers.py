from rest_framework import serializers
from .models import Resume

class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ('id', 'user', 'personal_statement', 'education', 'work_experience', 'projects', 'analysis', 'created_at', 'updated_at')
        read_only_fields = ('analysis', 'created_at', 'updated_at')