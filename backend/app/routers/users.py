from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.user import UserOut
from app.crud.user import get_all_users, get_user_by_id
from app.core.deps import get_current_active_user, role_required

router = APIRouter()

@router.get("/", response_model=List[UserOut])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    """Get all users (Admin and FleetManager only)"""
    return get_all_users(db, skip, limit)

@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get user by ID"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Users can view their own profile, Admin/FleetManager can view any
    if current_user.role not in [RoleEnum.Admin, RoleEnum.FleetManager] and current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this user")
    
    return user