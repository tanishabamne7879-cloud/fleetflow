# backend/app/main.py - Add fuel and reports routers

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import (
    auth_router, vehicle_router, shipment_router, trip_router,
    driver_router, maintenance_router, analytics_router, tracking_router,
    users_router
)
from app.routers.fuel import router as fuel_router  # ✅ ADD THIS
from app.routers.reports import router as reports_router  # ✅ ADD THIS
from app.websocket.routes import router as websocket_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FleetFlow API",
    version="1.0.0",
    description="Fleet Management System API"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("="*50)
    print("🚀 FLEETFLOW STARTUP")
    print("="*50)
    print("✅ FleetFlow API is running!")
    print("✅ CORS enabled for all origins")
    print("="*50)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(vehicle_router, prefix="/vehicles", tags=["Vehicles"])
app.include_router(shipment_router, prefix="/shipments", tags=["Shipments"])
app.include_router(trip_router, prefix="/trips", tags=["Trips"])
app.include_router(driver_router, prefix="/drivers", tags=["Drivers"])
app.include_router(maintenance_router, prefix="/maintenance", tags=["Maintenance"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(tracking_router, prefix="/tracking", tags=["Tracking"])
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(fuel_router, prefix="/fuel", tags=["Fuel Records"])  # ✅ ADDED
app.include_router(reports_router, prefix="/reports", tags=["Reports"])  # ✅ ADDED
app.include_router(websocket_router, tags=["WebSocket"])

@app.get("/")
def root():
    return {"message": "FleetFlow API running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "MySQL", "redis": "connected"}