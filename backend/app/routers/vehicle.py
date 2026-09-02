from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.vehicle import Vehicle, VehicleStatusEnum, VehicleTypeEnum
from app.models.user import RoleEnum
from app.models.driver import Driver
from app.core.deps import get_current_active_user, role_required
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut, VehicleListOut, VehicleStatusUpdate
from app.crud.vehicle import (
    get_vehicle_by_id, get_vehicle_by_registration, get_vehicles,
    get_vehicle_status_counts, create_vehicle,
    update_vehicle, update_vehicle_status, delete_vehicle, get_driver_name
)

router = APIRouter()

# ✅ ADMIN & FLEET MANAGER can create vehicles
@router.post("/", response_model=VehicleOut, status_code=status.HTTP_201_CREATED)
def create_new_vehicle(
    vehicle_data: VehicleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    existing = get_vehicle_by_registration(db, vehicle_data.registration_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration number {vehicle_data.registration_number} already exists"
        )
    
    if vehicle_data.assigned_driver_id:
        driver = db.query(Driver).filter(
            Driver.driver_id == vehicle_data.assigned_driver_id
        ).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
    
    vehicle_dict = vehicle_data.dict()
    if 'status' not in vehicle_dict or not vehicle_dict['status']:
        vehicle_dict['status'] = VehicleStatusEnum.Available
    
    vehicle = create_vehicle(db, vehicle_dict)
    
    driver_name = None
    if vehicle.assigned_driver_id:
        driver_name = get_driver_name(db, vehicle.assigned_driver_id)
    
    response = VehicleOut(**vehicle.__dict__)
    response.driver_name = driver_name
    return response

# ✅ ALL ROLES can view vehicles (but Driver sees only own vehicle)
@router.get("/", response_model=List[VehicleListOut])
def get_all_vehicles(
    status: Optional[VehicleStatusEnum] = None,
    vehicle_type: Optional[VehicleTypeEnum] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    vehicles = get_vehicles(db, status, vehicle_type, search, skip, limit)
    
    result = []
    for vehicle in vehicles:
        # ✅ FIX: Get driver_id from Driver model
        if current_user.role == RoleEnum.Driver:
            driver = db.query(Driver).filter(Driver.user_id == current_user.user_id).first()
            if not driver or vehicle.assigned_driver_id != driver.driver_id:
                continue
        
        driver_name = None
        if vehicle.assigned_driver_id:
            driver_name = get_driver_name(db, vehicle.assigned_driver_id)
        
        vehicle_out = VehicleListOut(**vehicle.__dict__)
        vehicle_out.driver_name = driver_name
        result.append(vehicle_out)
    
    return result

# ✅ ALL ROLES can view stats (Driver sees only their own)
@router.get("/stats")
def get_vehicle_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    counts = get_vehicle_status_counts(db)
    
    # ✅ Driver sees only their own vehicle status
    if current_user.role == RoleEnum.Driver:
        driver = db.query(Driver).filter(Driver.user_id == current_user.user_id).first()
        if driver:
            vehicle = db.query(Vehicle).filter(Vehicle.assigned_driver_id == driver.driver_id).first()
            if vehicle:
                return {
                    "total": 1,
                    vehicle.status.value: 1
                }
        return {"total": 0}
    
    return counts

# ✅ ALL ROLES can view vehicle details (Driver sees only own)
@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # ✅ Driver can view only their assigned vehicle
    if current_user.role == RoleEnum.Driver:
        driver = db.query(Driver).filter(Driver.user_id == current_user.user_id).first()
        if not driver or vehicle.assigned_driver_id != driver.driver_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your assigned vehicle"
            )
    
    driver_name = None
    if vehicle.assigned_driver_id:
        driver_name = get_driver_name(db, vehicle.assigned_driver_id)
    
    response = VehicleOut(**vehicle.__dict__)
    response.driver_name = driver_name
    return response

# ✅ ADMIN & FLEET MANAGER can update vehicles
@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle_details(
    vehicle_id: str,
    vehicle_data: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # ✅ FIX: Ensure status is never empty
    if vehicle.status is None or vehicle.status == '':
        vehicle.status = VehicleStatusEnum.Available
        db.commit()
        db.refresh(vehicle)
    
    update_dict = vehicle_data.dict(exclude_unset=True)
    updated_vehicle = update_vehicle(db, vehicle_id, update_dict)
    
    # ✅ FIX: Ensure status is never empty after update
    if updated_vehicle.status is None or updated_vehicle.status == '':
        updated_vehicle.status = VehicleStatusEnum.Available
        db.commit()
        db.refresh(updated_vehicle)
    
    driver_name = None
    if updated_vehicle.assigned_driver_id:
        driver_name = get_driver_name(db, updated_vehicle.assigned_driver_id)
    
    response = VehicleOut(**updated_vehicle.__dict__)
    response.driver_name = driver_name
    return response


# ✅ ADMIN, FLEET MANAGER, DISPATCHER can update status
@router.patch("/{vehicle_id}/status")
def update_vehicle_status_endpoint(
    vehicle_id: str,
    status_data: VehicleStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager, RoleEnum.Dispatcher]))
):
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle.status = status_data.status
    db.commit()
    db.refresh(vehicle)
    
    # ✅ FIX: Handle status value safely
    if hasattr(vehicle.status, 'value'):
        status_value = vehicle.status.value
    else:
        status_value = vehicle.status
    
    return {
        "vehicle_id": vehicle.vehicle_id,
        "registration_number": vehicle.registration_number,
        "status": status_value,
    }

# ✅ ADMIN only can delete vehicles
@router.delete("/{vehicle_id}")
def delete_vehicle_endpoint(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin]))
):
    success = delete_vehicle(db, vehicle_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    return {"message": "Vehicle deleted successfully"}