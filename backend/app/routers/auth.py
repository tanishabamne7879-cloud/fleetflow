from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserOut, Token, OTPRequest, OTPVerify, UserUpdate
from app.crud.user import get_user_by_email, create_user, update_user_verification, update_user
from app.core.security import verify_password, create_access_token, hash_password
from app.core.deps import get_current_active_user
from app.models.user import User
from app.services.otp_service import OTPService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/signup", response_model=UserOut)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create user with hashed password
        user = create_user(
            db,
            email=user_in.email,
            password=user_in.password,
            full_name=user_in.full_name,
            phone=user_in.phone,
            role=user_in.role.value
        )
        
        # Send OTP
        OTPService.create_and_send_otp(db, user.email)
        
        return user
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


@router.post("/send-otp")
def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not registered"
        )
    
    success = OTPService.create_and_send_otp(db, request.email)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP"
        )
    
    return {"message": "OTP sent successfully"}


@router.post("/verify-otp")
def verify_otp(request: OTPVerify, db: Session = Depends(get_db)):
    is_valid = OTPService.verify_otp(db, request.email, request.otp_code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    update_user_verification(db, request.email)
    return {"message": "OTP verified successfully"}


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Get user by email
    user = get_user_by_email(db, form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # ✅ Try to verify password
    password_verified = False
    
    try:
        # Method 1: Normal verification
        if verify_password(form_data.password, user.password):
            password_verified = True
    except Exception as e1:
        logger.warning(f"Password verification method 1 failed: {e1}")
    
    if not password_verified:
        # ✅ Method 2: Try re-hashing (for old passwords)
        try:
            # Check if password matches after re-hashing
            new_hash = hash_password(form_data.password)
            # Don't compare hashes, try direct bcrypt check
            if user.password.startswith('$2b$') or user.password.startswith('$2a$') or user.password.startswith('$2y$'):
                if bcrypt.checkpw(form_data.password.encode('utf-8'), user.password.encode('utf-8')):
                    password_verified = True
        except Exception as e2:
            logger.warning(f"Password verification method 2 failed: {e2}")
    
    if not password_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if user is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your OTP."
        )
    
    # Create access token
    token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def get_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_current_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    update_dict = update_data.dict(exclude_unset=True)
    updated_user = update_user(db, current_user.user_id, update_dict)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user