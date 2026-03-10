"""
Application model for job tracking.
"""

from django.db import models
from django.contrib.auth.models import User
from resumes.models import Resume


class Application(models.Model):
    """Job application model with status tracking."""
    
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('hr_contacted', 'HR Contacted'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    company_name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    job_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_date = models.DateField()

    follow_up_date = models.DateField(null=True, blank=True)
    is_notified = models.BooleanField(default=False)
    
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['applied_date']),
        ]
    
    def __str__(self):
        return f"{self.company_name} - {self.role} ({self.status})"
