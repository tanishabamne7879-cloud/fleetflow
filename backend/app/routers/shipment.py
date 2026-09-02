from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.shipment import Shipment, ShipmentStatusEnum
from app.models.user import User, RoleEnum
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.core.deps import get_current_active_user, role_required
from app.schemas.shipment import ShipmentCreate, ShipmentUpdate, ShipmentOut, ShipmentStatusUpdate
from app.crud.shipment import (
    get_shipment_by_id, get_shipment_by_tracking, get_shipments,
    create_shipment, update_shipment, update_shipment_status, delete_shipment
)

router = APIRouter()

# ✅ ADMIN, FLEET MANAGER, DISPATCHER can create shipments
@router.post("/", response_model=ShipmentOut, status_code=status.HTTP_201_CREATED)
def create_new_shipment(
    shipment_data: ShipmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager, RoleEnum.Dispatcher]))
):
    existing = get_shipment_by_tracking(db, shipment_data.tracking_number)
    if existing:
        raise HTTPException(status_code=400, detail="Tracking number already exists")
    
    shipment_dict = shipment_data.dict()
    if 'status' not in shipment_dict or not shipment_dict['status']:
        shipment_dict['status'] = ShipmentStatusEnum.Created
    
    shipment = create_shipment(db, shipment_dict)
    return shipment

# ✅ ALL ROLES can view shipments (Driver sees only own)
@router.get("/", response_model=List[ShipmentOut])
def get_all_shipments(
    status: Optional[ShipmentStatusEnum] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    shipments = get_shipments(db, status, None, None, None, skip, limit)
    
    result = []
    for shipment in shipments:
        # ✅ FIX: Ensure status is never empty
        if shipment.status is None or shipment.status == '':
            shipment.status = ShipmentStatusEnum.Created
            db.commit()
            db.refresh(shipment)
        
        if shipment.vehicle_id:
            vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == shipment.vehicle_id).first()
            if vehicle:
                shipment.vehicle_registration = vehicle.registration_number
        
        if shipment.driver_id:
            driver = db.query(Driver).filter(Driver.driver_id == shipment.driver_id).first()
            if driver:
                user = db.query(User).filter(User.user_id == driver.user_id).first()
                if user:
                    shipment.driver_name = user.full_name
        
        result.append(shipment)
    
    return result

# ✅ ALL ROLES can view shipment details (Driver sees only own)
@router.get("/{shipment_id}", response_model=ShipmentOut)
def get_shipment_detail(
    shipment_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    shipment = get_shipment_by_id(db, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    # ✅ Driver can view only their shipments
    if current_user.role == RoleEnum.Driver:
        driver = db.query(Driver).filter(Driver.user_id == current_user.user_id).first()
        if not driver or shipment.driver_id != driver.driver_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your assigned shipments"
            )
    
    if shipment.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == shipment.vehicle_id).first()
        if vehicle:
            shipment.vehicle_registration = vehicle.registration_number
    
    if shipment.driver_id:
        driver = db.query(Driver).filter(Driver.driver_id == shipment.driver_id).first()
        if driver:
            user = db.query(User).filter(User.user_id == driver.user_id).first()
            if user:
                shipment.driver_name = user.full_name
    
    return shipment

# ✅ ADMIN, FLEET MANAGER, DISPATCHER can update shipments
@router.put("/{shipment_id}", response_model=ShipmentOut)
def update_shipment_details(
    shipment_id: str,
    shipment_data: ShipmentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager, RoleEnum.Dispatcher]))
):
    shipment = get_shipment_by_id(db, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    update_dict = shipment_data.dict(exclude_unset=True)
    updated_shipment = update_shipment(db, shipment_id, update_dict)
    
    # ✅ FIX: Ensure status is never empty
    if updated_shipment.status is None or updated_shipment.status == '':
        updated_shipment.status = ShipmentStatusEnum.Created
        db.commit()
        db.refresh(updated_shipment)
    
    if updated_shipment.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == updated_shipment.vehicle_id).first()
        if vehicle:
            updated_shipment.vehicle_registration = vehicle.registration_number
    
    if updated_shipment.driver_id:
        driver = db.query(Driver).filter(Driver.driver_id == updated_shipment.driver_id).first()
        if driver:
            user = db.query(User).filter(User.user_id == driver.user_id).first()
            if user:
                updated_shipment.driver_name = user.full_name
    
    return updated_shipment

# ✅ ALL ROLES can update status (Drivers can update their own)
@router.patch("/{shipment_id}/status")
def update_shipment_status_endpoint(
    shipment_id: str,
    status_data: ShipmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    shipment = get_shipment_by_id(db, shipment_id)
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    updated_shipment = update_shipment_status(db, shipment_id, status_data.status)
    
    # ✅ FIX: Handle status value safely
    if hasattr(updated_shipment.status, 'value'):
        status_value = updated_shipment.status.value
    else:
        status_value = updated_shipment.status
    
    return {
        "message": f"Status updated to {status_value}",
        "shipment_id": updated_shipment.shipment_id,
        "tracking_number": updated_shipment.tracking_number,
        "status": status_value
    }

# ✅ ADMIN only can delete shipments
@router.delete("/{shipment_id}")
def delete_shipment_endpoint(
    shipment_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin]))
):
    success = delete_shipment(db, shipment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return {"message": "Shipment cancelled successfully"}