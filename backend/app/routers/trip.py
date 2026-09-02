from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.trip import Trip, TripStatusEnum, RouteTypeEnum
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.models.driver import Driver, DriverStatusEnum
from app.models.shipment import Shipment, ShipmentStatusEnum
from app.models.user import User, RoleEnum
from app.core.deps import get_current_active_user, role_required
from app.schemas.trip import TripCreate, TripUpdate, TripOut, TripStatusUpdate
from app.crud.trip import (
    get_trip_by_id, get_trips, create_trip, update_trip, update_trip_status, delete_trip
)
from app.services.route_service import RouteService

router = APIRouter()

# ✅ ADMIN, FLEET MANAGER, DISPATCHER can create trips
@router.post("/", response_model=TripOut, status_code=status.HTTP_201_CREATED)
async def create_new_trip(
    trip_data: TripCreate,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager, RoleEnum.Dispatcher]))
):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == trip_data.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    driver = db.query(Driver).filter(Driver.driver_id == trip_data.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    shipment = db.query(Shipment).filter(Shipment.shipment_id == trip_data.shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    trip_dict = trip_data.dict()
    trip = create_trip(db, trip_dict)
    
    # Update vehicle status
    vehicle.status = VehicleStatusEnum.Assigned
    vehicle.assigned_driver_id = trip_data.driver_id
    db.commit()
    
    # Update shipment status
    shipment.status = ShipmentStatusEnum.Assigned
    shipment.vehicle_id = trip_data.vehicle_id
    shipment.driver_id = trip_data.driver_id
    db.commit()
    
    # Update driver status
    driver.is_available = False
    db.commit()
    
    return trip

# ✅ ALL ROLES can view trips (Driver sees only own)
@router.get("/", response_model=List[TripOut])
def get_all_trips(
    status: Optional[TripStatusEnum] = None,
    vehicle_id: Optional[str] = None,
    driver_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    trips = get_trips(db, status, vehicle_id, driver_id, None, skip, limit)
    
    result = []
    for trip in trips:
        # ✅ Driver sees only their trips
        if current_user.role == RoleEnum.Driver:
            driver = db.query(Driver).filter(Driver.user_id == current_user.user_id).first()
            if not driver or trip.driver_id != driver.driver_id:
                continue
        
        if trip.vehicle_id:
            vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == trip.vehicle_id).first()
            if vehicle:
                trip.vehicle_registration = vehicle.registration_number
        
        if trip.driver_id:
            driver = db.query(Driver).filter(Driver.driver_id == trip.driver_id).first()
            if driver:
                user = db.query(User).filter(User.user_id == driver.user_id).first()
                if user:
                    trip.driver_name = user.full_name
        
        if trip.shipment_id:
            shipment = db.query(Shipment).filter(Shipment.shipment_id == trip.shipment_id).first()
            if shipment:
                trip.tracking_number = shipment.tracking_number
        
        result.append(trip)
    
    return result

# ✅ ALL ROLES can view trip details (Driver sees only own)
@router.get("/{trip_id}", response_model=TripOut)
def get_trip_detail(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    trip = get_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # ✅ Driver can view only their trips
    if current_user.role == RoleEnum.Driver:
        driver = db.query(Driver).filter(Driver.user_id == current_user.user_id).first()
        if not driver or trip.driver_id != driver.driver_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your assigned trips"
            )
    
    if trip.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == trip.vehicle_id).first()
        if vehicle:
            trip.vehicle_registration = vehicle.registration_number
    
    if trip.driver_id:
        driver = db.query(Driver).filter(Driver.driver_id == trip.driver_id).first()
        if driver:
            user = db.query(User).filter(User.user_id == driver.user_id).first()
            if user:
                trip.driver_name = user.full_name
    
    if trip.shipment_id:
        shipment = db.query(Shipment).filter(Shipment.shipment_id == trip.shipment_id).first()
        if shipment:
            trip.tracking_number = shipment.tracking_number
    
    return trip

# ✅ ADMIN, FLEET MANAGER, DISPATCHER can start trips
@router.patch("/{trip_id}/start")
def start_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager, RoleEnum.Dispatcher]))
):
    trip = get_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip.status != TripStatusEnum.Scheduled:
        raise HTTPException(status_code=400, detail="Trip cannot be started")
    
    trip.status = TripStatusEnum.InTransit
    trip.start_time = datetime.utcnow()
    
    # Update vehicle status
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == trip.vehicle_id).first()
    if vehicle:
        vehicle.status = VehicleStatusEnum.InTransit
    
    # Update shipment status
    shipment = db.query(Shipment).filter(Shipment.shipment_id == trip.shipment_id).first()
    if shipment:
        shipment.status = ShipmentStatusEnum.InTransit
    
    db.commit()
    db.refresh(trip)
    return {"message": "Trip started", "trip_id": trip.trip_id}

# ✅ DRIVERS can end their own trips
@router.patch("/{trip_id}/end")
def end_trip(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    trip = get_trip_by_id(db, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    if trip.status != TripStatusEnum.InTransit:
        raise HTTPException(status_code=400, detail="Trip is not in transit")
    
    # ✅ Driver can end only their trips
    if current_user.role == RoleEnum.Driver:
        driver = db.query(Driver).filter(Driver.user_id == current_user.user_id).first()
        if not driver or trip.driver_id != driver.driver_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only end your assigned trips"
            )
    
    trip.status = TripStatusEnum.Completed
    trip.end_time = datetime.utcnow()
    trip.actual_distance = trip.distance_km
    trip.actual_duration = trip.duration_min
    
    # Update vehicle status
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == trip.vehicle_id).first()
    if vehicle:
        vehicle.status = VehicleStatusEnum.Available
        vehicle.assigned_driver_id = None
    
    # Update shipment status
    shipment = db.query(Shipment).filter(Shipment.shipment_id == trip.shipment_id).first()
    if shipment:
        shipment.status = ShipmentStatusEnum.Delivered
        shipment.actual_delivery = datetime.utcnow()
    
    # Update driver status
    driver = db.query(Driver).filter(Driver.driver_id == trip.driver_id).first()
    if driver:
        driver.is_available = True
    
    db.commit()
    db.refresh(trip)
    return {"message": "Trip completed", "trip_id": trip.trip_id}

# ✅ ADMIN only can delete trips
@router.delete("/{trip_id}")
def delete_trip_endpoint(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin]))
):
    success = delete_trip(db, trip_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Trip deleted successfully"}