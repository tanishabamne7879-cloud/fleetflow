import uuid
import enum
from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, DECIMAL, Text
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class VehicleStatusEnum(str, enum.Enum):
    Available = "Available"
    Assigned = "Assigned"
    Maintenance = "Maintenance"
    InTransit = "In Transit"

class VehicleTypeEnum(str, enum.Enum):
    Truck = "Truck"
    Van = "Van"
    Car = "Car"
    Motorcycle = "Motorcycle"

class FuelTypeEnum(str, enum.Enum):
    Diesel = "Diesel"
    Petrol = "Petrol"
    Electric = "Electric"
    Hybrid = "Hybrid"

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    vehicle_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    registration_number = Column(String(20), unique=True, nullable=False, index=True)
    vehicle_type = Column(Enum(VehicleTypeEnum), nullable=False)
    brand = Column(String(50))
    model = Column(String(50))
    manufacture_year = Column(Integer)
    fuel_type = Column(Enum(FuelTypeEnum))
    capacity_kg = Column(DECIMAL(10, 2))
    status = Column(Enum(VehicleStatusEnum), default=VehicleStatusEnum.Available, nullable=False)
    assigned_driver_id = Column(CHAR(36), ForeignKey("drivers.driver_id"), nullable=True)
    last_maintenance_date = Column(DateTime, nullable=True)
    next_maintenance_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    driver = relationship("Driver", backref="assigned_vehicles")