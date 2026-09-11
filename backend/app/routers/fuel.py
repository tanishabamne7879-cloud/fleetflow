# backend/app/routers/fuel.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.user import RoleEnum
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.user import User
from app.core.deps import get_current_active_user, role_required
from app.schemas.fuel_record import FuelRecordCreate, FuelRecordUpdate, FuelRecordOut
from app.crud.fuel_record import (
    get_fuel_record_by_id, get_fuel_records, create_fuel_record,
    update_fuel_record, delete_fuel_record, get_fuel_statistics
)

router = APIRouter()

# Create Fuel Record
@router.post("/", response_model=FuelRecordOut, status_code=status.HTTP_201_CREATED)
def create_new_fuel_record(
    record_data: FuelRecordCreate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    # Verify vehicle exists
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == record_data.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Verify driver exists if provided
    if record_data.driver_id:
        driver = db.query(Driver).filter(Driver.driver_id == record_data.driver_id).first()
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
    
    record_dict = record_data.dict()
    record_dict['recorded_by'] = current_user.user_id
    
    record = create_fuel_record(db, record_dict)
    
    # Add vehicle registration
    record.vehicle_registration = vehicle.registration_number
    
    return record

# Get All Fuel Records
@router.get("/", response_model=List[FuelRecordOut])
def get_all_fuel_records(
    vehicle_id: Optional[str] = None,
    driver_id: Optional[str] = None,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    records = get_fuel_records(db, vehicle_id, driver_id, start_date, end_date, skip, limit)
    
    result = []
    for record in records:
        # Get vehicle registration
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == record.vehicle_id).first()
        if vehicle:
            record.vehicle_registration = vehicle.registration_number
        
        # Get driver name
        if record.driver_id:
            driver = db.query(Driver).filter(Driver.driver_id == record.driver_id).first()
            if driver:
                user = db.query(User).filter(User.user_id == driver.user_id).first()
                if user:
                    record.driver_name = user.full_name
        
        # Get recorded by name
        if record.recorded_by:
            user = db.query(User).filter(User.user_id == record.recorded_by).first()
            if user:
                record.recorded_by_name = user.full_name
        
        result.append(record)
    
    return result

# Get Fuel Record Detail
@router.get("/{fuel_id}", response_model=FuelRecordOut)
def get_fuel_record_detail(
    fuel_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    record = get_fuel_record_by_id(db, fuel_id)
    if not record:
        raise HTTPException(status_code=404, detail="Fuel record not found")
    
    # Get vehicle registration
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == record.vehicle_id).first()
    if vehicle:
        record.vehicle_registration = vehicle.registration_number
    
    # Get driver name
    if record.driver_id:
        driver = db.query(Driver).filter(Driver.driver_id == record.driver_id).first()
        if driver:
            user = db.query(User).filter(User.user_id == driver.user_id).first()
            if user:
                record.driver_name = user.full_name
    
    return record

# Update Fuel Record
@router.put("/{fuel_id}", response_model=FuelRecordOut)
def update_fuel_record_details(
    fuel_id: str,
    record_data: FuelRecordUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    record = get_fuel_record_by_id(db, fuel_id)
    if not record:
        raise HTTPException(status_code=404, detail="Fuel record not found")
    
    update_dict = record_data.dict(exclude_unset=True)
    updated_record = update_fuel_record(db, fuel_id, update_dict)
    
    return updated_record

# Delete Fuel Record
@router.delete("/{fuel_id}")
def delete_fuel_record_endpoint(
    fuel_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin]))
):
    success = delete_fuel_record(db, fuel_id)
    if not success:
        raise HTTPException(status_code=404, detail="Fuel record not found")
    return {"message": "Fuel record deleted successfully"}

# Get Fuel Statistics
@router.get("/statistics/summary")
def get_fuel_summary(
    vehicle_id: Optional[str] = None,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    stats = get_fuel_statistics(db, vehicle_id, start_date, end_date)
    return stats