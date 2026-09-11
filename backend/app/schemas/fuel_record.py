# backend/app/schemas/fuel_record.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.fuel_record import FuelTypeEnum

class FuelRecordCreate(BaseModel):
    vehicle_id: str
    driver_id: Optional[str] = None  # ✅ Optional
    fuel_type: FuelTypeEnum = FuelTypeEnum.Diesel
    fuel_amount_liters: float = Field(..., gt=0)
    fuel_cost: float = Field(..., gt=0)
    cost_per_liter: float = Field(..., gt=0)
    odometer_reading: Optional[float] = None
    trip_distance: Optional[float] = None
    mileage: Optional[float] = None
    refueling_station: Optional[str] = None
    location: Optional[str] = None
    receipt_number: Optional[str] = None
    notes: Optional[str] = None

class FuelRecordUpdate(BaseModel):
    fuel_type: Optional[FuelTypeEnum] = None
    fuel_amount_liters: Optional[float] = None
    fuel_cost: Optional[float] = None
    cost_per_liter: Optional[float] = None
    odometer_reading: Optional[float] = None
    trip_distance: Optional[float] = None
    mileage: Optional[float] = None
    refueling_station: Optional[str] = None
    location: Optional[str] = None
    receipt_number: Optional[str] = None
    notes: Optional[str] = None

class FuelRecordOut(BaseModel):
    fuel_id: str
    vehicle_id: str
    driver_id: Optional[str]  # ✅ Optional
    fuel_type: FuelTypeEnum
    fuel_amount_liters: float
    fuel_cost: float
    cost_per_liter: float
    odometer_reading: Optional[float]
    trip_distance: Optional[float]
    mileage: Optional[float]
    refueling_station: Optional[str]
    location: Optional[str]
    receipt_number: Optional[str]
    notes: Optional[str]
    recorded_by: Optional[str]
    recorded_at: datetime
    updated_at: datetime
    
    # Additional fields
    vehicle_registration: Optional[str] = None
    driver_name: Optional[str] = None
    recorded_by_name: Optional[str] = None
    
    class Config:
        from_attributes = True
        use_enum_values = True