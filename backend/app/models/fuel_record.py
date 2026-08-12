import uuid
from sqlalchemy import Column, ForeignKey, Float, DateTime
from sqlalchemy.dialects.mysql import CHAR, DECIMAL
from datetime import datetime
from app.database import Base

class FuelRecord(Base):
    __tablename__ = "fuel_records"
    
    fuel_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(CHAR(36), ForeignKey("vehicles.vehicle_id"))
    fuel_amount = Column(DECIMAL(10, 2))
    fuel_cost = Column(DECIMAL(12, 2))
    odometer_reading = Column(DECIMAL(10, 2))
    recorded_at = Column(DateTime, default=datetime.utcnow)