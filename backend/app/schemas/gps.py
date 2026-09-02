from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GPSLocation(BaseModel):
    vehicle_id: str
    latitude: float
    longitude: float
    speed: Optional[float] = 0
    heading: Optional[int] = 0
    accuracy: Optional[float] = 10.0
    timestamp: Optional[datetime] = None

class GPSHistory(BaseModel):
    vehicle_id: str
    locations: list
    start_time: datetime
    end_time: datetime