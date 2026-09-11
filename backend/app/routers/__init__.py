from .auth import router as auth_router
from .vehicle import router as vehicle_router
from .shipment import router as shipment_router
from .trip import router as trip_router
from .drivers import router as driver_router
from .maintenance import router as maintenance_router
from .analytics import router as analytics_router
from .tracking import router as tracking_router
from .users import router as users_router  # ✅ ADDED


__all__ = [
    'auth_router',
    'vehicle_router',
    'shipment_router',
    'trip_router',
    'driver_router',
    'maintenance_router',
    'analytics_router',
    'tracking_router',
    'users_router'  # ✅ ADDED
]
# backend/app/routers/__init__.py

from .fuel import router as fuel_router  # ✅ ADD THIS
from .reports import router as reports_router  # ✅ ADD THIS