import uuid
import enum
from sqlalchemy import Column, ForeignKey, String, Float, DateTime, Enum, Text
from sqlalchemy.dialects.mysql import CHAR, DECIMAL
from datetime import datetime
from app.database import Base

class MaintenanceStatusEnum(str, enum.Enum):
    Scheduled = "Scheduled"
    InProgress = "In Progress"
    Completed = "Completed"
    Cancelled = "Cancelled"

class VehicleMaintenance(Base):
    __tablename__ = "vehicle_maintenance"
    
    maintenance_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(CHAR(36), ForeignKey("vehicles.vehicle_id"))
    maintenance_type = Column(String(50))
    description = Column(Text)
    scheduled_date = Column(DateTime)
    completed_date = Column(DateTime)
    cost = Column(DECIMAL(12, 2))
    status = Column(Enum(MaintenanceStatusEnum), default=MaintenanceStatusEnum.Scheduled)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)