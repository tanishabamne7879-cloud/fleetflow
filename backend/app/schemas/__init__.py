from app.schemas.user import UserCreate, UserUpdate, UserOut, Token, TokenData, OTPRequest, OTPVerify
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut, VehicleListOut, VehicleStatusUpdate
from app.schemas.shipment import ShipmentCreate, ShipmentUpdate, ShipmentOut, ShipmentStatusUpdate
from app.schemas.trip import TripCreate, TripUpdate, TripOut, TripStatusUpdate, RouteOption
from app.schemas.driver import DriverCreate, DriverUpdate, DriverOut, DriverStatusUpdate
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceOut, MaintenanceStatusUpdate
from app.schemas.gps import GPSLocation, GPSHistory