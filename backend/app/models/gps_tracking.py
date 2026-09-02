import uuid
from sqlalchemy import Column, ForeignKey, DateTime, DECIMAL, Boolean, Integer
from sqlalchemy.dialects.mysql import CHAR
from datetime import datetime
from app.database import Base

class GPSTracking(Base):
    __tablename__ = "gps_tracking"
    
    tracking_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(CHAR(36), ForeignKey("vehicles.vehicle_id"))
    latitude = Column(DECIMAL(10, 8))
    longitude = Column(DECIMAL(11, 8))
    speed = Column(DECIMAL(8, 2))
    heading = Column(Integer)
    accuracy = Column(DECIMAL(5, 2))
    is_geofenced = Column(Boolean, default=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)