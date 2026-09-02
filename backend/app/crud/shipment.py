from sqlalchemy.orm import Session
from app.models.shipment import Shipment, ShipmentStatusEnum
from typing import Optional, List
from datetime import datetime

def get_shipment_by_id(db: Session, shipment_id: str) -> Optional[Shipment]:
    return db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()

def get_shipment_by_tracking(db: Session, tracking_number: str) -> Optional[Shipment]:
    return db.query(Shipment).filter(Shipment.tracking_number == tracking_number).first()

def get_shipments(
    db: Session,
    status: Optional[ShipmentStatusEnum] = None,
    vehicle_id: Optional[str] = None,
    driver_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Shipment]:
    query = db.query(Shipment)
    
    if status:
        query = query.filter(Shipment.status == status)
    if vehicle_id:
        query = query.filter(Shipment.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(Shipment.driver_id == driver_id)
    if search:
        query = query.filter(
            (Shipment.tracking_number.contains(search)) |
            (Shipment.source.contains(search)) |
            (Shipment.destination.contains(search)) |
            (Shipment.customer_name.contains(search))
        )
    
    return query.offset(skip).limit(limit).all()

def create_shipment(db: Session, shipment_data: dict) -> Shipment:
    if 'status' not in shipment_data or not shipment_data['status']:
        shipment_data['status'] = ShipmentStatusEnum.Created
    shipment = Shipment(**shipment_data)
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return shipment

def update_shipment(db: Session, shipment_id: str, update_data: dict) -> Optional[Shipment]:
    shipment = get_shipment_by_id(db, shipment_id)
    if not shipment:
        return None
    
    for key, value in update_data.items():
        if value is not None:
            setattr(shipment, key, value)
    
    db.commit()
    db.refresh(shipment)
    return shipment

def update_shipment_status(
    db: Session, 
    shipment_id: str, 
    status: ShipmentStatusEnum
) -> Optional[Shipment]:
    shipment = get_shipment_by_id(db, shipment_id)
    if not shipment:
        return None
    
    shipment.status = status
    if status == ShipmentStatusEnum.Delivered:
        shipment.actual_delivery = datetime.utcnow()
    
    db.commit()
    db.refresh(shipment)
    return shipment

def delete_shipment(db: Session, shipment_id: str) -> bool:
    shipment = get_shipment_by_id(db, shipment_id)
    if not shipment:
        return False
    
    shipment.status = ShipmentStatusEnum.Cancelled
    db.commit()
    return True