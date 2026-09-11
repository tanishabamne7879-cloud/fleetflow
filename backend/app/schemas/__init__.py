# backend/app/schemas/__init__.py

from app.schemas.user import UserCreate, UserUpdate, UserOut, Token, TokenData, OTPRequest, OTPVerify
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut
from app.schemas.driver import DriverCreate, DriverUpdate, DriverOut
from app.schemas.shipment import ShipmentCreate, ShipmentUpdate, ShipmentOut, ShipmentStatusUpdate
from app.schemas.trip import TripCreate, TripUpdate, TripOut
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceOut, MaintenanceStatusUpdate
from app.schemas.gps import GPSLocation, GPSHistory
from app.schemas.fuel_record import FuelRecordCreate, FuelRecordUpdate, FuelRecordOut  # ✅ ADD THIS