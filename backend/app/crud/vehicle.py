from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.models.driver import Driver
from app.models.user import User
from typing import Optional, List, Dict, Any
from uuid import UUID

def get_vehicle_by_id(db: Session, vehicle_id: str) -> Optional[Vehicle]:
    """Get vehicle by ID"""
    return db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()

def get_vehicle_by_registration(db: Session, registration_number: str) -> Optional[Vehicle]:
    """Get vehicle by registration number"""
    return db.query(Vehicle).filter(
        Vehicle.registration_number == registration_number.upper().strip()
    ).first()

def get_vehicles(
    db: Session,
    status: Optional[VehicleStatusEnum] = None,
    vehicle_type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Vehicle]:
    """Get vehicles with filters"""
    query = db.query(Vehicle)
    
    if status:
        query = query.filter(Vehicle.status == status)
    
    if vehicle_type:
        query = query.filter(Vehicle.vehicle_type == vehicle_type)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Vehicle.registration_number.like(search_term),
                Vehicle.brand.like(search_term),
                Vehicle.model.like(search_term)
            )
        )
    
    # Ensure we only get vehicles with valid status
    valid_statuses = [s.value for s in VehicleStatusEnum]
    query = query.filter(Vehicle.status.in_(valid_statuses))
    
    return query.offset(skip).limit(limit).all()

def get_vehicles_count(
    db: Session,
    status: Optional[VehicleStatusEnum] = None,
    vehicle_type: Optional[str] = None,
    search: Optional[str] = None
) -> int:
    """Get count of vehicles with filters"""
    query = db.query(Vehicle)
    
    if status:
        query = query.filter(Vehicle.status == status)
    
    if vehicle_type:
        query = query.filter(Vehicle.vehicle_type == vehicle_type)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Vehicle.registration_number.like(search_term),
                Vehicle.brand.like(search_term),
                Vehicle.model.like(search_term)
            )
        )
    
    return query.count()

def get_vehicle_status_counts(db: Session) -> Dict[str, int]:
    """Get counts of vehicles by status"""
    counts = {}
    for status in VehicleStatusEnum:
        count = db.query(Vehicle).filter(Vehicle.status == status).count()
        counts[status.value] = count
    counts['total'] = sum(counts.values())
    return counts

def create_vehicle(db: Session, vehicle_data: Dict[str, Any]) -> Vehicle:
    """Create a new vehicle"""
    vehicle = Vehicle(**vehicle_data)
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

def update_vehicle(db: Session, vehicle_id: str, update_data: Dict[str, Any]) -> Optional[Vehicle]:
    """Update vehicle details"""
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        return None
    
    for key, value in update_data.items():
        if value is not None:
            setattr(vehicle, key, value)
    
    db.commit()
    db.refresh(vehicle)
    return vehicle

def update_vehicle_status(db: Session, vehicle_id: str, status: VehicleStatusEnum) -> Optional[Vehicle]:
    """Update vehicle status"""
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        return None
    
    vehicle.status = status
    db.commit()
    db.refresh(vehicle)
    return vehicle

def delete_vehicle(db: Session, vehicle_id: str) -> bool:
    """Delete a vehicle"""
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        return False
    
    db.delete(vehicle)
    db.commit()
    return True

def get_driver_name(db: Session, driver_id: str) -> Optional[str]:
    """Get driver name from driver_id"""
    driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    if driver:
        user = db.query(User).filter(User.user_id == driver.user_id).first()
        if user:
            return user.full_name
    return None


def fix_vehicle_status(db: Session, vehicle_id: str) -> Optional[Vehicle]:
    """Fix empty status for a vehicle"""
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if vehicle and (vehicle.status is None or vehicle.status == ''):
        vehicle.status = VehicleStatusEnum.Available
        db.commit()
        db.refresh(vehicle)
    return vehicle

def fix_all_vehicle_statuses(db: Session) -> int:
    """Fix all vehicles with empty status"""
    vehicles = db.query(Vehicle).filter(
        (Vehicle.status == '') | (Vehicle.status == None)
    ).all()
    
    count = 0
    for vehicle in vehicles:
        vehicle.status = VehicleStatusEnum.Available
        count += 1
    
    if count > 0:
        db.commit()
    
    return count