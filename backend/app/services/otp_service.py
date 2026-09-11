# backend/app/services/otp_service.py

import random
import string
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.otp import OTP
from app.services.email_service import send_otp_email
import logging

logger = logging.getLogger(__name__)

class OTPService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_otp(self, email: str, length: int = 6) -> str:
        """Generate and save OTP for email"""
        # Generate OTP code
        otp_code = ''.join(random.choices(string.digits, k=length))
        
        # Delete old OTPs for this email
        self.db.query(OTP).filter(
            OTP.email == email,
            OTP.is_used == False
        ).delete()
        
        # Create new OTP
        otp = OTP(
            email=email,
            otp_code=otp_code,
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        )
        self.db.add(otp)
        self.db.commit()
        
        # Send OTP via email
        try:
            send_otp_email(email, otp_code)
            logger.info(f"✅ OTP sent to {email}")
        except Exception as e:
            logger.error(f"❌ Failed to send OTP email: {e}")
        
        return otp_code
    
    def verify_otp(self, email: str, otp_code: str) -> bool:
        """Verify OTP code"""
        otp = self.db.query(OTP).filter(
            OTP.email == email,
            OTP.otp_code == otp_code,
            OTP.is_used == False,
            OTP.expires_at > datetime.utcnow()
        ).first()
        
        if not otp:
            return False
        
        # Mark OTP as used
        otp.is_used = True
        self.db.commit()
        
        return True
    
    def resend_otp(self, email: str) -> str:
        """Resend OTP"""
        # Delete old OTPs
        self.db.query(OTP).filter(
            OTP.email == email,
            OTP.is_used == False
        ).delete()
        self.db.commit()
        
        # Generate new OTP
        return self.generate_otp(email)