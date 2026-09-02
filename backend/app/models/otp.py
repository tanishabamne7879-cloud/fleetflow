import uuid
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.mysql import CHAR
from datetime import datetime, timedelta
from app.database import Base

class OTP(Base):
    __tablename__ = "otps"
    
    otp_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(100), index=True)
    otp_code = Column(String(6))
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(minutes=10))