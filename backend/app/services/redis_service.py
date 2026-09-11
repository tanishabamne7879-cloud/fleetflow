# backend/app/services/redis_service.py

import os
import redis
import json
import logging
from functools import wraps

logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.client = None
        self._connect()

    def _connect(self):
        try:
            self.client = redis.from_url(
                self.redis_url, 
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            self.client.ping()
            logger.info("✅ Redis connected successfully")
        except Exception as e:
            logger.warning(f"⚠️ Redis connection failed: {e}")
            self.client = None

    def get(self, key):
        if not self.client:
            return None
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Redis get error: {e}")
            return None

    def set(self, key, value, expire=3600):
        if not self.client:
            return None
        try:
            self.client.setex(key, expire, json.dumps(value))
            return True
        except Exception as e:
            logger.error(f"Redis set error: {e}")
            return False

    def delete(self, key):
        if not self.client:
            return None
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis delete error: {e}")
            return False

    def exists(self, key):
        if not self.client:
            return False
        try:
            return self.client.exists(key) > 0
        except Exception as e:
            logger.error(f"Redis exists error: {e}")
            return False

    def expire(self, key, seconds):
        if not self.client:
            return False
        try:
            return self.client.expire(key, seconds)
        except Exception as e:
            logger.error(f"Redis expire error: {e}")
            return False

    def incr(self, key):
        if not self.client:
            return None
        try:
            return self.client.incr(key)
        except Exception as e:
            logger.error(f"Redis incr error: {e}")
            return None

    def decr(self, key):
        if not self.client:
            return None
        try:
            return self.client.decr(key)
        except Exception as e:
            logger.error(f"Redis decr error: {e}")
            return None

    def cache_result(self, key, expire=3600):
        """Decorator to cache function results"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                cache_key = f"{key}:{str(args)}:{str(kwargs)}"
                cached = self.get(cache_key)
                if cached is not None:
                    logger.info(f"✅ Cache hit: {cache_key}")
                    return cached
                
                result = func(*args, **kwargs)
                if result is not None:
                    self.set(cache_key, result, expire)
                    logger.info(f"✅ Cache set: {cache_key}")
                return result
            return wrapper
        return decorator

    def clear_pattern(self, pattern):
        """Clear all keys matching pattern"""
        if not self.client:
            return False
        try:
            keys = self.client.keys(pattern)
            if keys:
                self.client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Redis clear pattern error: {e}")
            return False

redis_service = RedisService()