import uuid
from sqlalchemy import Column, ForeignKey, DateTime, Boolean, Date
from sqlalchemy.dialects.mysql import CHAR
from datetime import datetime
from app.database import Base

class Attendance(Base):
    __tablename__ = "attendance"
    
    attendance_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    driver_id = Column(CHAR(36), ForeignKey("drivers.driver_id"))
    date = Column(Date)
    check_in = Column(DateTime)
    check_out = Column(DateTime)
    is_present = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)