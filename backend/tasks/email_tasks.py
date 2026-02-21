"""
Email reminder functions for job application follow-ups.
Previously Celery tasks, now plain synchronous functions.
To run on a schedule, call check_follow_ups() from a management command
and configure a Render Cron Job to execute it daily.
"""

from django.core.mail import send_mail
from django.conf import settings
from datetime import date
from applications.models import Application


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
  Role:    {application.role}
  Applied: {application.applied_date}
  Status:  {application.get_status_display()}

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


def check_follow_ups():
    """
    Check for applications with follow_up_date = today and send reminders.
    Call this function from a management command scheduled as a Render Cron Job
    (e.g. daily at 9 AM):  python manage.py send_follow_up_reminders
    """
    today = date.today()
    applications_to_follow_up = Application.objects.filter(follow_up_date=today)

    count = 0
    for app in applications_to_follow_up:
        send_follow_up_reminder(app.id)
        count += 1

    return f"Sent {count} follow-up reminder(s) for {today}"
