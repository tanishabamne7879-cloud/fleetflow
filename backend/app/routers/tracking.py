# app/routers/tracking.py - Complete fixed version

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.gps_tracking import GPSTracking
from app.models.vehicle import Vehicle
from app.models.shipment import Shipment, ShipmentStatusEnum
from app.models.trip import Trip, TripStatusEnum
from app.core.deps import get_current_active_user
from app.services.gps_service import GPSService
from app.services.redis_service import redis_service
from app.services.route_service import RouteService
import json
import math
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/location/{vehicle_id}")
def get_latest_location(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get latest GPS location for a vehicle"""
    cache_key = f"vehicle_location_{vehicle_id}"
    cached_location = redis_service.get(cache_key)
    
    if cached_location:
        return cached_location
    
    location = GPSService.get_latest_location(db, vehicle_id)
    if not location:
        return {
            'vehicle_id': vehicle_id,
            'latitude': 20.5937,
            'longitude': 78.9629,
            'speed': 0,
            'heading': 0,
            'timestamp': None,
            'message': 'No GPS data available yet'
        }
    
    location_data = {
        'vehicle_id': vehicle_id,
        'latitude': float(location.latitude),
        'longitude': float(location.longitude),
        'speed': float(location.speed),
        'heading': location.heading,
        'timestamp': location.recorded_at.isoformat() if location.recorded_at else None
    }
    
    redis_service.set(cache_key, location_data, 60)
    return location_data


@router.get("/geocode")
async def geocode_address(
    address: str,
    current_user = Depends(get_current_active_user)
):
    """Convert address to coordinates using OSM Nominatim"""
    result = await RouteService.geocode_address(address)
    if not result:
        raise HTTPException(status_code=404, detail="Address not found")
    
    return {
        "lat": result[0],
        "lng": result[1]
    }


@router.post("/route")
async def calculate_route(
    request: dict,
    current_user = Depends(get_current_active_user)
):
    """Calculate route between two points"""
    origin = request.get("origin")
    destination = request.get("destination")
    
    if not origin or not destination:
        raise HTTPException(status_code=400, detail="Origin and destination required")
    
    route = await RouteService.get_route(
        (origin["lat"], origin["lng"]),
        (destination["lat"], destination["lng"])
    )
    
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    options = await RouteService.get_route_options(
        (origin["lat"], origin["lng"]),
        (destination["lat"], destination["lng"])
    )
    
    return {
        "distance_km": route["distance_km"],
        "duration_min": route["duration_min"],
        "options": options,
        "route_data": route
    }


def simplify_geometry(geometry, max_points=2000):
    """Simplify geometry by sampling points to reduce size"""
    if not geometry or len(geometry) <= max_points:
        return geometry
    
    logger.info(f"Simplifying geometry from {len(geometry)} to {max_points} points")
    
    # Sample evenly spaced points
    step = len(geometry) / max_points
    simplified = []
    for i in range(max_points):
        idx = int(i * step)
        if idx < len(geometry):
            simplified.append(geometry[idx])
    
    # Always include first and last point
    if len(simplified) > 1:
        simplified[0] = geometry[0]
        simplified[-1] = geometry[-1]
    
    return simplified


def find_nearest_point_on_route(route_geometry, lat, lng):
    """Find the nearest point on the route to the given GPS location"""
    if not route_geometry or len(route_geometry) < 2:
        return None
    
    min_dist = float('inf')
    nearest_point = None
    nearest_index = 0
    
    for i, point in enumerate(route_geometry):
        if isinstance(point, (list, tuple)) and len(point) >= 2:
            p_lat = float(point[0])
            p_lng = float(point[1])
        elif isinstance(point, dict):
            p_lat = float(point.get('lat') or point.get('latitude', 0))
            p_lng = float(point.get('lng') or point.get('longitude', 0))
        else:
            continue
            
        # Calculate distance
        dist = math.sqrt((p_lat - lat) ** 2 + (p_lng - lng) ** 2)
        
        if dist < min_dist:
            min_dist = dist
            nearest_point = (p_lat, p_lng)
            nearest_index = i
    
    if nearest_point:
        total_points = len(route_geometry)
        return {
            'latitude': nearest_point[0],
            'longitude': nearest_point[1],
            'index': nearest_index,
            'total_points': total_points,
            'progress': (nearest_index / total_points) * 100 if total_points > 0 else 0
        }
    return None


@router.get("/shipment-route/{shipment_id}")
async def get_shipment_route(
    shipment_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get complete route for a shipment with vehicle location"""
    # Get shipment
    shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    # Get vehicle
    vehicle = None
    if shipment.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == shipment.vehicle_id).first()
    
    # Get trip
    trip = db.query(Trip).filter(Trip.shipment_id == shipment_id).first()
    
    route_geometry = None
    route_polyline = None
    route_steps = []
    route_distance = 0
    route_duration = 0
    origin_coords = None
    dest_coords = None
    
    # Geocode origin and destination first
    origin_coords = await RouteService.geocode_address(shipment.source)
    dest_coords = await RouteService.geocode_address(shipment.destination)
    
    if not origin_coords or not dest_coords:
        raise HTTPException(status_code=404, detail="Could not geocode addresses")
    
    # Try to get from trip first
    if trip and trip.route_data:
        try:
            route_data = trip.route_data
            if isinstance(route_data, str):
                route_data = json.loads(route_data)
            
            route_distance = route_data.get('distance_km', 0)
            route_duration = route_data.get('duration_min', 0)
            
            if route_data.get('geometry'):
                route_geometry = route_data['geometry']
                logger.info(f"✅ Found geometry in trip: {len(route_geometry)} points")
            elif route_data.get('path'):
                route_geometry = route_data['path']
                logger.info(f"✅ Found path in trip: {len(route_geometry)} points")
                
            if route_data.get('polyline'):
                route_polyline = route_data['polyline']
            if route_data.get('steps'):
                route_steps = route_data['steps']
                
        except Exception as e:
            logger.error(f"Error parsing route_data: {e}")
    
    # If no route data, fetch from API
    if not route_geometry:
        logger.info("⚠️ No route data in trip, fetching from API...")
        try:
            route = await RouteService.get_route(origin_coords, dest_coords)
            if route:
                route_distance = route.get('distance_km', 0)
                route_duration = route.get('duration_min', 0)
                route_polyline = route.get('polyline')
                route_steps = route.get('steps', [])
                
                if route.get('geometry'):
                    route_geometry = route['geometry']
                    logger.info(f"✅ Got geometry from API: {len(route_geometry)} points")
                    
                    # Simplify geometry to avoid MySQL packet size issues
                    route_geometry = simplify_geometry(route_geometry, max_points=3000)
                    logger.info(f"✅ Simplified geometry: {len(route_geometry)} points")
                    
                # Save to trip (with simplified geometry)
                if route_geometry and trip:
                    try:
                        trip.route_data = {
                            'distance_km': route_distance,
                            'duration_min': route_duration,
                            'geometry': route_geometry,
                            'polyline': route_polyline,
                            'steps': route_steps
                        }
                        db.commit()
                        logger.info("✅ Saved simplified route geometry to trip")
                    except Exception as e:
                        logger.error(f"Error saving to trip: {e}")
                        db.rollback()
        except Exception as e:
            logger.error(f"Error getting route from API: {e}")
    
    # If STILL no geometry, create a straight line
    if not route_geometry:
        logger.warning("⚠️ No geometry found, creating straight line...")
        route_geometry = []
        steps = 50
        for i in range(steps + 1):
            t = i / steps
            lat = origin_coords[0] + (dest_coords[0] - origin_coords[0]) * t
            lng = origin_coords[1] + (dest_coords[1] - origin_coords[1]) * t
            route_geometry.append([lat, lng])
        logger.info(f"✅ Created straight line geometry: {len(route_geometry)} points")
    
    # Get vehicle current location
    vehicle_location = None
    vehicle_on_route = None
    progress = 0
    
    if vehicle:
        try:
            location_data = get_latest_location(vehicle.vehicle_id, db, current_user)
            if location_data and location_data.get('latitude'):
                vehicle_location = {
                    'latitude': location_data['latitude'],
                    'longitude': location_data['longitude'],
                    'speed': location_data.get('speed', 0),
                    'timestamp': location_data.get('timestamp')
                }
                
                # Find nearest point on route
                if route_geometry and len(route_geometry) > 1:
                    nearest = find_nearest_point_on_route(
                        route_geometry,
                        vehicle_location['latitude'],
                        vehicle_location['longitude']
                    )
                    if nearest:
                        vehicle_on_route = {
                            'latitude': nearest['latitude'],
                            'longitude': nearest['longitude'],
                            'progress': nearest['progress'],
                            'speed': vehicle_location['speed'],
                            'timestamp': vehicle_location['timestamp']
                        }
                        progress = nearest['progress']
                        logger.info(f"✅ Vehicle projected on route at {progress:.2f}% progress")
        except Exception as e:
            logger.error(f"Error getting vehicle location: {e}")
    
    # Fallback: use origin as vehicle position
    if not vehicle_on_route:
        vehicle_on_route = {
            'latitude': origin_coords[0],
            'longitude': origin_coords[1],
            'progress': 0,
            'speed': 0,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    # Get history
    history = []
    if vehicle:
        try:
            history = get_route_history(db, vehicle.vehicle_id)
        except Exception as e:
            logger.error(f"Error getting history: {e}")
    
    response_data = {
        'shipment': {
            'id': shipment.shipment_id,
            'tracking_number': shipment.tracking_number,
            'source': shipment.source,
            'destination': shipment.destination,
            'status': shipment.status.value if hasattr(shipment.status, 'value') else shipment.status,
            'customer_name': shipment.customer_name,
            'expected_delivery': shipment.expected_delivery.isoformat() if shipment.expected_delivery else None
        },
        'vehicle': {
            'id': vehicle.vehicle_id if vehicle else None,
            'registration': vehicle.registration_number if vehicle else None,
            'current_location': vehicle_location,
            'on_route_location': vehicle_on_route,
            'status': vehicle.status.value if vehicle and hasattr(vehicle.status, 'value') else None
        },
        'route': {
            'distance_km': route_distance,
            'duration_min': route_duration,
            'geometry': route_geometry,
            'polyline': route_polyline,
            'steps': route_steps,
            'progress_percentage': round(progress, 2),
            'origin': {
                'lat': origin_coords[0],
                'lng': origin_coords[1],
                'address': shipment.source
            },
            'destination': {
                'lat': dest_coords[0],
                'lng': dest_coords[1],
                'address': shipment.destination
            }
        },
        'history': history,
        'eta': calculate_eta(vehicle_location, dest_coords) if vehicle_location else None
    }
    
    logger.info(f"📦 Response: geometry has {len(route_geometry) if route_geometry else 0} points")
    
    return response_data


@router.get("/vehicle-route/{vehicle_id}")
async def get_vehicle_route(
    vehicle_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get complete route for a vehicle with its current shipment"""
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    active_shipment = db.query(Shipment).filter(
        Shipment.vehicle_id == vehicle_id,
        Shipment.status.in_([ShipmentStatusEnum.Assigned, ShipmentStatusEnum.InTransit])
    ).first()
    
    if not active_shipment:
        return {
            'vehicle': {
                'id': vehicle.vehicle_id,
                'registration': vehicle.registration_number,
                'status': vehicle.status.value if hasattr(vehicle.status, 'value') else vehicle.status
            },
            'message': 'No active shipment for this vehicle'
        }
    
    return await get_shipment_route(active_shipment.shipment_id, db, current_user)


@router.get("/all-vehicles-routes")
async def get_all_vehicles_routes(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get routes for all vehicles with active shipments"""
    vehicles = db.query(Vehicle).all()
    result = []
    
    for vehicle in vehicles:
        try:
            route_data = await get_vehicle_route(vehicle.vehicle_id, db, current_user)
            if route_data and 'shipment' in route_data:
                result.append(route_data)
        except Exception as e:
            logger.error(f"Error getting route for vehicle {vehicle.vehicle_id}: {e}")
    
    return result


@router.get("/history/{vehicle_id}")
def get_vehicle_history(
    vehicle_id: str,
    hours: int = Query(24, ge=1, le=168),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get location history for a vehicle"""
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=hours)
    
    locations = GPSService.get_vehicle_locations(db, vehicle_id, start_time, end_time)
    
    return [
        {
            'latitude': float(loc.latitude),
            'longitude': float(loc.longitude),
            'speed': float(loc.speed),
            'timestamp': loc.recorded_at.isoformat()
        }
        for loc in locations
    ]


# ============ HELPER FUNCTIONS ============

def get_route_history(db: Session, vehicle_id: str, limit: int = 10):
    """Get recent route history for a vehicle"""
    try:
        locations = db.query(GPSTracking).filter(
            GPSTracking.vehicle_id == vehicle_id
        ).order_by(GPSTracking.recorded_at.desc()).limit(limit).all()
        
        return [
            {
                'latitude': float(loc.latitude),
                'longitude': float(loc.longitude),
                'speed': float(loc.speed),
                'timestamp': loc.recorded_at.isoformat()
            }
            for loc in reversed(locations)
        ]
    except Exception as e:
        logger.error(f"Error getting history: {e}")
        return []


def calculate_eta(current_location, destination):
    """Calculate ETA based on current location and speed"""
    if not current_location or not destination:
        return None
    
    distance = RouteService.calculate_direct_distance(
        current_location['latitude'],
        current_location['longitude'],
        destination[0],
        destination[1]
    )
    
    speed = current_location.get('speed', 30)
    if speed <= 0:
        speed = 30
    
    time_hours = distance / speed
    minutes = time_hours * 60
    
    eta_time = datetime.utcnow() + timedelta(minutes=minutes)
    
    return {
        'minutes': round(minutes),
        'hours': round(time_hours, 1),
        'estimated_arrival': eta_time.isoformat(),
        'distance_remaining': round(distance, 2)
    }