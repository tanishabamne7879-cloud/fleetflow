# backend/app/models/fuel_record.py

import uuid
from sqlalchemy import Column, String, DateTime, DECIMAL, ForeignKey, Integer, Text, Enum
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class FuelTypeEnum(str, enum.Enum):
    Diesel = "Diesel"
    Petrol = "Petrol"
    CNG = "CNG"
    Electric = "Electric"

class FuelRecord(Base):
    __tablename__ = "fuel_records"
    
    fuel_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(CHAR(36), ForeignKey("vehicles.vehicle_id"), nullable=False)
    driver_id = Column(CHAR(36), ForeignKey("drivers.driver_id"), nullable=True)  # ✅ NULL allowed
    
    fuel_type = Column(Enum(FuelTypeEnum), default=FuelTypeEnum.Diesel)
    fuel_amount_liters = Column(DECIMAL(10, 2), nullable=False)
    fuel_cost = Column(DECIMAL(12, 2), nullable=False)
    cost_per_liter = Column(DECIMAL(10, 2), nullable=False)
    
    odometer_reading = Column(DECIMAL(10, 2), nullable=True)
    trip_distance = Column(DECIMAL(10, 2), nullable=True)
    mileage = Column(DECIMAL(8, 2), nullable=True)
    
    refueling_station = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    
    receipt_number = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    
    recorded_by = Column(CHAR(36), ForeignKey("users.user_id"), nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    vehicle = relationship("Vehicle", backref="fuel_records")
    driver = relationship("Driver", backref="fuel_records")
    user = relationship("User", backref="fuel_records")