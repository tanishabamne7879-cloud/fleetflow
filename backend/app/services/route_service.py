# app/services/route_service.py - Updated for OSRM

import httpx
import math
import json
from typing import Dict, List, Optional, Tuple, Any
from app.config import settings
from app.services.redis_service import redis_service
import logging

logger = logging.getLogger(__name__)

class RouteService:
    OSRM_BASE_URL = "http://router.project-osrm.org/route/v1/driving"
    CACHE_EXPIRE = 3600
    
    @staticmethod
    async def geocode_address(address: str) -> Optional[Tuple[float, float]]:
        """Convert address to coordinates using OSM Nominatim"""
        cache_key = f"geocode_{address.lower().replace(' ', '_').replace(',', '_')}"
        
        cached = redis_service.get(cache_key)
        if cached:
            return (cached['lat'], cached['lng'])
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={
                        'q': address,
                        'format': 'json',
                        'limit': 1,
                        'addressdetails': 1
                    },
                    headers={'User-Agent': 'FleetFlow/1.0'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        lat = float(data[0]['lat'])
                        lng = float(data[0]['lon'])
                        result = {'lat': lat, 'lng': lng}
                        redis_service.set(cache_key, result, RouteService.CACHE_EXPIRE)
                        return (lat, lng)
                
                logger.warning(f"Geocoding failed for: {address}")
                return None
        except Exception as e:
            logger.error(f"Geocoding error for {address}: {e}")
            return None
    
    @staticmethod
    async def get_route(
        origin: Tuple[float, float],
        destination: Tuple[float, float]
    ) -> Optional[Dict]:
        """Get route between two coordinates using OSRM"""
        cache_key = f"route_{origin[0]:.6f}_{origin[1]:.6f}_{destination[0]:.6f}_{destination[1]:.6f}"
        
        cached = redis_service.get(cache_key)
        if cached:
            return cached
        
        try:
            # OSRM expects lng,lat format
            coord_str = f"{origin[1]},{origin[0]};{destination[1]},{destination[0]}"
            url = f"{RouteService.OSRM_BASE_URL}/{coord_str}"
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url, params={
                    'overview': 'full',
                    'geometries': 'geojson',
                    'steps': 'true',
                    'alternatives': 'true'
                })
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('code') == 'Ok' and data.get('routes'):
                        route = data['routes'][0]
                        
                        # Extract geometry coordinates
                        geometry = []
                        if route.get('geometry', {}).get('coordinates'):
                            for coord in route['geometry']['coordinates']:
                                # OSRM returns [lng, lat], we want [lat, lng]
                                geometry.append([coord[1], coord[0]])
                        
                        # Extract steps
                        steps = []
                        for leg in route.get('legs', []):
                            for step in leg.get('steps', []):
                                step_geometry = []
                                if step.get('geometry', {}).get('coordinates'):
                                    for coord in step['geometry']['coordinates']:
                                        step_geometry.append([coord[1], coord[0]])
                                
                                steps.append({
                                    'instruction': step.get('name', 'Turn'),
                                    'distance': step.get('distance', 0),
                                    'duration': step.get('duration', 0),
                                    'geometry': step_geometry,
                                    'maneuver': step.get('maneuver', {})
                                })
                        
                        route_data = {
                            'distance_km': route['distance'] / 1000,
                            'duration_min': route['duration'] / 60,
                            'geometry': geometry,
                            'steps': steps,
                            'summary': route.get('summary', 'Route'),
                            'weight': route.get('weight', 0)
                        }
                        
                        redis_service.set(cache_key, route_data, RouteService.CACHE_EXPIRE)
                        return route_data
                    else:
                        logger.warning(f"OSRM returned error: {data.get('code')}")
                        return None
                else:
                    logger.error(f"OSRM request failed: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Route generation error: {e}")
            return None
    
    @staticmethod
    def calculate_direct_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate straight-line distance using Haversine formula"""
        R = 6371
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    @staticmethod
    async def get_route_options(
        origin: Tuple[float, float],
        destination: Tuple[float, float]
    ) -> List[Dict]:
        """Get multiple route options (driving only with OSRM)"""
        options = []
        
        route = await RouteService.get_route(origin, destination)
        if route:
            options.append({
                'type': 'driving',
                'distance_km': route['distance_km'],
                'duration_min': route['duration_min'],
                'route_data': route
            })
        
        # Add direct distance as fallback option
        direct_distance = RouteService.calculate_direct_distance(
            origin[0], origin[1],
            destination[0], destination[1]
        )
        options.append({
            'type': 'direct',
            'distance_km': direct_distance,
            'duration_min': direct_distance * 2,  # Rough estimate
            'route_data': None,
            'is_fallback': True
        })
        
        return options