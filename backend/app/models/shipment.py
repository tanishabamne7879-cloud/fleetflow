import uuid
import enum
from sqlalchemy import Column, ForeignKey, String, Float, DateTime, Enum, Text, DECIMAL
from sqlalchemy.dialects.mysql import CHAR
from datetime import datetime
from app.database import Base

class ShipmentStatusEnum(str, enum.Enum):
    Created = "Created"
    Assigned = "Assigned"
    InTransit = "In Transit"
    Delayed = "Delayed"
    Delivered = "Delivered"
    Cancelled = "Cancelled"

class Shipment(Base):
    __tablename__ = "shipments"
    
    shipment_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tracking_number = Column(String(50), unique=True, nullable=False, index=True)
    source = Column(String(200), nullable=False)
    destination = Column(String(200), nullable=False)
    customer_name = Column(String(100))
    customer_phone = Column(String(15))
    shipment_weight = Column(DECIMAL(10, 2))
    vehicle_id = Column(CHAR(36), ForeignKey("vehicles.vehicle_id"), nullable=True)
    driver_id = Column(CHAR(36), ForeignKey("drivers.driver_id"), nullable=True)
    status = Column(Enum(ShipmentStatusEnum), default=ShipmentStatusEnum.Created)
    expected_delivery = Column(DateTime)
    actual_delivery = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)