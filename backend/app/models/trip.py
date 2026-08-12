import uuid
import enum
from sqlalchemy import Column, ForeignKey, String, Float, DateTime, Enum, JSON, DECIMAL
from sqlalchemy.dialects.mysql import CHAR
from datetime import datetime
from app.database import Base

class TripStatusEnum(str, enum.Enum):
    Scheduled = "Scheduled"
    InTransit = "In Transit"
    Completed = "Completed"
    Cancelled = "Cancelled"

class Trip(Base):
    __tablename__ = "trips"
    
    trip_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(CHAR(36), ForeignKey("vehicles.vehicle_id"))
    driver_id = Column(CHAR(36), ForeignKey("drivers.driver_id"))
    shipment_id = Column(CHAR(36), ForeignKey("shipments.shipment_id"))
    start_location = Column(String(200))
    destination = Column(String(200))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    distance_km = Column(DECIMAL(10, 2))
    status = Column(Enum(TripStatusEnum), default=TripStatusEnum.Scheduled)
    route_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)