from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.maintenance import MaintenanceStatusEnum

class MaintenanceCreate(BaseModel):
    vehicle_id: str
    maintenance_type: str
    description: Optional[str] = None
    scheduled_date: datetime
    cost: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None

class MaintenanceUpdate(BaseModel):
    vehicle_id: Optional[str] = None
    maintenance_type: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    cost: Optional[float] = Field(None, ge=0)
    status: Optional[MaintenanceStatusEnum] = None
    notes: Optional[str] = None

class MaintenanceStatusUpdate(BaseModel):
    status: MaintenanceStatusEnum  # ✅ Fix 1: Add this schema

class MaintenanceOut(BaseModel):
    maintenance_id: str
    vehicle_id: str
    vehicle_registration: Optional[str] = None
    maintenance_type: str
    description: Optional[str]
    scheduled_date: datetime
    completed_date: Optional[datetime]
    cost: Optional[float]
    status: MaintenanceStatusEnum
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True  # ✅ Fix 2: Use enum values in response