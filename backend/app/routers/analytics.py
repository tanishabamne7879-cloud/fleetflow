from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User, RoleEnum
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.models.shipment import Shipment, ShipmentStatusEnum
from app.models.trip import Trip, TripStatusEnum
from app.models.driver import Driver
from app.models.maintenance import VehicleMaintenance, MaintenanceStatusEnum
from app.models.fuel_record import FuelRecord
from app.core.deps import get_current_active_user, role_required

router = APIRouter()

# ✅ FLEET MANAGER & ADMIN can view fleet analytics
@router.get("/fleet")
def get_fleet_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    total_vehicles = db.query(Vehicle).count()
    available = db.query(Vehicle).filter(Vehicle.status == VehicleStatusEnum.Available).count()
    assigned = db.query(Vehicle).filter(Vehicle.status == VehicleStatusEnum.Assigned).count()
    maintenance = db.query(Vehicle).filter(Vehicle.status == VehicleStatusEnum.Maintenance).count()
    in_transit = db.query(Vehicle).filter(Vehicle.status == VehicleStatusEnum.InTransit).count()
    
    active_vehicles = assigned + in_transit
    utilization_rate = (active_vehicles / total_vehicles * 100) if total_vehicles > 0 else 0
    
    scheduled = db.query(VehicleMaintenance).filter(
        VehicleMaintenance.status == MaintenanceStatusEnum.Scheduled
    ).count()
    in_progress = db.query(VehicleMaintenance).filter(
        VehicleMaintenance.status == MaintenanceStatusEnum.InProgress
    ).count()
    completed = db.query(VehicleMaintenance).filter(
        VehicleMaintenance.status == MaintenanceStatusEnum.Completed
    ).count()
    
    return {
        "vehicles": {
            "total": total_vehicles,
            "available": available,
            "assigned": assigned,
            "maintenance": maintenance,
            "in_transit": in_transit
        },
        "utilization": {
            "active_vehicles": active_vehicles,
            "utilization_rate": round(utilization_rate, 2)
        },
        "maintenance": {
            "scheduled": scheduled,
            "in_progress": in_progress,
            "completed": completed
        }
    }

# ✅ ADMIN, FLEET MANAGER, DISPATCHER can view logistics
@router.get("/logistics")
def get_logistics_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager, RoleEnum.Dispatcher]))
):
    total = db.query(Shipment).count()
    created = db.query(Shipment).filter(Shipment.status == ShipmentStatusEnum.Created).count()
    assigned = db.query(Shipment).filter(Shipment.status == ShipmentStatusEnum.Assigned).count()
    in_transit = db.query(Shipment).filter(Shipment.status == ShipmentStatusEnum.InTransit).count()
    delayed = db.query(Shipment).filter(Shipment.status == ShipmentStatusEnum.Delayed).count()
    delivered = db.query(Shipment).filter(Shipment.status == ShipmentStatusEnum.Delivered).count()
    cancelled = db.query(Shipment).filter(Shipment.status == ShipmentStatusEnum.Cancelled).count()
    
    delivered_rate = (delivered / total * 100) if total > 0 else 0
    delayed_rate = (delayed / total * 100) if total > 0 else 0
    
    scheduled_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.Scheduled).count()
    active_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.InTransit).count()
    completed_trips = db.query(Trip).filter(Trip.status == TripStatusEnum.Completed).count()
    
    return {
        "shipments": {
            "total": total,
            "created": created,
            "assigned": assigned,
            "in_transit": in_transit,
            "delayed": delayed,
            "delivered": delivered,
            "cancelled": cancelled
        },
        "performance": {
            "delivered_rate": round(delivered_rate, 2),
            "delayed_rate": round(delayed_rate, 2)
        },
        "trips": {
            "scheduled": scheduled_trips,
            "active": active_trips,
            "completed": completed_trips
        }
    }

# ✅ ADMIN & FLEET MANAGER can view driver analytics
@router.get("/drivers")
def get_driver_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    total_drivers = db.query(Driver).count()
    available = db.query(Driver).filter(Driver.is_available == True).count()
    busy = db.query(Driver).filter(Driver.is_available == False).count()
    
    driver_stats = []
    drivers = db.query(Driver).all()
    
    for driver in drivers:
        trips_completed = db.query(Trip).filter(
            Trip.driver_id == driver.driver_id,
            Trip.status == TripStatusEnum.Completed
        ).count()
        
        on_time = db.query(Shipment).filter(
            Shipment.driver_id == driver.driver_id,
            Shipment.status == ShipmentStatusEnum.Delivered,
            Shipment.actual_delivery <= Shipment.expected_delivery
        ).count()
        
        total_deliveries = db.query(Shipment).filter(
            Shipment.driver_id == driver.driver_id,
            Shipment.status == ShipmentStatusEnum.Delivered
        ).count()
        
        on_time_rate = (on_time / total_deliveries * 100) if total_deliveries > 0 else 0
        
        user = db.query(User).filter(User.user_id == driver.user_id).first()
        
        driver_stats.append({
            "driver_id": driver.driver_id,
            "name": user.full_name if user else "Unknown",
            "trips_completed": trips_completed,
            "deliveries": total_deliveries,
            "on_time_rate": round(on_time_rate, 2)
        })
    
    return {
        "total_drivers": total_drivers,
        "available": available,
        "busy": busy,
        "driver_performance": driver_stats
    }

# ✅ ADMIN & FLEET MANAGER can view fuel analytics
@router.get("/fuel")
def get_fuel_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    total_fuel = db.query(FuelRecord).with_entities(
        func.sum(FuelRecord.fuel_amount)
    ).scalar() or 0
    
    total_cost = db.query(FuelRecord).with_entities(
        func.sum(FuelRecord.fuel_cost)
    ).scalar() or 0
    
    fuel_by_vehicle = []
    vehicles = db.query(Vehicle).all()
    
    for vehicle in vehicles:
        fuel = db.query(FuelRecord).filter(
            FuelRecord.vehicle_id == vehicle.vehicle_id
        ).with_entities(
            func.sum(FuelRecord.fuel_amount)
        ).scalar() or 0
        
        cost = db.query(FuelRecord).filter(
            FuelRecord.vehicle_id == vehicle.vehicle_id
        ).with_entities(
            func.sum(FuelRecord.fuel_cost)
        ).scalar() or 0
        
        if fuel > 0:
            fuel_by_vehicle.append({
                "vehicle_id": vehicle.vehicle_id,
                "registration": vehicle.registration_number,
                "total_fuel": round(fuel, 2),
                "total_cost": round(cost, 2)
            })
    
    return {
        "total_fuel": round(total_fuel, 2),
        "total_cost": round(total_cost, 2),
        "fuel_by_vehicle": fuel_by_vehicle
    }

# ✅ ADMIN only can view admin analytics
@router.get("/admin")
def get_admin_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin]))
):
    fleet = get_fleet_analytics(db, current_user)
    logistics = get_logistics_analytics(db, current_user)
    drivers = get_driver_analytics(db, current_user)
    fuel = get_fuel_analytics(db, current_user)
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_shipments = db.query(Shipment).filter(
        Shipment.created_at >= week_ago
    ).count()
    completed_trips = db.query(Trip).filter(
        Trip.end_time >= week_ago,
        Trip.status == TripStatusEnum.Completed
    ).count()
    
    return {
        "summary": {
            "total_users": total_users,
            "active_users": active_users,
            "new_shipments_7d": new_shipments,
            "completed_trips_7d": completed_trips
        },
        "fleet": fleet,
        "logistics": logistics,
        "drivers": drivers,
        "fuel": fuel
    }