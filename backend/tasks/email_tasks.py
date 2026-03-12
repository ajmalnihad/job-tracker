"""
Production-grade mass mailing for follow-up reminders.

Architecture: Opens ONE SMTP connection, sends all emails through it,
and closes it once — preventing Gunicorn worker timeouts (SIGKILL)
caused by per-email TCP+TLS handshakes.
"""

import logging
import smtplib
import socket
from datetime import date

from django.conf import settings
from django.core.mail import EmailMessage, get_connection

from applications.models import Application

logger = logging.getLogger(__name__)


def check_follow_ups():
    """
    Sends follow-up reminder emails for all applications due today.

    Opens a single SMTP connection, iterates through all pending
    applications, sends each email through that connection, and
    gracefully handles per-email failures without killing the batch.

    Returns:
        dict: Structured report with counts and error details.
              {
                  "date": "2026-03-12",
                  "total_found": 5,
                  "sent": 4,
                  "failed": 1,
                  "errors": ["App ID 42 (user 'john'): SMTP Error: ..."]
              }
    """
    today = date.today()
    applications = Application.objects.filter(
        follow_up_date=today,
        is_notified=False,
    ).select_related('user')

    total_found = applications.count()
    success_count = 0
    failed_count = 0
    error_logs = []

    if total_found == 0:
        logger.info("Cron %s: No follow-ups due today.", today)
        return {
            "date": str(today),
            "total_found": 0,
            "sent": 0,
            "failed": 0,
            "errors": [],
        }

    logger.info("Cron %s: Found %d follow-ups to process.", today, total_found)

    # ── Open ONE connection for the entire batch ──────────────────────
    connection = get_connection(fail_silently=False)
    try:
        connection.open()

        for app in applications:
            user = app.user

            # Skip users with no email address
            if not user.email:
                failed_count += 1
                msg = f"App ID {app.id} (user '{user.username}'): No email address on file."
                error_logs.append(msg)
                logger.warning(msg)
                continue

            subject = f"Follow-up Reminder: {app.company_name} - {app.role}"
            body = (
                f"Hi {user.first_name or user.username},\n\n"
                f"This is a reminder to follow up on your application:\n\n"
                f"  Company: {app.company_name}\n"
                f"  Role:    {app.role}\n"
                f"  Applied: {app.applied_date}\n"
                f"  Status:  {app.get_status_display()}\n\n"
                f"Notes: {app.notes or 'No notes'}\n\n"
                f"Good luck with your job search!"
            )

            try:
                email = EmailMessage(
                    subject=subject,
                    body=body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email],
                    connection=connection,
                )
                email.send(fail_silently=False)

                app.is_notified = True
                app.save(update_fields=['is_notified'])
                success_count += 1
                logger.info("Sent reminder to %s (App ID %d).", user.email, app.id)

            except (smtplib.SMTPException, socket.error) as exc:
                failed_count += 1
                msg = f"App ID {app.id} (user '{user.username}'): Network/SMTP drop: {exc}"
                error_logs.append(msg)
                logger.error("SMTP network failure mid-batch: %s", msg)
                # If network drops, subsequent emails will also fail. Break loop.
                break

            except Exception as exc:
                failed_count += 1
                msg = f"App ID {app.id} (user '{user.username}'): {exc}"
                error_logs.append(msg)
                logger.error("SMTP failure — %s", msg)
                # Continue if it's an isolated issue like an invalid email format

    except (smtplib.SMTPException, socket.error) as exc:
        # Connection-level failure (e.g. SMTP connection timeout, unreachable network)
        logger.critical("Failed to open or maintain SMTP connection: %s", exc)
        return {
            "date": str(today),
            "total_found": total_found,
            "sent": success_count,
            "failed": total_found - success_count,
            "errors": [f"SMTP network failure: {exc}"],
        }
    except Exception as exc:
        logger.critical("Unexpected error in mass mailer: %s", exc)
        return {
            "date": str(today),
            "total_found": total_found,
            "sent": success_count,
            "failed": total_found - success_count,
            "errors": [f"Unexpected error: {exc}"],
        }
    finally:
        # Always close the connection safely, even if network dropped
        try:
            connection.close()
        except Exception as close_exc:
            logger.warning("Failed to close SMTP connection gracefully: %s", close_exc)

    logger.info(
        "Cron %s complete: %d sent, %d failed out of %d.",
        today, success_count, failed_count, total_found,
    )

    return {
        "date": str(today),
        "total_found": total_found,
        "sent": success_count,
        "failed": failed_count,
        "errors": error_logs,
    }