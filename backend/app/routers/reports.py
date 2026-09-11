# backend/app/routers/reports.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import RoleEnum, User
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.shipment import Shipment, ShipmentStatusEnum
from app.models.trip import Trip, TripStatusEnum
from app.models.fuel_record import FuelRecord
from app.core.deps import get_current_active_user, role_required

router = APIRouter()

# Report: Vehicle Utilization
@router.get("/vehicle-utilization")
def get_vehicle_utilization_report(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    """Get vehicle utilization report"""
    
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Get all vehicles
    vehicles = db.query(Vehicle).all()
    
    report = []
    for vehicle in vehicles:
        # Count shipments in date range
        shipments = db.query(Shipment).filter(
            Shipment.vehicle_id == vehicle.vehicle_id,
            Shipment.created_at >= start_date,
            Shipment.created_at <= end_date
        ).all()
        
        # Count trips in date range
        trips = db.query(Trip).filter(
            Trip.vehicle_id == vehicle.vehicle_id,
            Trip.created_at >= start_date,
            Trip.created_at <= end_date
        ).all()
        
        # Calculate total distance from trips
        total_distance = sum(float(t.distance_km or 0) for t in trips)
        
        # Fuel consumption
        fuel_records = db.query(FuelRecord).filter(
            FuelRecord.vehicle_id == vehicle.vehicle_id,
            FuelRecord.recorded_at >= start_date,
            FuelRecord.recorded_at <= end_date
        ).all()
        total_fuel = sum(float(r.fuel_amount_liters) for r in fuel_records)
        total_fuel_cost = sum(float(r.fuel_cost) for r in fuel_records)
        
        report.append({
            'vehicle_id': vehicle.vehicle_id,
            'registration_number': vehicle.registration_number,
            'vehicle_type': vehicle.vehicle_type.value if vehicle.vehicle_type else None,
            'status': vehicle.status.value if vehicle.status else None,
            'total_shipments': len(shipments),
            'total_trips': len(trips),
            'total_distance': float(total_distance),
            'total_fuel_used': float(total_fuel),
            'total_fuel_cost': float(total_fuel_cost),
            'avg_mileage': float(total_distance / total_fuel) if total_fuel > 0 else 0,
            'utilization_rate': (len(trips) / 30) * 100 if len(trips) > 0 else 0
        })
    
    return {
        'report_type': 'vehicle_utilization',
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'total_vehicles': len(report),
        'data': report
    }

# Report: Driver Performance
@router.get("/driver-performance")
def get_driver_performance_report(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    """Get driver performance report"""
    
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Get all drivers
    drivers = db.query(Driver).all()
    
    report = []
    for driver in drivers:
        # Get user details
        user = db.query(User).filter(User.user_id == driver.user_id).first()
        
        # Count shipments delivered
        shipments_delivered = db.query(Shipment).filter(
            Shipment.driver_id == driver.driver_id,
            Shipment.status == ShipmentStatusEnum.Delivered,
            Shipment.actual_delivery >= start_date,
            Shipment.actual_delivery <= end_date
        ).count()
        
        # Count trips completed
        trips_completed = db.query(Trip).filter(
            Trip.driver_id == driver.driver_id,
            Trip.status == TripStatusEnum.Completed,
            Trip.end_time >= start_date,
            Trip.end_time <= end_date
        ).count()
        
        # Total distance from trips
        trips = db.query(Trip).filter(
            Trip.driver_id == driver.driver_id,
            Trip.status == TripStatusEnum.Completed,
            Trip.end_time >= start_date,
            Trip.end_time <= end_date
        ).all()
        total_distance = sum(float(t.distance_km or 0) for t in trips)
        
        report.append({
            'driver_id': driver.driver_id,
            'driver_name': user.full_name if user else 'Unknown',
            'license_number': driver.license_number,
            'total_shipments_delivered': shipments_delivered,
            'total_trips_completed': trips_completed,
            'total_distance_km': float(total_distance),
            'average_trips_per_day': trips_completed / 30 if trips_completed > 0 else 0,
            'performance_score': min(100, (trips_completed / 30) * 100) if trips_completed > 0 else 0
        })
    
    return {
        'report_type': 'driver_performance',
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'total_drivers': len(report),
        'data': report
    }

# Report: Shipment Analysis
@router.get("/shipment-analysis")
def get_shipment_analysis_report(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    """Get shipment analysis report"""
    
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    shipments = db.query(Shipment).filter(
        Shipment.created_at >= start_date,
        Shipment.created_at <= end_date
    ).all()
    
    # Status breakdown
    status_breakdown = {}
    for status in ShipmentStatusEnum:
        count = sum(1 for s in shipments if s.status == status)
        status_breakdown[status.value] = count
    
    # Average delivery time
    delivered = [s for s in shipments if s.status == ShipmentStatusEnum.Delivered and s.actual_delivery]
    avg_delivery_time = 0
    if delivered:
        total_time = sum((s.actual_delivery - s.created_at).total_seconds() for s in delivered)
        avg_delivery_time = total_time / len(delivered) / 3600  # in hours
    
    return {
        'report_type': 'shipment_analysis',
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'total_shipments': len(shipments),
        'status_breakdown': status_breakdown,
        'delivery_success_rate': (len(delivered) / len(shipments) * 100) if shipments else 0,
        'average_delivery_time_hours': avg_delivery_time,
        'data': [
            {
                'date': s.created_at.strftime('%Y-%m-%d'),
                'status': s.status.value if s.status else 'Unknown',
                'source': s.source,
                'destination': s.destination
            }
            for s in shipments[:100]
        ]
    }

# Report: Fuel Consumption
@router.get("/fuel-consumption")
def get_fuel_consumption_report(
    vehicle_id: Optional[str] = None,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(role_required([RoleEnum.Admin, RoleEnum.FleetManager]))
):
    """Get fuel consumption report"""
    
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    # Get fuel records
    records = db.query(FuelRecord).filter(
        FuelRecord.recorded_at >= start_date,
        FuelRecord.recorded_at <= end_date
    )
    if vehicle_id:
        records = records.filter(FuelRecord.vehicle_id == vehicle_id)
    
    records = records.all()
    
    # Group by vehicle
    vehicle_stats = {}
    for record in records:
        veh_id = record.vehicle_id
        if veh_id not in vehicle_stats:
            vehicle_stats[veh_id] = {
                'total_fuel': 0,
                'total_cost': 0,
                'total_distance': 0,
                'records': 0
            }
        
        vehicle_stats[veh_id]['total_fuel'] += float(record.fuel_amount_liters)
        vehicle_stats[veh_id]['total_cost'] += float(record.fuel_cost)
        vehicle_stats[veh_id]['total_distance'] += float(record.trip_distance or 0)
        vehicle_stats[veh_id]['records'] += 1
    
    # Get vehicle details
    result = []
    for veh_id, stats in vehicle_stats.items():
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == veh_id).first()
        result.append({
            'vehicle_id': veh_id,
            'registration_number': vehicle.registration_number if vehicle else 'Unknown',
            'total_fuel_liters': stats['total_fuel'],
            'total_cost': stats['total_cost'],
            'total_distance': stats['total_distance'],
            'average_mileage': stats['total_distance'] / stats['total_fuel'] if stats['total_fuel'] > 0 else 0,
            'records_count': stats['records']
        })
    
    # Summary
    total_fuel = sum(float(r.fuel_amount_liters) for r in records)
    total_cost = sum(float(r.fuel_cost) for r in records)
    total_distance = sum(float(r.trip_distance or 0) for r in records)
    
    return {
        'report_type': 'fuel_consumption',
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'summary': {
            'total_fuel_used': float(total_fuel),
            'total_cost': float(total_cost),
            'total_distance': float(total_distance),
            'overall_mileage': float(total_distance / total_fuel) if total_fuel > 0 else 0,
            'total_records': len(records)
        },
        'data': result
    }

# Report: Dashboard Overview
@router.get("/dashboard-overview")
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get dashboard overview statistics"""
    
    # Vehicle stats
    total_vehicles = db.query(Vehicle).count()
    available_vehicles = db.query(Vehicle).filter(Vehicle.status == 'Available').count()
    in_transit = db.query(Vehicle).filter(Vehicle.status == 'In Transit').count()
    maintenance = db.query(Vehicle).filter(Vehicle.status == 'Maintenance').count()
    
    # Driver stats
    total_drivers = db.query(Driver).count()
    available_drivers = db.query(Driver).filter(Driver.is_available == True).count()
    
    # Shipment stats
    total_shipments = db.query(Shipment).count()
    pending_shipments = db.query(Shipment).filter(
        Shipment.status.in_([ShipmentStatusEnum.Created, ShipmentStatusEnum.Assigned])
    ).count()
    delivered_shipments = db.query(Shipment).filter(
        Shipment.status == ShipmentStatusEnum.Delivered
    ).count()
    
    # Today's stats
    today = datetime.utcnow().date()
    today_start = datetime(today.year, today.month, today.day)
    today_shipments = db.query(Shipment).filter(Shipment.created_at >= today_start).count()
    
    # Recent shipments
    recent_shipments = db.query(Shipment).order_by(Shipment.created_at.desc()).limit(10).all()
    
    # Monthly fuel cost
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    fuel_records = db.query(FuelRecord).filter(FuelRecord.recorded_at >= month_start).all()
    monthly_fuel_cost = sum(float(r.fuel_cost) for r in fuel_records)
    
    return {
        'vehicles': {
            'total': total_vehicles,
            'available': available_vehicles,
            'in_transit': in_transit,
            'maintenance': maintenance
        },
        'drivers': {
            'total': total_drivers,
            'available': available_drivers,
            'unavailable': total_drivers - available_drivers
        },
        'shipments': {
            'total': total_shipments,
            'pending': pending_shipments,
            'delivered': delivered_shipments,
            'today': today_shipments
        },
        'financial': {
            'monthly_fuel_cost': float(monthly_fuel_cost)
        },
        'recent_shipments': [
            {
                'tracking_number': s.tracking_number,
                'source': s.source,
                'destination': s.destination,
                'status': s.status.value if s.status else 'Unknown',
                'created_at': s.created_at.isoformat()
            }
            for s in recent_shipments
        ]
    }