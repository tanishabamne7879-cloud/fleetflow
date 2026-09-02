from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
from app.database import get_db
from app.models.user import User, RoleEnum
from app.core.security import decode_token
from app.crud.user import get_user_by_email
from typing import List

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception
        
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
        user = get_user_by_email(db, email)
        if user is None:
            raise credentials_exception
        
        return user
    except JWTError:
        raise credentials_exception


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def role_required(allowed_roles: List[RoleEnum]):
    """Check if user has required role"""
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role {current_user.role.value} not allowed. Required: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker