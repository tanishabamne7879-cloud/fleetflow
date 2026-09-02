from sqlalchemy.orm import Session
from app.models.trip import Trip, TripStatusEnum
from typing import Optional, List
from datetime import datetime

def get_trip_by_id(db: Session, trip_id: str) -> Optional[Trip]:
    return db.query(Trip).filter(Trip.trip_id == trip_id).first()

def get_trips(
    db: Session,
    status: Optional[TripStatusEnum] = None,
    vehicle_id: Optional[str] = None,
    driver_id: Optional[str] = None,
    shipment_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Trip]:
    query = db.query(Trip)
    
    if status:
        query = query.filter(Trip.status == status)
    if vehicle_id:
        query = query.filter(Trip.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(Trip.driver_id == driver_id)
    if shipment_id:
        query = query.filter(Trip.shipment_id == shipment_id)
    
    return query.offset(skip).limit(limit).all()

def get_active_trips(db: Session) -> List[Trip]:
    return db.query(Trip).filter(
        Trip.status.in_([TripStatusEnum.Scheduled, TripStatusEnum.InTransit])
    ).all()

def create_trip(db: Session, trip_data: dict) -> Trip:
    trip = Trip(**trip_data)
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

def update_trip(db: Session, trip_id: str, update_data: dict) -> Optional[Trip]:
    trip = get_trip_by_id(db, trip_id)
    if not trip:
        return None
    
    for key, value in update_data.items():
        if value is not None:
            setattr(trip, key, value)
    
    db.commit()
    db.refresh(trip)
    return trip

def update_trip_status(db: Session, trip_id: str, status: TripStatusEnum) -> Optional[Trip]:
    trip = get_trip_by_id(db, trip_id)
    if not trip:
        return None
    
    trip.status = status
    if status == TripStatusEnum.InTransit:
        trip.start_time = datetime.utcnow()
    elif status == TripStatusEnum.Completed:
        trip.end_time = datetime.utcnow()
    
    db.commit()
    db.refresh(trip)
    return trip

def delete_trip(db: Session, trip_id: str) -> bool:
    trip = get_trip_by_id(db, trip_id)
    if not trip:
        return False
    
    db.delete(trip)
    db.commit()
    return True