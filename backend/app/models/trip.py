import uuid
import enum
from sqlalchemy import Column, ForeignKey, String, DateTime, Enum, JSON, DECIMAL, Integer
from sqlalchemy.dialects.mysql import CHAR
from datetime import datetime
from app.database import Base

class TripStatusEnum(str, enum.Enum):
    Scheduled = "Scheduled"
    InTransit = "In Transit"
    Completed = "Completed"
    Cancelled = "Cancelled"

class RouteTypeEnum(str, enum.Enum):
    Shortest = "Shortest"
    Fastest = "Fastest"
    TrafficAvoidance = "Traffic Avoidance"
    FuelEfficient = "Fuel Efficient"

class Trip(Base):
    __tablename__ = "trips"
    
    trip_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(CHAR(36), ForeignKey("vehicles.vehicle_id"))
    driver_id = Column(CHAR(36), ForeignKey("drivers.driver_id"))
    shipment_id = Column(CHAR(36), ForeignKey("shipments.shipment_id"))
    
    start_location = Column(String(200))
    destination = Column(String(200))
    start_lat = Column(DECIMAL(10, 8), nullable=True)
    start_lng = Column(DECIMAL(11, 8), nullable=True)
    dest_lat = Column(DECIMAL(10, 8), nullable=True)
    dest_lng = Column(DECIMAL(11, 8), nullable=True)
    
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    
    distance_km = Column(DECIMAL(10, 2), nullable=True)
    duration_min = Column(Integer, nullable=True)
    route_type = Column(String(50), default="Fastest")
    route_data = Column(JSON, nullable=True)
    
    status = Column(Enum(TripStatusEnum), default=TripStatusEnum.Scheduled)
    
    actual_distance = Column(DECIMAL(10, 2), nullable=True)
    actual_duration = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)