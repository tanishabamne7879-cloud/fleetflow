# backend/app/services/email_service.py

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Email configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """Send email using SMTP"""
    try:
        if not SMTP_USER or not SMTP_PASSWORD:
            logger.warning("SMTP credentials not configured. Email not sent.")
            # For development, just log
            logger.info(f"📧 Would send email to {to_email}: {subject}")
            return True

        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = FROM_EMAIL
        msg["To"] = to_email

        # Add text part
        if text_content:
            part1 = MIMEText(text_content, "plain")
            msg.attach(part1)

        # Add HTML part
        part2 = MIMEText(html_content, "html")
        msg.attach(part2)

        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())

        logger.info(f"✅ Email sent to {to_email}")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to send email to {to_email}: {e}")
        return False


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """Send OTP verification email"""
    subject = "FleetFlow - Your OTP Verification Code"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            .header {{
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #3b82f6;
            }}
            .header h1 {{
                color: #1e293b;
                font-size: 28px;
                margin: 0;
            }}
            .header span {{
                color: #3b82f6;
            }}
            .content {{
                padding: 30px 0;
                text-align: center;
            }}
            .otp-code {{
                font-size: 48px;
                font-weight: bold;
                color: #3b82f6;
                background-color: #f0f7ff;
                padding: 20px 40px;
                border-radius: 10px;
                display: inline-block;
                letter-spacing: 8px;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚚 Fleet<span>Flow</span></h1>
                <p style="color: #6b7280; margin: 5px 0 0;">Fleet Management System</p>
            </div>
            <div class="content">
                <h2 style="color: #1e293b;">Verify Your Email</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thank you for registering with FleetFlow!<br>
                    Please use the following OTP code to verify your email address:
                </p>
                <div class="otp-code">{otp_code}</div>
                <p style="color: #6b7280; font-size: 14px;">
                    This OTP is valid for <strong>10 minutes</strong>.<br>
                    If you didn't request this, please ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>© 2024 FleetFlow. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    FleetFlow - OTP Verification Code
    
    Your OTP code is: {otp_code}
    
    This OTP is valid for 10 minutes.
    If you didn't request this, please ignore this email.
    
    © 2024 FleetFlow. All rights reserved.
    """
    
    return send_email(to_email, subject, html_content, text_content)


def send_welcome_email(to_email: str, full_name: str) -> bool:
    """Send welcome email to new user"""
    subject = "Welcome to FleetFlow! 🚚"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            .header {{
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #3b82f6;
            }}
            .header h1 {{
                color: #1e293b;
                font-size: 28px;
                margin: 0;
            }}
            .header span {{
                color: #3b82f6;
            }}
            .content {{
                padding: 30px 0;
                text-align: center;
            }}
            .features {{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 30px 0;
                text-align: left;
            }}
            .feature-item {{
                background-color: #f8fafc;
                padding: 15px;
                border-radius: 8px;
            }}
            .feature-item h4 {{
                margin: 0 0 5px 0;
                color: #1e293b;
            }}
            .feature-item p {{
                margin: 0;
                color: #6b7280;
                font-size: 14px;
            }}
            .footer {{
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚚 Fleet<span>Flow</span></h1>
                <p style="color: #6b7280; margin: 5px 0 0;">Fleet Management System</p>
            </div>
            <div class="content">
                <h2 style="color: #1e293b;">Welcome, {full_name}! 🎉</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Your account has been successfully created.<br>
                    You can now start managing your fleet efficiently.
                </p>
                <div class="features">
                    <div class="feature-item">
                        <h4>🚚 Vehicle Management</h4>
                        <p>Track and manage all your vehicles</p>
                    </div>
                    <div class="feature-item">
                        <h4>📍 Live Tracking</h4>
                        <p>Real-time GPS tracking</p>
                    </div>
                    <div class="feature-item">
                        <h4>📦 Shipment Management</h4>
                        <p>Manage shipments efficiently</p>
                    </div>
                    <div class="feature-item">
                        <h4>📊 Analytics</h4>
                        <p>Get insights and reports</p>
                    </div>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    <a href="#" style="color: #3b82f6;">Login to your dashboard</a> to get started.
                </p>
            </div>
            <div class="footer">
                <p>© 2024 FleetFlow. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Welcome to FleetFlow, {full_name}!
    
    Your account has been successfully created.
    You can now start managing your fleet efficiently.
    
    Features:
    - Vehicle Management
    - Live Tracking
    - Shipment Management
    - Analytics & Reports
    
    © 2024 FleetFlow. All rights reserved.
    """
    
    return send_email(to_email, subject, html_content, text_content)


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """Send password reset email"""
    subject = "FleetFlow - Password Reset Request"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            .header {{
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #3b82f6;
            }}
            .header h1 {{
                color: #1e293b;
                font-size: 28px;
                margin: 0;
            }}
            .header span {{
                color: #3b82f6;
            }}
            .content {{
                padding: 30px 0;
                text-align: center;
            }}
            .reset-button {{
                display: inline-block;
                background-color: #3b82f6;
                color: white;
                padding: 12px 30px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚚 Fleet<span>Flow</span></h1>
                <p style="color: #6b7280; margin: 5px 0 0;">Password Reset</p>
            </div>
            <div class="content">
                <h2 style="color: #1e293b;">Reset Your Password</h2>
                <p style="color: #4b5563; font-size: 16px;">
                    We received a request to reset your password.<br>
                    Click the button below to set a new password:
                </p>
                <a href="{reset_link}" class="reset-button">Reset Password</a>
                <p style="color: #6b7280; font-size: 14px;">
                    This link is valid for <strong>1 hour</strong>.<br>
                    If you didn't request this, please ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>© 2024 FleetFlow. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    FleetFlow - Password Reset
    
    Click the following link to reset your password:
    {reset_link}
    
    This link is valid for 1 hour.
    If you didn't request this, please ignore this email.
    
    © 2024 FleetFlow. All rights reserved.
    """
    
    return send_email(to_email, subject, html_content, text_content)


# EmailService class for backward compatibility
class EmailService:
    """Email service class for backward compatibility"""
    
    @staticmethod
    def send_otp_email(to_email: str, otp_code: str) -> bool:
        return send_otp_email(to_email, otp_code)
    
    @staticmethod
    def send_welcome_email(to_email: str, full_name: str) -> bool:
        return send_welcome_email(to_email, full_name)
    
    @staticmethod
    def send_password_reset_email(to_email: str, reset_link: str) -> bool:
        return send_password_reset_email(to_email, reset_link)