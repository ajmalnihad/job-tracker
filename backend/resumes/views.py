"""
Resume viewset with file upload and validation.
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Resume
from .serializers import ResumeSerializer, ResumeListSerializer
from .validators import validate_file_extension, validate_file_size
from applications.permissions import IsOwner


class ResumeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for resume CRUD operations with file upload.
    """
    permission_classes = [IsAuthenticated, IsOwner]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ResumeListSerializer
        return ResumeSerializer
    
    def create(self, request, *args, **kwargs):
        """Handle file upload with validation."""
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file
        try:
            validate_file_extension(file)
            validate_file_size(file)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)
