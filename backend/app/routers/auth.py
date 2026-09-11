# backend/app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, Token, OTPRequest, OTPVerify
from app.core.security import (
    create_access_token, verify_password, hash_password,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.core.deps import get_current_user
from app.services.otp_service import OTPService
from app.services.email_service import send_otp_email, send_welcome_email
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password=hashed_password,
        phone=user_data.phone,
        role=user_data.role,
        address=user_data.address
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Send welcome email
    try:
        send_welcome_email(user.email, user.full_name)
        logger.info(f"✅ Welcome email sent to {user.email}")
    except Exception as e:
        logger.error(f"❌ Failed to send welcome email: {e}")
    
    return user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user and return JWT token"""
    logger.info(f"Login attempt for: {form_data.username}")
    
    # Find user
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        logger.warning(f"User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    try:
        password_valid = verify_password(form_data.password, user.password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication error",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not password_valid:
        logger.warning(f"Invalid password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        logger.warning(f"Inactive user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    logger.info(f"✅ Login successful for: {form_data.username}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value
        }
    }

@router.get("/me", response_model=UserOut)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user info"""
    return current_user

@router.post("/send-otp")
def send_otp(
    request: OTPRequest,
    db: Session = Depends(get_db)
):
    """Send OTP to user email"""
    # Check if user exists
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate OTP
    otp_service = OTPService(db)
    otp_code = otp_service.generate_otp(request.email)
    
    return {"message": "OTP sent successfully"}

@router.post("/verify-otp")
def verify_otp(
    request: OTPVerify,
    db: Session = Depends(get_db)
):
    """Verify OTP"""
    otp_service = OTPService(db)
    is_valid = otp_service.verify_otp(request.email, request.otp_code)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Mark user as verified
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        user.is_verified = True
        db.commit()
    
    return {"message": "OTP verified successfully"}

@router.post("/resend-otp")
def resend_otp(
    request: OTPRequest,
    db: Session = Depends(get_db)
):
    """Resend OTP to user email"""
    # Check if user exists
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Resend OTP
    otp_service = OTPService(db)
    otp_code = otp_service.resend_otp(request.email)
    
    return {"message": "OTP resent successfully"}