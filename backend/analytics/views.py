"""
Analytics views for user statistics.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import AnalyticsService


class AnalyticsView(APIView):
    """
    GET endpoint to retrieve user analytics.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return comprehensive analytics for the authenticated user."""
        stats = AnalyticsService.get_user_stats(request.user)
        return Response(stats)
