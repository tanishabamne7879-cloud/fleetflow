from sqlalchemy.orm import Session
from app.models.driver import Driver
from app.models.user import User
from typing import Optional, List

def get_driver_by_id(db: Session, driver_id: str) -> Optional[Driver]:
    return db.query(Driver).filter(Driver.driver_id == driver_id).first()

def get_driver_by_user_id(db: Session, user_id: str) -> Optional[Driver]:
    return db.query(Driver).filter(Driver.user_id == user_id).first()

def get_drivers(
    db: Session,
    is_available: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Driver]:
    query = db.query(Driver)
    if is_available is not None:
        query = query.filter(Driver.is_available == is_available)
    return query.offset(skip).limit(limit).all()

def create_driver(db: Session, driver_data: dict) -> Driver:
    driver = Driver(**driver_data)
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

def update_driver(db: Session, driver_id: str, update_data: dict) -> Optional[Driver]:
    driver = get_driver_by_id(db, driver_id)
    if not driver:
        return None
    
    for key, value in update_data.items():
        if value is not None:
            setattr(driver, key, value)
    
    db.commit()
    db.refresh(driver)
    return driver

def update_driver_availability(db: Session, driver_id: str, is_available: bool) -> Optional[Driver]:
    driver = get_driver_by_id(db, driver_id)
    if not driver:
        return None
    
    driver.is_available = is_available
    db.commit()
    db.refresh(driver)
    return driver

def delete_driver(db: Session, driver_id: str) -> bool:
    driver = get_driver_by_id(db, driver_id)
    if not driver:
        return False
    
    db.delete(driver)
    db.commit()
    return True