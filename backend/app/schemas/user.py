from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import RoleEnum

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    role: RoleEnum = RoleEnum.Driver

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None

class UserOut(BaseModel):
    user_id: str
    email: EmailStr
    full_name: str
    phone: Optional[str]
    role: RoleEnum
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[RoleEnum] = None

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp_code: str