"""
Celery tasks for email reminders.
"""

from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import date
from applications.models import Application


@shared_task
def send_follow_up_reminder(application_id):
    """
    Send follow-up email reminder for a specific application.
    """
    try:
        application = Application.objects.get(id=application_id)
        user = application.user
        
        subject = f'Follow-up Reminder: {application.company_name} - {application.role}'
        message = f"""
        Hi {user.first_name},
        
        This is a reminder to follow up on your application:
        
        Company: {application.company_name}
        Role: {application.role}
        Applied Date: {application.applied_date}
        Current Status: {application.get_status_display()}
        
        Notes: {application.notes or 'No notes'}
        
        Good luck with your job search!
        
        Best regards,
        Job Tracker Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return f"Email sent to {user.email} for application {application_id}"
    
    except Application.DoesNotExist:
        return f"Application {application_id} not found"
    except Exception as e:
        return f"Error sending email: {str(e)}"


@shared_task
def check_follow_ups():
    """
    Check for applications with follow_up_date = today and send reminders.
    This task runs daily via Celery Beat.
    """
    today = date.today()
    applications_to_follow_up = Application.objects.filter(
        follow_up_date=today
    )
    
    count = 0
    for app in applications_to_follow_up:
        send_follow_up_reminder.delay(app.id)
        count += 1
    
    return f"Queued {count} follow-up reminders for {today}"
