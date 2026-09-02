from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings
import bcrypt
import re

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# ✅ Password context with multiple schemes
pwd_context = CryptContext(
    schemes=["bcrypt", "sha256_crypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    try:
        # Truncate if needed (bcrypt limit is 72 bytes)
        if len(password.encode('utf-8')) > 72:
            password = password[:72]
        return pwd_context.hash(password, scheme="bcrypt")
    except Exception as e:
        print(f"Password hashing error: {e}")
        # Fallback: use bcrypt directly
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    try:
        # ✅ Handle bcrypt hash format
        if hashed_password.startswith('$2b$') or hashed_password.startswith('$2a$') or hashed_password.startswith('$2y$'):
            try:
                # Use bcrypt directly
                return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
            except Exception as e:
                print(f"Bcrypt verification error: {e}")
                # Try passlib as fallback
                try:
                    return pwd_context.verify(plain_password, hashed_password)
                except:
                    return False
        
        # ✅ Use passlib for other formats
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except:
            return False
            
    except Exception as e:
        print(f"Password verification error: {e}")
        return False


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None