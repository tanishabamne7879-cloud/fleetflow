import uuid
import enum
from sqlalchemy import Column, ForeignKey, String, DateTime, Enum, DECIMAL, Text
from sqlalchemy.dialects.mysql import CHAR
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
    completed_date = Column(DateTime, nullable=True)
    cost = Column(DECIMAL(12, 2), default=0)
    status = Column(Enum(MaintenanceStatusEnum), default=MaintenanceStatusEnum.Scheduled)
    notes = Column(Text, nullable=True)
    created_by = Column(CHAR(36), ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)