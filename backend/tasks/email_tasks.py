from django.core.mail import send_mail
from django.conf import settings
from datetime import date
from applications.models import Application

def send_follow_up_reminder(application):
    """
    Returns a tuple: (is_success: bool, message: str)
    """
    user = application.user
    
    # Brutal Validation: യൂസർക്ക് ഇമെയിൽ ഇല്ലെങ്കിൽ അവിടെ വെച്ച് തന്നെ ബ്ലോക്ക് ചെയ്യുക
    if not user.email:
        return False, f"User '{user.username}' has no email address."

    subject = f'Follow-up Reminder: {application.company_name} - {application.role}'
    message = f"""
Hi {user.first_name or user.username},

This is a reminder to follow up on your application:

  Company: {application.company_name}
  Role:    {application.role}
  Applied: {application.applied_date}
  Status:  {application.get_status_display()}

Notes: {application.notes or 'No notes'}

Good luck with your job search!
"""

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return True, f"Sent to {user.email}"
    except Exception as e:
        return False, f"SMTP Error: {str(e)}"

def check_follow_ups():
    today = date.today()
    applications_to_follow_up = Application.objects.filter(follow_up_date=today, is_notified=False)

    success_count = 0
    failed_count = 0
    error_logs = []

    for app in applications_to_follow_up:
        is_success, msg = send_follow_up_reminder(app)
        
        if is_success:
            app.is_notified = True
            app.save()
            success_count += 1
        else:
            failed_count += 1
            error_logs.append(f"App ID {app.id}: {msg}")

    # കൃത്യമായ റിപ്പോർട്ട് തിരികെ നൽകുന്നു
    return {
        "message": f"Cron execution complete for {today}: Sent {success_count} reminders, {failed_count} failed.",
        "errors": error_logs
    }