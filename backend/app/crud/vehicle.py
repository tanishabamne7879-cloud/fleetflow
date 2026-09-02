from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.models.driver import Driver
from app.models.user import User
from typing import Optional, List, Dict, Any

def get_vehicle_by_id(db: Session, vehicle_id: str) -> Optional[Vehicle]:
    return db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()

def get_vehicle_by_registration(db: Session, registration_number: str) -> Optional[Vehicle]:
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
    # Fix empty statuses
    db.query(Vehicle).filter(
        (Vehicle.status == '') | (Vehicle.status == None)
    ).update({"status": VehicleStatusEnum.Available})
    db.commit()
    
    query = db.query(Vehicle)
    query = query.filter(Vehicle.status.isnot(None))
    query = query.filter(Vehicle.status != '')
    
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
    
    return query.offset(skip).limit(limit).all()

def get_vehicle_status_counts(db: Session) -> Dict[str, int]:
    # Fix empty statuses
    db.query(Vehicle).filter(
        (Vehicle.status == '') | (Vehicle.status == None)
    ).update({"status": VehicleStatusEnum.Available})
    db.commit()
    
    counts = {}
    for status in VehicleStatusEnum:
        count = db.query(Vehicle).filter(Vehicle.status == status).count()
        counts[status.value] = count
    
    counts['total'] = sum(counts.values())
    return counts

def create_vehicle(db: Session, vehicle_data: Dict[str, Any]) -> Vehicle:
    if 'status' not in vehicle_data or not vehicle_data['status']:
        vehicle_data['status'] = VehicleStatusEnum.Available
    vehicle = Vehicle(**vehicle_data)
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

def update_vehicle(db: Session, vehicle_id: str, update_data: Dict[str, Any]) -> Optional[Vehicle]:
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        return None
    
    # Fix status if empty
    if vehicle.status is None or vehicle.status == '':
        vehicle.status = VehicleStatusEnum.Available
    
    for key, value in update_data.items():
        if value is not None:
            setattr(vehicle, key, value)
    
    db.commit()
    db.refresh(vehicle)
    return vehicle

def update_vehicle_status(db: Session, vehicle_id: str, status: VehicleStatusEnum) -> Optional[Vehicle]:
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        return None
    
    vehicle.status = status
    db.commit()
    db.refresh(vehicle)
    return vehicle

def delete_vehicle(db: Session, vehicle_id: str) -> bool:
    vehicle = get_vehicle_by_id(db, vehicle_id)
    if not vehicle:
        return False
    
    db.delete(vehicle)
    db.commit()
    return True

def get_driver_name(db: Session, driver_id: str) -> Optional[str]:
    driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    if driver:
        user = db.query(User).filter(User.user_id == driver.user_id).first()
        if user:
            return user.full_name
    return None