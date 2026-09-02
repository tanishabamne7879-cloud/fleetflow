from sqlalchemy.orm import Session
from app.models.user import User, RoleEnum
from app.core.security import hash_password
from typing import Optional
import uuid

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.user_id == user_id).first()

def create_user(
    db: Session,
    email: str,
    password: str,
    full_name: str,
    phone: str = None,
    role: str = "Driver"
) -> User:
    # ✅ Hash password before saving
    hashed_password = hash_password(password)
    
    user = User(
        user_id=str(uuid.uuid4()),
        email=email,
        password=hashed_password,
        full_name=full_name,
        phone=phone,
        role=RoleEnum(role),
        is_verified=False  # Will be verified via OTP
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user_id: str, update_data: dict) -> Optional[User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    for key, value in update_data.items():
        if key == "password" and value:
            value = hash_password(value)
        if value is not None:
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

def update_user_verification(db: Session, email: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if user:
        user.is_verified = True
        db.commit()
        db.refresh(user)
    return user

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def delete_user(db: Session, user_id: str) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    db.delete(user)
    db.commit()
    return True