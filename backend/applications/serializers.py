"""
Application serializers for CRUD operations.
"""

from rest_framework import serializers
from .models import Application
from resumes.serializers import ResumeSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    """Full application serializer with nested resume data."""
    resume_details = ResumeSerializer(source='resume', read_only=True)
    
    class Meta:
        model = Application
        fields = [
            'id', 'company_name', 'role', 'job_url', 'status',
            'applied_date', 'follow_up_date', 'resume', 'resume_details',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Automatically set user from request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ApplicationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    
    class Meta:
        model = Application
        fields = [
            'id', 'company_name', 'role', 'status',
            'applied_date', 'follow_up_date', 'created_at'
        ]


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for Kanban drag & drop status updates."""
    
    class Meta:
        model = Application
        fields = ['id', 'status']
