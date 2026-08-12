from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.vehicle import Vehicle, VehicleStatusEnum, VehicleTypeEnum
from app.models.user import RoleEnum
from app.models.driver import Driver
from app.core.deps import get_current_active_user, role_required
from app.schemas.vehicle import (
    VehicleCreate, VehicleUpdate, VehicleOut, 
    VehicleListOut, VehicleStatusUpdate
)
from app.crud.vehicle import (
    get_vehicle_by_id, get_vehicle_by_registration, get_vehicles,
    get_vehicles_count, get_vehicle_status_counts, create_vehicle,
    update_vehicle, update_vehicle_status, delete_vehicle, get_driver_name
)

router = APIRouter()

# ============= TEST ROUTE =============
@router.get("/test")
def test_vehicle_route():
    return {"message": "Vehicle route is working!"}

# ============= CREATE VEHICLE =============
@router.post("/", response_model=VehicleOut, status_code=status.HTTP_201_CREATED)
def create_new_vehicle(
    vehicle_data: VehicleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    """Create a new vehicle (Admin/FleetManager only)"""
    print(f"🚗 Creating vehicle: {vehicle_data.registration_number}")
    
    # Check if registration number exists
    existing = get_vehicle_by_registration(db, vehicle_data.registration_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration number {vehicle_data.registration_number} already exists"
        )
    
    # Check if driver exists if assigned
    if vehicle_data.assigned_driver_id:
        driver = db.query(Driver).filter(
            Driver.driver_id == vehicle_data.assigned_driver_id
        ).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
    
    # Create vehicle
    try:
        vehicle = create_vehicle(db, vehicle_data.dict())
        print(f"✅ Vehicle created: {vehicle.vehicle_id}")
    except Exception as e:
        print(f"❌ Error creating vehicle: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating vehicle: {str(e)}"
        )
    
    # Get driver name for response
    driver_name = None
    if vehicle.assigned_driver_id:
        driver_name = get_driver_name(db, vehicle.assigned_driver_id)
    
    # Prepare response
    response = VehicleOut(**vehicle.__dict__)
    response.driver_name = driver_name
    
    return response

# ============= GET ALL VEHICLES =============
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
    """Get all vehicles with filters"""
    print(f"📋 Getting vehicles: status={status}, type={vehicle_type}, search={search}")
    
    # First, fix any vehicles with empty status
    db.query(Vehicle).filter(
        (Vehicle.status == '') | (Vehicle.status == None)
    ).update({"status": VehicleStatusEnum.Available})
    db.commit()
    
    vehicles = get_vehicles(db, status, vehicle_type, search, skip, limit)
    
    # Add driver names
    result = []
    for vehicle in vehicles:
        # Fix empty status
        if vehicle.status is None or vehicle.status == '':
            vehicle.status = VehicleStatusEnum.Available
        
        driver_name = None
        if vehicle.assigned_driver_id:
            driver_name = get_driver_name(db, vehicle.assigned_driver_id)
        
        try:
            vehicle_out = VehicleListOut(**vehicle.__dict__)
            vehicle_out.driver_name = driver_name
            result.append(vehicle_out)
        except Exception as e:
            print(f"Error converting vehicle {vehicle.vehicle_id}: {e}")
            # Create a manual response
            result.append({
                "vehicle_id": vehicle.vehicle_id,
                "registration_number": vehicle.registration_number,
                "vehicle_type": vehicle.vehicle_type,
                "status": "Available",
                "driver_name": driver_name
            })
    
    return result
# ============= VEHICLE STATS =============
@router.get("/stats")
def get_vehicle_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get vehicle statistics"""
    counts = get_vehicle_status_counts(db)
    return counts

# ============= STATUS OPTIONS =============
@router.get("/status/options")
def get_status_options():
    """Get all available vehicle status options"""
    return {"statuses": [status.value for status in VehicleStatusEnum]}

# ============= TYPE OPTIONS =============
@router.get("/type/options")
def get_type_options():
    """Get all available vehicle type options"""
    return {"types": [type.value for type in VehicleTypeEnum]}

# ============= GET SINGLE VEHICLE =============
@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get vehicle by ID"""
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Get driver name
    driver_name = None
    if vehicle.assigned_driver_id:
        driver_name = get_driver_name(db, vehicle.assigned_driver_id)
    
    response = VehicleOut(**vehicle.__dict__)
    response.driver_name = driver_name
    
    return response

# ============= UPDATE VEHICLE =============
@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle_details(
    vehicle_id: str,
    vehicle_data: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    """Update vehicle details (Admin/FleetManager only)"""
    # Check if vehicle exists
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Check registration number uniqueness
    if vehicle_data.registration_number:
        existing = get_vehicle_by_registration(db, vehicle_data.registration_number)
        if existing and existing.vehicle_id != vehicle_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration number already exists"
            )
    
    # Check if driver exists if assigned
    if vehicle_data.assigned_driver_id:
        driver = db.query(Driver).filter(
            Driver.driver_id == vehicle_data.assigned_driver_id
        ).first()
        if not driver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )
    
    # Update vehicle
    update_dict = vehicle_data.dict(exclude_unset=True)
    updated_vehicle = update_vehicle(db, vehicle_id, update_dict)
    
    # Get driver name for response
    driver_name = None
    if updated_vehicle.assigned_driver_id:
        driver_name = get_driver_name(db, updated_vehicle.assigned_driver_id)
    
    response = VehicleOut(**updated_vehicle.__dict__)
    response.driver_name = driver_name
    
    return response

# ============= UPDATE STATUS =============
@router.patch("/{vehicle_id}/status", response_model=VehicleOut)
def update_vehicle_status_endpoint(
    vehicle_id: str,
    status_data: VehicleStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager, RoleEnum.Dispatcher]))
):
    """Update vehicle status"""
    # First get the vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Fix empty status before update
    if vehicle.status is None or vehicle.status == '':
        vehicle.status = VehicleStatusEnum.Available
    
    # Update status
    vehicle.status = status_data.status
    db.commit()
    db.refresh(vehicle)
    
    # Get driver name for response
    driver_name = None
    if vehicle.assigned_driver_id:
        driver_name = get_driver_name(db, vehicle.assigned_driver_id)
    
    try:
        response = VehicleOut(**vehicle.__dict__)
        response.driver_name = driver_name
        return response
    except Exception as e:
        print(f"Error creating response: {e}")
        # Return a simple response
        return {
            "vehicle_id": vehicle.vehicle_id,
            "registration_number": vehicle.registration_number,
            "status": vehicle.status.value if hasattr(vehicle.status, 'value') else vehicle.status,
            "message": "Status updated successfully"
        }

# ============= DELETE VEHICLE =============
@router.delete("/{vehicle_id}")
def delete_vehicle_endpoint(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin]))
):
    """Delete vehicle (Admin only)"""
    success = delete_vehicle(db, vehicle_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    return {"message": "Vehicle deleted successfully"}