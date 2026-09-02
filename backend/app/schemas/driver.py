from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class DriverCreate(BaseModel):
    user_id: str
    license_number: Optional[str] = None
    license_expiry: Optional[date] = None
    experience_years: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    hire_date: Optional[date] = None

class DriverUpdate(BaseModel):
    license_number: Optional[str] = None
    license_expiry: Optional[date] = None
    experience_years: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    hire_date: Optional[date] = None
    is_available: Optional[bool] = None

class DriverStatusUpdate(BaseModel):
    is_available: bool

class DriverOut(BaseModel):
    driver_id: str
    user_id: str
    license_number: Optional[str] = None
    license_expiry: Optional[date] = None
    experience_years: Optional[str] = None
    is_available: bool
    address: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    hire_date: Optional[date] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    assigned_vehicle: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True