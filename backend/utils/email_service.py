import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def send_email(to_email, subject, body):
    try:
        # Get configuration
        smtp_host = os.getenv("EMAIL_HOST")
        smtp_port = int(os.getenv("EMAIL_PORT"))
        smtp_user = os.getenv("EMAIL_USER")
        smtp_password = os.getenv("EMAIL_PASSWORD")
        
        # Check if config is missing
        if not smtp_user or not smtp_password:
            print("❌ Email credentials missing in .env file")
            return False
        
        # Create email
        msg = MIMEMultipart()
        msg['From'] = f"learnsphere <{smtp_user}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add body
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        print(f"✅ Email sent to {to_email}")
        return True
        
    except smtplib.SMTPAuthenticationError:
        print("❌ Email login failed. Check your email and app password.")
        return False
    except Exception as e:
        print(f"❌ Email error: {str(e)}")
        return False