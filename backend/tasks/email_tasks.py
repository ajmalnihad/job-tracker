"""
Email reminder functions for job application follow-ups.
Optimized for Production via external Web Cron jobs.
"""

import logging
from django.core.mail import send_mail
from django.conf import settings
from datetime import date
from applications.models import Application

# പ്രൊഡക്ഷനിൽ എററുകൾ ട്രാക്ക് ചെയ്യാൻ ലോഗർ ഉപയോഗിക്കുക
logger = logging.getLogger(__name__)

def send_follow_up_reminder(application_id):
    """
    Send follow-up email reminder for a specific application 
    and mark it as notified upon success.
    """
    try:
        application = Application.objects.get(id=application_id)
        user = application.user

        subject = f'Action Required: Follow-up Reminder for {application.company_name} ({application.role})'
        message = f"""
Hi {user.username},

This is an automated reminder to follow up on your job application today:

  Company: {application.company_name}
  Role:    {application.role}
  Applied: {application.applied_date}
  Status:  {application.get_status_display()}

Notes: {application.notes or 'No notes provided.'}

Log in to your Job Tracker dashboard to update the status or add new notes.

Best regards,
Job Tracker Automated System
"""

        # ഇമെയിൽ അയക്കുന്നു
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False, # എറർ വന്നാൽ നമ്മൾ അറിയണം, അതുകൊണ്ട് False
        )
        
        # BRUTAL FIX: ഇമെയിൽ സക്സസ് ആയാൽ മാത്രം is_notified മാറ്റുക!
        # ഇത് ചെയ്തില്ലെങ്കിൽ യൂസർക്ക് വീണ്ടും വീണ്ടും മെയിൽ പോകും (Spam).
        application.is_notified = True
        application.save()

        return True, f"Success: Email sent to {user.email} for application {application_id}"

    except Application.DoesNotExist:
        return False, f"Error: Application {application_id} not found in database."
    except Exception as e:
        return False, f"Error: Failed to send email for application {application_id}. Reason: {str(e)}"


def check_follow_ups():
    """
    Check for applications with follow_up_date = today and is_notified = False.
    Called by the secure API endpoint via cron-job.org.
    """
    today = date.today()
    
    # THE CRITICAL FILTER: is_notified=False ഉള്ളവ മാത്രം എടുക്കുക.
    applications_to_follow_up = Application.objects.filter(
        follow_up_date=today, 
        is_notified=False
    )

    success_count = 0
    failure_count = 0

    # ലൂപ്പ് ചെയ്ത് ഓരോന്നിനും ഇമെയിൽ അയക്കുന്നു
    for app in applications_to_follow_up:
        success, message = send_follow_up_reminder(app.id)
        
        if success:
            success_count += 1
            logger.info(message)
        else:
            failure_count += 1
            logger.error(message)

    # അന്തിമ റിപ്പോർട്ട് ഉണ്ടാക്കുന്നു
    result_message = f"Cron execution complete for {today}: Sent {success_count} reminders, {failure_count} failed."
    logger.info(result_message)
    
    return result_message