import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import random

class EmailService:
    @staticmethod
    def generate_otp():
        return ''.join(random.choices('0123456789', k=6))
    
    @staticmethod
    def send_otp_email(email: str, otp_code: str):
        """Send OTP via email"""
        # Always print OTP to console for testing
        print(f"\n{'='*50}")
        print(f"📧 OTP for {email}: {otp_code}")
        print(f"{'='*50}\n")
        
        # If email not configured, just return
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            print("ℹ️ Email not configured. OTP shown in console.")
            return True
        
        try:
            subject = "FleetFlow - Your OTP Verification Code"
            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0;">FleetFlow</h1>
                </div>
                <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
                    <h2>OTP Verification</h2>
                    <p>Your OTP code is:</p>
                    <div style="background: #e2e8f0; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; border-radius: 8px;">
                        {otp_code}
                    </div>
                    <p style="margin-top: 20px; color: #64748b;">This code will expire in 10 minutes.</p>
                    <p style="color: #64748b; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                </div>
            </body>
            </html>
            """
            
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_USER
            msg['To'] = email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))
            
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            print(f"✅ Email sent to {email}")
            return True
        except Exception as e:
            print(f"⚠️ Email error: {e}")
            print(f"📧 OTP for {email} (console): {otp_code}")
            return True