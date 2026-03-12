"""
Application viewsets with CRUD operations and filtering.
"""

import logging

from rest_framework import viewsets, status
from rest_framework.decorators import (
    action,
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.conf import settings

from .models import Application
from .serializers import (
    ApplicationSerializer,
    ApplicationListSerializer,
    ApplicationStatusUpdateSerializer,
)
from .permissions import IsOwner
from .filters import ApplicationFilter
from tasks.email_tasks import check_follow_ups

logger = logging.getLogger(__name__)


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
            # Try strict __date extraction (works if DB field is DateTimeField)
            applications = Application.objects.filter(
                user=request.user,
                follow_up_date__date__in=[today, tomorrow]
            ).exclude(
                status__in=['rejected', 'REJECTED', 'offer', 'OFFER']
            ).order_by('follow_up_date')
            # Evaluate to catch FieldError early
            _ = len(applications)
        except Exception:
            # Fallback for models.DateField which matches cleanly via __in
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


# ── Cron Job Endpoint (No JWT) ───────────────────────────────────────────────

@api_view(['GET'])
@authentication_classes([])   # Bypass JWT — cron jobs have no bearer token
@permission_classes([AllowAny])
def trigger_daily_alerts(request):
    """
    Endpoint callable ONLY by an external cron service.
    Authenticated via the X-Cron-Secret header, NOT via JWT.
    """
    secret_token = request.headers.get('X-Cron-Secret')
    expected_token = settings.CRON_SECRET_KEY

    if not secret_token or secret_token != expected_token:
        logger.warning(
            "Unauthorized cron attempt from %s. Token: %s",
            request.META.get('REMOTE_ADDR', 'unknown'),
            secret_token,
        )
        return Response(
            {"error": "Unauthorized Cron Attempt"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    result = check_follow_ups()
    return Response(result, status=status.HTTP_200_OK)