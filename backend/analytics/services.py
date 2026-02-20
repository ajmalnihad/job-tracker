"""
Analytics service layer for calculating user statistics.
"""

from django.db.models import Count, Avg, F
from django.utils import timezone
from datetime import timedelta
from applications.models import Application


class AnalyticsService:
    """Service class for analytics calculations."""
    
    @staticmethod
    def get_user_stats(user):
        """
        Calculate comprehensive analytics for a user.
        Returns dict with:
        - total_applications
        - response_rate
        - average_response_time
        - status_distribution
        - resume_performance
        """
        applications = Application.objects.filter(user=user)
        
        # Total applications
        total_applications = applications.count()
        
        # Response rate (% not rejected or still applied)
        if total_applications > 0:
            responded = applications.exclude(status__in=['applied', 'rejected']).count()
            response_rate = round((responded / total_applications) * 100, 2)
        else:
            response_rate = 0
        
        # Average response time (days from applied to first status change)
        avg_response_time = AnalyticsService._calculate_avg_response_time(applications)
        
        # Status distribution
        status_distribution = list(
            applications.values('status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        # Resume performance
        resume_performance = AnalyticsService._get_resume_performance(user)
        
        return {
            'total_applications': total_applications,
            'response_rate': response_rate,
            'average_response_time': avg_response_time,
            'status_distribution': status_distribution,
            'resume_performance': resume_performance,
        }
    
    @staticmethod
    def _calculate_avg_response_time(applications):
        """Calculate average days from applied_date to updated_at for non-applied status."""
        responded_apps = applications.exclude(status='applied')
        
        if not responded_apps.exists():
            return 0
        
        total_days = 0
        count = 0
        
        for app in responded_apps:
            days_diff = (app.updated_at.date() - app.applied_date).days
            if days_diff >= 0:  # Ensure positive values
                total_days += days_diff
                count += 1
        
        return round(total_days / count, 1) if count > 0 else 0
    
    @staticmethod
    def _get_resume_performance(user):
        """Get performance metrics for each resume."""
        from resumes.models import Resume
        
        resumes = Resume.objects.filter(user=user)
        
        performance = []
        for resume in resumes:
            performance.append({
                'id': resume.id,
                'title': resume.title,
                'total_applications': resume.total_applications,
                'success_rate': resume.success_rate,
            })
        
        return performance
