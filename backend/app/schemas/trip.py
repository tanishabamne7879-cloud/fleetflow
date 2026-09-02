from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.trip import TripStatusEnum, RouteTypeEnum

class TripCreate(BaseModel):
    vehicle_id: str
    driver_id: str
    shipment_id: str
    start_location: str
    destination: str
    route_type: RouteTypeEnum = RouteTypeEnum.Fastest

class TripUpdate(BaseModel):
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    shipment_id: Optional[str] = None
    start_location: Optional[str] = None
    destination: Optional[str] = None
    status: Optional[TripStatusEnum] = None
    route_type: Optional[RouteTypeEnum] = None
    route_data: Optional[Dict[str, Any]] = None

class TripStatusUpdate(BaseModel):
    status: TripStatusEnum

class TripOut(BaseModel):
    trip_id: str
    vehicle_id: str
    driver_id: str
    shipment_id: str
    start_location: Optional[str] = None
    destination: Optional[str] = None
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None
    dest_lat: Optional[float] = None
    dest_lng: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    distance_km: Optional[float] = None
    duration_min: Optional[int] = None
    route_type: RouteTypeEnum = RouteTypeEnum.Fastest
    route_data: Optional[Dict[str, Any]] = None
    status: TripStatusEnum = TripStatusEnum.Scheduled
    actual_distance: Optional[float] = None
    actual_duration: Optional[int] = None
    vehicle_registration: Optional[str] = None
    driver_name: Optional[str] = None
    tracking_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class RouteOption(BaseModel):
    type: str
    distance_km: float
    duration_min: int
    route_data: Dict[str, Any]