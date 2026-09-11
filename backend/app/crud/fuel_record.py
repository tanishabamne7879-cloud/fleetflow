# backend/app/crud/fuel_record.py

from sqlalchemy.orm import Session
from app.models.fuel_record import FuelRecord
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.user import User
from typing import Optional, List
from datetime import datetime, timedelta

def get_fuel_record_by_id(db: Session, fuel_id: str) -> Optional[FuelRecord]:
    return db.query(FuelRecord).filter(FuelRecord.fuel_id == fuel_id).first()

def get_fuel_records(
    db: Session,
    vehicle_id: Optional[str] = None,
    driver_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100
) -> List[FuelRecord]:
    query = db.query(FuelRecord)
    
    if vehicle_id:
        query = query.filter(FuelRecord.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(FuelRecord.driver_id == driver_id)
    if start_date:
        query = query.filter(FuelRecord.recorded_at >= start_date)
    if end_date:
        query = query.filter(FuelRecord.recorded_at <= end_date)
    
    return query.order_by(FuelRecord.recorded_at.desc()).offset(skip).limit(limit).all()

def create_fuel_record(db: Session, record_data: dict) -> FuelRecord:
    # Calculate mileage if trip_distance and fuel_amount provided
    if record_data.get('trip_distance') and record_data.get('fuel_amount_liters'):
        record_data['mileage'] = record_data['trip_distance'] / record_data['fuel_amount_liters']
    
    record = FuelRecord(**record_data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def update_fuel_record(db: Session, fuel_id: str, update_data: dict) -> Optional[FuelRecord]:
    record = get_fuel_record_by_id(db, fuel_id)
    if not record:
        return None
    
    for key, value in update_data.items():
        if value is not None:
            setattr(record, key, value)
    
    # Recalculate mileage if needed
    if record.trip_distance and record.fuel_amount_liters:
        record.mileage = record.trip_distance / record.fuel_amount_liters
    
    db.commit()
    db.refresh(record)
    return record

def delete_fuel_record(db: Session, fuel_id: str) -> bool:
    record = get_fuel_record_by_id(db, fuel_id)
    if not record:
        return False
    
    db.delete(record)
    db.commit()
    return True

def get_fuel_statistics(
    db: Session,
    vehicle_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> dict:
    query = db.query(FuelRecord)
    
    if vehicle_id:
        query = query.filter(FuelRecord.vehicle_id == vehicle_id)
    if start_date:
        query = query.filter(FuelRecord.recorded_at >= start_date)
    if end_date:
        query = query.filter(FuelRecord.recorded_at <= end_date)
    
    records = query.all()
    
    if not records:
        return {
            'total_fuel_used': 0,
            'total_cost': 0,
            'average_mileage': 0,
            'total_trips': 0,
            'total_distance': 0,
            'records_count': 0
        }
    
    total_fuel = sum(float(r.fuel_amount_liters) for r in records)
    total_cost = sum(float(r.fuel_cost) for r in records)
    total_distance = sum(float(r.trip_distance or 0) for r in records)
    avg_mileage = total_distance / total_fuel if total_fuel > 0 else 0
    
    return {
        'total_fuel_used': float(total_fuel),
        'total_cost': float(total_cost),
        'average_mileage': float(avg_mileage),
        'total_trips': len(records),
        'total_distance': float(total_distance),
        'records_count': len(records)
    }