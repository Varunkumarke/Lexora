# import os
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# from dotenv import load_dotenv

# load_dotenv()

# def send_email(to_email, subject, body):
#     try:
#         # Get configuration
#         smtp_host = os.getenv("EMAIL_HOST")
#         smtp_port = int(os.getenv("EMAIL_PORT"))
#         smtp_user = os.getenv("EMAIL_USER")
#         smtp_password = os.getenv("EMAIL_PASSWORD")
        
#         # Check if config is missing
#         if not smtp_user or not smtp_password:
#             print("❌ Email credentials missing in .env file")
#             return False
        
#         # Create email
#         msg = MIMEMultipart()
#         msg['From'] = f"learnsphere <{smtp_user}>"
#         msg['To'] = to_email
#         msg['Subject'] = subject
        
#         # Add body
#         msg.attach(MIMEText(body, 'plain'))
        
#         # Send email
#         with smtplib.SMTP(smtp_host, smtp_port) as server:
#             server.starttls()
#             server.login(smtp_user, smtp_password)
#             server.send_message(msg)
        
#         print(f"✅ Email sent to {to_email}")
#         return True
        
#     except smtplib.SMTPAuthenticationError:
#         print("❌ Email login failed. Check your email and app password.")
#         return False
#     except Exception as e:
#         print(f"❌ Email error: {str(e)}")
#         return False


import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()


def send_email(to_email, subject, body):
    """Send an email using SMTP settings from environment variables.

    Required variables: EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD.
    EMAIL_PORT defaults to 587 (STARTTLS).
    Returns True only when the SMTP server accepts the message; otherwise False.
    """
    smtp_host = (os.getenv("EMAIL_HOST") or "").strip()
    smtp_port_raw = (os.getenv("EMAIL_PORT") or "587").strip()
    smtp_user = (os.getenv("EMAIL_USER") or "").strip()
    smtp_password = os.getenv("EMAIL_PASSWORD") or ""

    if not smtp_host:
        print("Email configuration error: EMAIL_HOST is missing")
        return False

    if not smtp_user or not smtp_password:
        print("Email configuration error: EMAIL_USER or EMAIL_PASSWORD is missing")
        return False

    try:
        smtp_port = int(smtp_port_raw)
    except (TypeError, ValueError):
        print("Email configuration error: EMAIL_PORT must be a valid port number (usually 587)")
        return False

    if not 1 <= smtp_port <= 65535:
        print("Email configuration error: EMAIL_PORT must be between 1 and 65535")
        return False

    msg = MIMEMultipart()
    msg["From"] = f"Lexora Nexus <{smtp_user}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)

        print(f"Email accepted by SMTP server for recipient: {to_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        print("Email sending failed: SMTP authentication failed; check EMAIL_USER and EMAIL_PASSWORD")
    except (smtplib.SMTPConnectError, smtplib.SMTPServerDisconnected, TimeoutError, OSError) as exc:
        print(f"Email sending failed: SMTP connection problem: {exc}")
    except smtplib.SMTPException as exc:
        print(f"Email sending failed: SMTP error: {exc}")
    except Exception as exc:
        print(f"Email sending failed: unexpected error: {exc}")

    return False
