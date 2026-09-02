from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.shipment import ShipmentStatusEnum

class ShipmentCreate(BaseModel):
    tracking_number: str = Field(..., min_length=3, max_length=50)
    source: str = Field(..., min_length=2)
    destination: str = Field(..., min_length=2)
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    shipment_weight: Optional[float] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    expected_delivery: Optional[datetime] = None
    notes: Optional[str] = None

class ShipmentUpdate(BaseModel):
    tracking_number: Optional[str] = None
    source: Optional[str] = None
    destination: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    shipment_weight: Optional[float] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    status: Optional[ShipmentStatusEnum] = None
    expected_delivery: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        use_enum_values = True  # ✅ ADDED

class ShipmentStatusUpdate(BaseModel):
    status: ShipmentStatusEnum

class ShipmentOut(BaseModel):
    shipment_id: str
    tracking_number: str
    source: str
    destination: str
    customer_name: Optional[str]
    customer_phone: Optional[str]
    shipment_weight: Optional[float]
    vehicle_id: Optional[str]
    driver_id: Optional[str]
    status: ShipmentStatusEnum
    expected_delivery: Optional[datetime]
    actual_delivery: Optional[datetime]
    notes: Optional[str]
    vehicle_registration: Optional[str] = None
    driver_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        use_enum_values = True  # ✅ ADDED