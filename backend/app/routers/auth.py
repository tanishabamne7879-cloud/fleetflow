from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserOut, Token, OTPRequest, OTPVerify  # Add these imports
from app.crud.user import get_user_by_email, create_user, update_user_verification
from app.core.security import verify_password, create_access_token
from app.core.deps import get_current_active_user
from app.models.user import User
from app.services.otp_service import OTPService

router = APIRouter()

@router.post("/signup", response_model=UserOut)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = create_user(
        db,
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role.value if hasattr(user_in.role, 'value') else user_in.role
    )
    
    # Send OTP after signup
    OTPService.create_and_send_otp(db, user.email)
    
    return user

@router.post("/send-otp")
def send_otp(request: OTPRequest, db: Session = Depends(get_db)):
    """Send OTP to email"""
    user = get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")
    
    success = OTPService.create_and_send_otp(db, request.email)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send OTP")
    
    return {"message": "OTP sent successfully"}

@router.post("/verify-otp")
def verify_otp(request: OTPVerify, db: Session = Depends(get_db)):
    """Verify OTP code"""
    is_valid = OTPService.verify_otp(db, request.email, request.otp_code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    # Mark user as verified
    update_user_verification(db, request.email)
    
    return {"message": "OTP verified successfully"}

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please verify your OTP.")
    
    token = create_access_token(data={"sub": user.email, "role": user.role.value if hasattr(user.role, 'value') else user.role})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def get_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user