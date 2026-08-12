from sqlalchemy.orm import Session
from app.models.user import User
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
    user = User(
        user_id=str(uuid.uuid4()),
        email=email,
        password=hash_password(password),
        full_name=full_name,
        phone=phone,
        role=role
    )
    db.add(user)
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