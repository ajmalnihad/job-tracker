"""
Resume model for PDF upload and tracking.
"""

from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    """Resume model for storing uploaded PDFs."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='resumes/%Y/%m/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    @property
    def success_rate(self):
        """Calculate success rate based on related applications."""
        total_apps = self.applications.count()
        if total_apps == 0:
            return 0
        
        successful_apps = self.applications.filter(
            status__in=['hr_contacted', 'interview', 'offer']
        ).count()
        
        return round((successful_apps / total_apps) * 100, 2)
    
    @property
    def total_applications(self):
        """Total applications using this resume."""
        return self.applications.count()
