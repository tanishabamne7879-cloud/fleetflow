from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.maintenance import VehicleMaintenance, MaintenanceStatusEnum
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.models.driver import Driver
from app.models.user import User, RoleEnum
from app.core.deps import get_current_active_user, role_required
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceOut, MaintenanceStatusUpdate
from app.crud.maintenance import (
    get_maintenance_by_id, get_maintenance_records, create_maintenance,
    update_maintenance, update_maintenance_status, delete_maintenance
)

router = APIRouter()

# ✅ ADMIN & FLEET MANAGER can create maintenance
@router.post("/", response_model=MaintenanceOut, status_code=status.HTTP_201_CREATED)
def create_new_maintenance(
    maintenance_data: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == maintenance_data.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    maintenance_dict = maintenance_data.dict()
    maintenance_dict['created_by'] = current_user.user_id
    
    maintenance = create_maintenance(db, maintenance_dict)
    
    # Update vehicle status
    vehicle.status = VehicleStatusEnum.Maintenance
    vehicle.last_maintenance_date = maintenance_data.scheduled_date
    db.commit()
    
    maintenance.vehicle_registration = vehicle.registration_number
    return maintenance


# ✅ ALL ROLES can view maintenance
@router.get("/", response_model=List[MaintenanceOut])
def get_all_maintenance(
    status: Optional[MaintenanceStatusEnum] = None,
    vehicle_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    maintenances = get_maintenance_records(db, status, vehicle_id, skip, limit)
    
    result = []
    for record in maintenances:
        # Fix empty status
        if record.status is None or record.status == '':
            record.status = MaintenanceStatusEnum.Scheduled
            db.commit()
            db.refresh(record)
        
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == record.vehicle_id).first()
        if vehicle:
            record.vehicle_registration = vehicle.registration_number
        result.append(record)
    
    return result


# ✅ ALL ROLES can view maintenance details
@router.get("/{maintenance_id}", response_model=MaintenanceOut)
def get_maintenance_detail(
    maintenance_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    maintenance = get_maintenance_by_id(db, maintenance_id)
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    # Fix empty status
    if maintenance.status is None or maintenance.status == '':
        maintenance.status = MaintenanceStatusEnum.Scheduled
        db.commit()
        db.refresh(maintenance)
    
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == maintenance.vehicle_id).first()
    if vehicle:
        maintenance.vehicle_registration = vehicle.registration_number
    
    return maintenance


# ✅ ✅ ✅ NEW: PUT endpoint for full maintenance update (FIXES 405 ERROR)
@router.put("/{maintenance_id}", response_model=MaintenanceOut)
def update_maintenance_details(
    maintenance_id: str,
    maintenance_data: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    """Update maintenance record completely (PUT)"""
    maintenance = get_maintenance_by_id(db, maintenance_id)
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    update_dict = maintenance_data.dict(exclude_unset=True)
    updated_maintenance = update_maintenance(db, maintenance_id, update_dict)
    
    # If vehicle changed, update registration
    if updated_maintenance.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == updated_maintenance.vehicle_id).first()
        if vehicle:
            updated_maintenance.vehicle_registration = vehicle.registration_number
    
    return updated_maintenance


# ✅ PATCH endpoint for status update only
@router.patch("/{maintenance_id}/status")
def update_maintenance_status_endpoint(
    maintenance_id: str,
    status_data: MaintenanceStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    maintenance = update_maintenance_status(db, maintenance_id, status_data.status)
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    # Update vehicle status when completed
    if status_data.status == MaintenanceStatusEnum.Completed:
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == maintenance.vehicle_id).first()
        if vehicle:
            vehicle.status = VehicleStatusEnum.Available
            vehicle.next_maintenance_date = None
            db.commit()
    
    # Handle status value safely
    if hasattr(maintenance.status, 'value'):
        status_value = maintenance.status.value
    else:
        status_value = maintenance.status
    
    return {
        "message": f"Status updated to {status_value}",
        "maintenance_id": maintenance.maintenance_id,
        "status": status_value
    }


# ✅ ADMIN only can delete maintenance
@router.delete("/{maintenance_id}")
def delete_maintenance_endpoint(
    maintenance_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin]))
):
    success = delete_maintenance(db, maintenance_id)
    if not success:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return {"message": "Maintenance record deleted"}