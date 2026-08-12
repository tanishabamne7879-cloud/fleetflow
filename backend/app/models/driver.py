import uuid
from sqlalchemy import Column, ForeignKey, String, Date, Boolean, DateTime
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Driver(Base):
    __tablename__ = "drivers"
    
    driver_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(CHAR(36), ForeignKey("users.user_id"), unique=True)
    license_number = Column(String(50))
    license_expiry = Column(Date)
    experience_years = Column(String(10))
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", backref="driver_profile")