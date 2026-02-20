"""
Resume serializers with file upload handling.
"""

from rest_framework import serializers
from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    """Resume serializer with file upload and performance metrics."""
    success_rate = serializers.ReadOnlyField()
    total_applications = serializers.ReadOnlyField()
    
    class Meta:
        model = Resume
        fields = ['id', 'title', 'file', 'uploaded_at', 'success_rate', 'total_applications']
        read_only_fields = ['id', 'uploaded_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ResumeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for resume list view."""
    
    class Meta:
        model = Resume
        fields = ['id', 'title', 'uploaded_at']
