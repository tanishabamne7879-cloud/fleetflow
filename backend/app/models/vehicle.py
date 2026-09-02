import uuid
import enum
from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, DECIMAL, Text
from sqlalchemy.dialects.mysql import CHAR
from datetime import datetime
from app.database import Base

class VehicleStatusEnum(str, enum.Enum):
    Available = "Available"
    Assigned = "Assigned"
    Maintenance = "Maintenance"
    InTransit = "InTransit"  # ✅ FIX: No space

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
    vehicle_type = Column(Enum(VehicleTypeEnum), nullable=False, default=VehicleTypeEnum.Truck)
    brand = Column(String(50), nullable=True)
    model = Column(String(50), nullable=True)
    manufacture_year = Column(Integer, nullable=True)
    fuel_type = Column(Enum(FuelTypeEnum), nullable=True)
    capacity_kg = Column(DECIMAL(10, 2), nullable=True)
    status = Column(Enum(VehicleStatusEnum), default=VehicleStatusEnum.Available, nullable=False)
    assigned_driver_id = Column(CHAR(36), ForeignKey("drivers.driver_id"), nullable=True)
    last_maintenance_date = Column(DateTime, nullable=True)
    next_maintenance_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)