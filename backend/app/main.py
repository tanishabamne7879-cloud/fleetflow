from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, vehicle
from app.database import engine, Base, SessionLocal
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.crud.vehicle import fix_all_vehicle_statuses
import os
from dotenv import load_dotenv

load_dotenv()

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
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(vehicle.router, prefix="/vehicles", tags=["Vehicles"])

@app.on_event("startup")
async def startup_event():
    """Fix database issues on startup"""
    print("="*50)
    print("🚀 FLEETFLOW STARTUP")
    print("="*50)
    
    try:
        db = SessionLocal()
        # Fix all vehicles with empty status
        fixed_count = fix_all_vehicle_statuses(db)
        if fixed_count > 0:
            print(f"✅ Fixed {fixed_count} vehicles with empty status")
        else:
            print("✅ All vehicle statuses are valid")
        db.close()
    except Exception as e:
        print(f"⚠️ Error fixing statuses: {e}")
    
    print("="*50)

@app.get("/")
def root():
    return {"message": "FleetFlow API running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "MySQL"}