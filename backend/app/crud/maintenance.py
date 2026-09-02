from sqlalchemy.orm import Session
from app.models.maintenance import VehicleMaintenance, MaintenanceStatusEnum
from typing import Optional, List
from datetime import datetime

def get_maintenance_by_id(db: Session, maintenance_id: str) -> Optional[VehicleMaintenance]:
    return db.query(VehicleMaintenance).filter(VehicleMaintenance.maintenance_id == maintenance_id).first()

def get_maintenance_records(
    db: Session,
    status: Optional[MaintenanceStatusEnum] = None,
    vehicle_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[VehicleMaintenance]:
    query = db.query(VehicleMaintenance)
    
    if status:
        query = query.filter(VehicleMaintenance.status == status)
    if vehicle_id:
        query = query.filter(VehicleMaintenance.vehicle_id == vehicle_id)
    
    return query.offset(skip).limit(limit).all()

def create_maintenance(db: Session, maintenance_data: dict) -> VehicleMaintenance:
    # Ensure status is set
    if 'status' not in maintenance_data or maintenance_data['status'] is None:
        maintenance_data['status'] = MaintenanceStatusEnum.Scheduled
    
    maintenance = VehicleMaintenance(**maintenance_data)
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    return maintenance

# ✅ ✅ ✅ NEW: Full update function for PUT endpoint
def update_maintenance(db: Session, maintenance_id: str, update_data: dict) -> Optional[VehicleMaintenance]:
    """Update all fields of a maintenance record"""
    maintenance = get_maintenance_by_id(db, maintenance_id)
    if not maintenance:
        return None
    
    for key, value in update_data.items():
        if value is not None:
            setattr(maintenance, key, value)
    
    db.commit()
    db.refresh(maintenance)
    return maintenance

def update_maintenance_status(db: Session, maintenance_id: str, status: MaintenanceStatusEnum) -> Optional[VehicleMaintenance]:
    maintenance = get_maintenance_by_id(db, maintenance_id)
    if not maintenance:
        return None
    
    maintenance.status = status
    if status == MaintenanceStatusEnum.Completed:
        maintenance.completed_date = datetime.utcnow()
    
    db.commit()
    db.refresh(maintenance)
    return maintenance

def delete_maintenance(db: Session, maintenance_id: str) -> bool:
    maintenance = get_maintenance_by_id(db, maintenance_id)
    if not maintenance:
        return False
    
    db.delete(maintenance)
    db.commit()
    return True