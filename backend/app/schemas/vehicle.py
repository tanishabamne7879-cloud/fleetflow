from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from app.models.vehicle import VehicleStatusEnum, VehicleTypeEnum, FuelTypeEnum

class VehicleCreate(BaseModel):
    registration_number: str = Field(..., min_length=3, max_length=20)
    vehicle_type: VehicleTypeEnum = VehicleTypeEnum.Truck
    brand: Optional[str] = Field(None, max_length=50)
    model: Optional[str] = Field(None, max_length=50)
    manufacture_year: Optional[int] = Field(None, ge=1900, le=datetime.now().year + 1)
    fuel_type: Optional[FuelTypeEnum] = None
    capacity_kg: Optional[float] = Field(None, ge=0)
    assigned_driver_id: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[VehicleStatusEnum] = VehicleStatusEnum.Available

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = Field(None, min_length=3, max_length=20)
    vehicle_type: Optional[VehicleTypeEnum] = None
    brand: Optional[str] = Field(None, max_length=50)
    model: Optional[str] = Field(None, max_length=50)
    manufacture_year: Optional[int] = Field(None, ge=1900, le=datetime.now().year + 1)
    fuel_type: Optional[FuelTypeEnum] = None
    capacity_kg: Optional[float] = Field(None, ge=0)
    status: Optional[VehicleStatusEnum] = None
    assigned_driver_id: Optional[str] = None
    notes: Optional[str] = None

class VehicleStatusUpdate(BaseModel):
    status: VehicleStatusEnum

class VehicleOut(BaseModel):
    vehicle_id: str
    registration_number: str
    vehicle_type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    manufacture_year: Optional[int] = None
    fuel_type: Optional[str] = None
    capacity_kg: Optional[float] = None
    status: VehicleStatusEnum
    assigned_driver_id: Optional[str] = None
    driver_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class VehicleListOut(BaseModel):
    vehicle_id: str
    registration_number: str
    vehicle_type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    status: VehicleStatusEnum
    assigned_driver_id: Optional[str] = None
    driver_name: Optional[str] = None
    
    class Config:
        from_attributes = True