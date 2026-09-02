import json
from typing import Optional, Any
from app.config import settings

class RedisService:
    def __init__(self):
        self.redis_client = None
        self.available = False
        self.mock_store = {}  # In-memory fallback
        
        try:
            import redis
            if settings.REDIS_URL:
                self.redis_client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=3  # Short timeout
                )
                self.redis_client.ping()
                self.available = True
                print("✅ Redis connected successfully")
            else:
                print("⚠️ Redis URL not configured. Using in-memory cache.")
        except ImportError:
            print("⚠️ redis module not installed. Using in-memory cache.")
            self.available = False
        except Exception as e:
            print(f"⚠️ Redis connection failed: {e}")
            print("⚠️ Using in-memory cache.")
            self.available = False
    
    def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """Store value in Redis with expiration"""
        if self.available and self.redis_client:
            try:
                self.redis_client.setex(
                    key,
                    expire,
                    json.dumps(value) if not isinstance(value, str) else value
                )
                return True
            except Exception as e:
                print(f"Redis set error: {e}")
                return False
        else:
            # In-memory fallback
            self.mock_store[key] = {
                'value': value,
                'expire': expire
            }
            return True
    
    def get(self, key: str) -> Optional[Any]:
        """Retrieve value from Redis"""
        if self.available and self.redis_client:
            try:
                value = self.redis_client.get(key)
                if value:
                    try:
                        return json.loads(value)
                    except json.JSONDecodeError:
                        return value
                return None
            except Exception as e:
                print(f"Redis get error: {e}")
                return None
        else:
            # In-memory fallback
            if key in self.mock_store:
                return self.mock_store[key]['value']
            return None
    
    def delete(self, key: str) -> bool:
        """Delete key from Redis"""
        if self.available and self.redis_client:
            try:
                self.redis_client.delete(key)
                return True
            except Exception as e:
                print(f"Redis delete error: {e}")
                return False
        else:
            if key in self.mock_store:
                del self.mock_store[key]
            return True

# Singleton instance
redis_service = RedisService()