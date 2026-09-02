from sqlalchemy.orm import Session
from app.models.gps_tracking import GPSTracking
from app.models.vehicle import Vehicle, VehicleStatusEnum
from app.models.trip import Trip, TripStatusEnum
from app.models.shipment import Shipment, ShipmentStatusEnum
from app.crud.vehicle import get_vehicle_by_id, update_vehicle_status
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta
import math

class GPSService:
    """Service for GPS tracking and geofencing"""
    
    @staticmethod
    def save_location(
        db: Session,
        vehicle_id: str,
        latitude: float,
        longitude: float,
        speed: float = 0.0,
        heading: int = 0,
        accuracy: float = 10.0
    ) -> GPSTracking:
        """Save GPS location to database"""
        tracking = GPSTracking(
            vehicle_id=vehicle_id,
            latitude=latitude,
            longitude=longitude,
            speed=speed,
            heading=heading,
            accuracy=accuracy,
            recorded_at=datetime.utcnow()
        )
        db.add(tracking)
        db.commit()
        db.refresh(tracking)
        return tracking
    
    @staticmethod
    def get_latest_location(db: Session, vehicle_id: str) -> Optional[GPSTracking]:
        """Get latest GPS location for a vehicle"""
        return db.query(GPSTracking).filter(
            GPSTracking.vehicle_id == vehicle_id
        ).order_by(GPSTracking.recorded_at.desc()).first()
    
    @staticmethod
    def get_vehicle_locations(
        db: Session,
        vehicle_id: str,
        start_time: datetime,
        end_time: datetime
    ) -> List[GPSTracking]:
        """Get GPS locations for a vehicle in time range"""
        return db.query(GPSTracking).filter(
            GPSTracking.vehicle_id == vehicle_id,
            GPSTracking.recorded_at >= start_time,
            GPSTracking.recorded_at <= end_time
        ).order_by(GPSTracking.recorded_at).all()
    
    @staticmethod
    def calculate_distance_between_points(
        lat1: float, lon1: float,
        lat2: float, lon2: float
    ) -> float:
        """Calculate distance between two points using Haversine"""
        R = 6371
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    @staticmethod
    def check_geofence(
        current_lat: float,
        current_lng: float,
        target_lat: float,
        target_lng: float,
        radius_km: float = 0.5
    ) -> bool:
        """Check if current position is within geofence radius"""
        distance = GPSService.calculate_distance_between_points(
            current_lat, current_lng,
            target_lat, target_lng
        )
        return distance <= radius_km
    
    @staticmethod
    def process_location_update(
        db: Session,
        vehicle_id: str,
        latitude: float,
        longitude: float,
        speed: float = 0.0
    ) -> dict:
        """Process a GPS location update with geofencing"""
        # Save location
        tracking = GPSService.save_location(db, vehicle_id, latitude, longitude, speed)
        
        # Check if vehicle is on a trip
        active_trip = db.query(Trip).filter(
            Trip.vehicle_id == vehicle_id,
            Trip.status == TripStatusEnum.InTransit
        ).first()
        
        events = []
        if active_trip:
            # Check geofence for destination
            if active_trip.dest_lat and active_trip.dest_lng:
                is_at_destination = GPSService.check_geofence(
                    latitude, longitude,
                    float(active_trip.dest_lat),
                    float(active_trip.dest_lng)
                )
                
                if is_at_destination:
                    events.append({
                        'type': 'geofence_arrival',
                        'trip_id': active_trip.trip_id,
                        'message': 'Vehicle arrived at destination'
                    })
                    
                    # Update shipment status
                    if active_trip.shipment_id:
                        shipment = db.query(Shipment).filter(
                            Shipment.shipment_id == active_trip.shipment_id
                        ).first()
                        if shipment and shipment.status != ShipmentStatusEnum.Delivered:
                            shipment.status = ShipmentStatusEnum.InTransit
        
        db.commit()
        
        return {
            'tracking': tracking,
            'events': events
        }
    
    @staticmethod
    def calculate_eta(
        current_lat: float,
        current_lng: float,
        destination_lat: float,
        destination_lng: float,
        current_speed: float = 0
    ) -> Optional[float]:
        """Calculate ETA in minutes based on current position and speed"""
        if current_speed <= 0:
            return None
        
        distance = GPSService.calculate_distance_between_points(
            current_lat, current_lng,
            destination_lat, destination_lng
        )
        
        # Estimate time in hours
        time_hours = distance / current_speed
        return time_hours * 60  # Return minutes