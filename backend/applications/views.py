"""
Application viewsets with CRUD operations and filtering.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Application
from .serializers import (
    ApplicationSerializer,
    ApplicationListSerializer,
    ApplicationStatusUpdateSerializer
)
from .permissions import IsOwner
from .filters import ApplicationFilter
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for application CRUD operations.
    Supports filtering by status, date range, and search.
    """
    permission_classes = [IsAuthenticated, IsOwner]
    filterset_class = ApplicationFilter
    search_fields = ['company_name', 'role']
    ordering_fields = ['created_at', 'applied_date', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter applications by authenticated user."""
        return Application.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view."""
        if self.action == 'list':
            return ApplicationListSerializer
        elif self.action == 'update_status':
            return ApplicationStatusUpdateSerializer
        return ApplicationSerializer
    
    @action(detail=False, methods=['get'], url_path='follow-ups')
    def follow_ups(self, request):
        """Get applications needing follow-up today or tomorrow."""
        import datetime
        today = datetime.date.today()
        tomorrow = today + datetime.timedelta(days=1)
        
        try:
            # As explicitly requested, try strict __date extraction (works if DB field is DateTimeField)
            applications = Application.objects.filter(
                user=request.user,
                follow_up_date__date__in=[today, tomorrow]
            ).exclude(
                status__in=['rejected', 'REJECTED', 'offer', 'OFFER']
            ).order_by('follow_up_date')
            # Evaluate to catch FieldError early
            _ = len(applications)
        except Exception:
            # Fallback natively for models.DateField which doesn't support __date transform but matches cleanly via __in
            applications = Application.objects.filter(
                user=request.user,
                follow_up_date__in=[today, tomorrow]
            ).exclude(
                status__in=['rejected', 'REJECTED', 'offer', 'OFFER']
            ).order_by('follow_up_date')
            
        serializer = ApplicationListSerializer(applications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Custom action for Kanban drag & drop status updates."""
        application = self.get_object()
        serializer = ApplicationStatusUpdateSerializer(
            application,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
