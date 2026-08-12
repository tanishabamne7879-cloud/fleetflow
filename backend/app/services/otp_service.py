from sqlalchemy.orm import Session
from app.models.otp import OTP
from app.services.email_service import EmailService
from datetime import datetime, timedelta
import uuid

class OTPService:
    @staticmethod
    def create_and_send_otp(db: Session, email: str) -> bool:
        """Create OTP and send to email (or console for testing)"""
        # Invalidate old OTPs
        db.query(OTP).filter(
            OTP.email == email,
            OTP.is_used == False
        ).update({"is_used": True})
        db.commit()
        
        # Generate new OTP
        otp_code = EmailService.generate_otp()
        
        # Save to database
        otp = OTP(
            otp_id=str(uuid.uuid4()),
            email=email,
            otp_code=otp_code,
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        )
        db.add(otp)
        db.commit()
        
        # For testing: always print OTP and return True
        print(f"\n{'='*50}")
        print(f"📧 OTP for {email}: {otp_code}")
        print(f"{'='*50}\n")
        
        # Try to send email, but don't fail if it doesn't work
        try:
            EmailService.send_otp_email(email, otp_code)
        except Exception as e:
            print(f"⚠️ Email sending failed, but OTP is shown above.")
        
        # Always return True for testing
        return True
    
    @staticmethod
    def verify_otp(db: Session, email: str, otp_code: str) -> bool:
        """Verify OTP code"""
        otp = db.query(OTP).filter(
            OTP.email == email,
            OTP.otp_code == otp_code,
            OTP.is_used == False,
            OTP.expires_at > datetime.utcnow()
        ).first()
        
        if otp:
            otp.is_used = True
            db.commit()
            return True
        return False