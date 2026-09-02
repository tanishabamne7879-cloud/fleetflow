from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models.driver import Driver
from app.models.user import User, RoleEnum
from app.models.vehicle import Vehicle
from app.core.deps import get_current_active_user, role_required
from app.schemas.driver import DriverCreate, DriverUpdate, DriverOut, DriverStatusUpdate
from app.crud.driver import (
    get_driver_by_id, get_driver_by_user_id, get_drivers,
    create_driver, update_driver, update_driver_availability, delete_driver
)

router = APIRouter()

# ✅ ADMIN & FLEET MANAGER can create drivers
@router.post("/", response_model=DriverOut, status_code=status.HTTP_201_CREATED)
def create_new_driver(
    driver_data: DriverCreate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    user = db.query(User).filter(User.user_id == driver_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = get_driver_by_user_id(db, driver_data.user_id)
    if existing:
        raise HTTPException(status_code=400, detail="User already has a driver profile")
    
    driver_dict = driver_data.dict()
    driver = create_driver(db, driver_dict)
    
    driver.full_name = user.full_name
    driver.email = user.email
    return driver

# ✅ ALL ROLES can view drivers (Driver sees only own profile)
@router.get("/", response_model=List[DriverOut])
def get_all_drivers(
    is_available: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    drivers = get_drivers(db, is_available, skip, limit)
    
    result = []
    for driver in drivers:
        # ✅ Driver sees only their own profile
        if current_user.role == RoleEnum.Driver:
            driver_user = db.query(User).filter(User.user_id == current_user.user_id).first()
            if not driver_user or driver.user_id != driver_user.user_id:
                continue
        
        user = db.query(User).filter(User.user_id == driver.user_id).first()
        if user:
            driver.full_name = user.full_name
            driver.email = user.email
        
        vehicle = db.query(Vehicle).filter(Vehicle.assigned_driver_id == driver.driver_id).first()
        if vehicle:
            driver.assigned_vehicle = vehicle.registration_number
        
        result.append(driver)
    
    return result

# ✅ ALL ROLES can view driver details (Driver sees only own)
@router.get("/{driver_id}", response_model=DriverOut)
def get_driver_detail(
    driver_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    driver = get_driver_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    # ✅ Driver can view only their own profile
    if current_user.role == RoleEnum.Driver:
        driver_user = db.query(User).filter(User.user_id == current_user.user_id).first()
        if not driver_user or driver.user_id != driver_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own profile"
            )
    
    user = db.query(User).filter(User.user_id == driver.user_id).first()
    if user:
        driver.full_name = user.full_name
        driver.email = user.email
    
    vehicle = db.query(Vehicle).filter(Vehicle.assigned_driver_id == driver.driver_id).first()
    if vehicle:
        driver.assigned_vehicle = vehicle.registration_number
    
    return driver

# ✅ ADMIN & FLEET MANAGER can update drivers
@router.put("/{driver_id}", response_model=DriverOut)
def update_driver_details(
    driver_id: str,
    driver_data: DriverUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    driver = get_driver_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    update_dict = driver_data.dict(exclude_unset=True)
    updated_driver = update_driver(db, driver_id, update_dict)
    
    user = db.query(User).filter(User.user_id == driver.user_id).first()
    if user:
        updated_driver.full_name = user.full_name
        updated_driver.email = user.email
    
    vehicle = db.query(Vehicle).filter(Vehicle.assigned_driver_id == driver.driver_id).first()
    if vehicle:
        updated_driver.assigned_vehicle = vehicle.registration_number
    
    return updated_driver

# ✅ ADMIN & FLEET MANAGER can update availability
@router.patch("/{driver_id}/availability")
def update_availability(
    driver_id: str,
    availability_data: DriverStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    driver = update_driver_availability(db, driver_id, availability_data.is_available)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    return {
        "message": f"Driver availability updated",
        "driver_id": driver.driver_id,
        "is_available": driver.is_available
    }

# ✅ ADMIN only can delete drivers
@router.delete("/{driver_id}")
def delete_driver_endpoint(
    driver_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin]))
):
    success = delete_driver(db, driver_id)
    if not success:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"message": "Driver deleted successfully"}