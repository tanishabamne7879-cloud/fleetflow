import uuid
import enum
from sqlalchemy import Column, String, DateTime, Boolean, Enum
from sqlalchemy.dialects.mysql import CHAR
from datetime import datetime
from app.database import Base

class RoleEnum(str, enum.Enum):
    Admin = "Admin"
    FleetManager = "FleetManager"
    Driver = "Driver"
    Dispatcher = "Dispatcher"

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    phone = Column(String(15), nullable=True)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.Driver)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)