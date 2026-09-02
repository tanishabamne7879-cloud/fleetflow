// src/pages/ShipmentRouteMap.jsx - COMPLETE FIXED VERSION

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaArrowLeft, FaRoute, FaTruck, FaMapMarkerAlt, FaClock,
    FaExpand, FaCompress, FaCrosshairs, FaSpinner,
    FaBox, FaSignOutAlt, FaExclamationTriangle,
    FaPlay, FaPause, FaLocationArrow, FaSync
} from 'react-icons/fa';

// Leaflet imports
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ============== FIX LEAFLET ICONS ==============
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ============== CUSTOM ICONS ==============
const OriginIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #22c55e; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 20px rgba(34, 197, 94, 0.6); display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold;">S</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

const DestinationIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #ef4444; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 20px rgba(239, 68, 68, 0.6); display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: bold;">D</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

// ============== FIXED VEHICLE ICON - LARGER AND MORE VISIBLE ==============
const VehicleIcon = L.divIcon({
    className: 'custom-div-icon vehicle-marker',
    html: `<div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 30px rgba(59, 130, 246, 0.8); display: flex; align-items: center; justify-content: center; font-size: 18px; color: white; font-weight: bold; transform: scale(1); transition: transform 0.3s;">🚚</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
});

// ============== VEHICLE MARKER WITH PULSE ==============
const VehicleIconPulse = L.divIcon({
    className: 'custom-div-icon vehicle-marker-pulse',
    html: `
        <div style="position: relative; width: 32px; height: 32px;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #3b82f6, #1d4ed8); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 30px rgba(59, 130, 246, 0.8); display: flex; align-items: center; justify-content: center; font-size: 18px; color: white; font-weight: bold; z-index: 2;">🚚</div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 50px; height: 50px; border-radius: 50%; background: rgba(59, 130, 246, 0.2); animation: pulse-ring 2s ease-out infinite; z-index: 1;"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; border-radius: 50%; background: rgba(59, 130, 246, 0.1); animation: pulse-ring 2s ease-out infinite 0.5s; z-index: 0;"></div>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
});

// ============== ADD ANIMATION STYLES ==============
const animationStyles = `
@keyframes pulse-ring {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}
@keyframes pulse-blue {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}
.vehicle-marker {
    animation: pulse-blue 2s infinite;
}
.leaflet-marker-icon.custom-div-icon {
    transition: all 0.3s ease;
}
`;

// Add styles to head
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = animationStyles;
    document.head.appendChild(style);
}

const ShipmentRouteMap = () => {
    const { shipmentId } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // State
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [routeData, setRouteData] = useState(null);
    const [shipment, setShipment] = useState(null);
    const [vehicle, setVehicle] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapReady, setMapReady] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [liveProgress, setLiveProgress] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [distance, setDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [markerVisible, setMarkerVisible] = useState(false);
    
    // Refs
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const routeLayerRef = useRef(null);
    const routeGlowRef = useRef(null);
    const vehicleMarkerRef = useRef(null);
    const originMarkerRef = useRef(null);
    const destMarkerRef = useRef(null);
    const vehiclePopupRef = useRef(null);
    const isMounted = useRef(true);
    const trackingIntervalRef = useRef(null);
    const isInitialized = useRef(false);

    // ============== CLEANUP MAP ==============
    const cleanupMap = useCallback(() => {
        console.log('🧹 Cleaning up map resources...');
        
        if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
        }
        
        // Remove all layers
        const layersToRemove = [
            vehicleMarkerRef, originMarkerRef, destMarkerRef, 
            routeLayerRef, routeGlowRef
        ];
        
        layersToRemove.forEach(ref => {
            if (ref.current) {
                try {
                    ref.current.remove();
                } catch (e) {
                    console.warn('Error removing layer:', e);
                }
                ref.current = null;
            }
        });
        
        // Remove map
        if (mapInstanceRef.current) {
            try {
                mapInstanceRef.current.remove();
            } catch (e) {
                console.warn('Error removing map:', e);
            }
            mapInstanceRef.current = null;
        }
        
        setMapReady(false);
        setMarkerVisible(false);
        isInitialized.current = false;
        console.log('✅ Cleanup completed');
    }, []);

    // ============== INITIALIZE MAP ==============
    const initializeMap = useCallback(() => {
        if (!isMounted.current) return;
        if (isInitialized.current) return;
        if (!mapContainerRef.current) {
            console.log('⚠️ Map container not ready');
            return;
        }

        try {
            console.log('🗺️ Initializing Leaflet map...');
            
            const map = L.map(mapContainerRef.current, {
                center: [20.5937, 78.9629],
                zoom: 5,
                zoomControl: false,
                attributionControl: true,
                fadeAnimation: true,
                zoomAnimation: true,
                markerZoomAnimation: true
            });

            // Tile layer - OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);

            mapInstanceRef.current = map;
            isInitialized.current = true;
            setMapReady(true);
            
            // Force resize after a moment
            setTimeout(() => {
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize();
                }
            }, 300);

            console.log('✅ Map initialized successfully');
            
            // Fetch route data after map is ready
            setTimeout(() => {
                if (isMounted.current && shipmentId) {
                    fetchRouteData();
                }
            }, 500);

        } catch (error) {
            console.error('Map init error:', error);
            if (isMounted.current) {
                setApiError('Failed to initialize map: ' + error.message);
                setLoading(false);
            }
        }
    }, [shipmentId]);

    // ============== FETCH ROUTE DATA ==============
    const fetchRouteData = useCallback(async () => {
        if (!isMounted.current) return;
        if (!shipmentId) {
            setApiError('No shipment ID provided');
            setLoading(false);
            return;
        }

        try {
            console.log(`📡 Fetching route for shipment: ${shipmentId}`);
            setApiError(null);
            
            const response = await api.get(`/tracking/shipment-route/${shipmentId}`);
            const data = response.data;
            
            if (!isMounted.current) return;
            
            if (!data.shipment) {
                setApiError('Shipment not found');
                setLoading(false);
                return;
            }
            
            console.log('📦 Route data received:', {
                hasGeometry: !!data.route?.geometry,
                geometryPoints: data.route?.geometry?.length || 0,
                progress: data.route?.progress_percentage,
                hasVehicleOnRoute: !!data.vehicle?.on_route_location,
                vehicleLocation: data.vehicle?.on_route_location || data.vehicle?.current_location
            });
            
            setRouteData(data);
            setShipment(data.shipment);
            setVehicle(data.vehicle);
            setDistance(data.route?.distance_km || 0);
            setDuration(data.route?.duration_min || 0);
            
            // Get vehicle position - use on_route_location first
            const vehicleLocation = data.vehicle?.on_route_location || data.vehicle?.current_location;
            if (vehicleLocation && vehicleLocation.latitude && vehicleLocation.longitude) {
                setCurrentPosition({
                    latitude: vehicleLocation.latitude,
                    longitude: vehicleLocation.longitude,
                    speed: vehicleLocation.speed || 0,
                    progress: vehicleLocation.progress || data.route?.progress_percentage || 0
                });
                console.log('📍 Vehicle position set:', vehicleLocation);
            } else {
                console.warn('⚠️ No vehicle location found in data');
                // Use origin as fallback
                if (data.route?.origin) {
                    setCurrentPosition({
                        latitude: data.route.origin.lat,
                        longitude: data.route.origin.lng,
                        speed: 0,
                        progress: 0
                    });
                }
            }
            
            setLiveProgress(data.route?.progress_percentage || 0);
            setLastUpdate(new Date());
            
            // Draw route on map
            if (data.route && mapInstanceRef.current) {
                setTimeout(() => {
                    if (isMounted.current) {
                        drawRouteOnMap(data.route);
                    }
                }, 300);
            }
            
            setLoading(false);
            toast.success('Route loaded!');
            
        } catch (error) {
            console.error('Error fetching route:', error);
            if (isMounted.current) {
                let errorMsg = 'Failed to load route';
                if (error.response) {
                    errorMsg = error.response.data?.detail || `Server error: ${error.response.status}`;
                } else if (error.request) {
                    errorMsg = 'Network error - Could not connect to server';
                } else {
                    errorMsg = error.message || 'Unknown error';
                }
                setApiError(errorMsg);
                setLoading(false);
                
                // Retry logic for network errors
                if (retryCount < 3) {
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => {
                        if (isMounted.current) {
                            console.log(`🔄 Retry ${retryCount + 1}...`);
                            fetchRouteData();
                        }
                    }, 2000);
                }
            }
        }
    }, [shipmentId, retryCount]);

    // ============== DRAW ROUTE ON MAP ==============
    const drawRouteOnMap = useCallback((route) => {
        if (!isMounted.current) return;
        if (!mapInstanceRef.current) return;
        
        try {
            // Remove existing layers
            const layersToRemove = [
                routeLayerRef, routeGlowRef, 
                originMarkerRef, destMarkerRef, vehicleMarkerRef
            ];
            
            layersToRemove.forEach(ref => {
                if (ref.current) {
                    try { ref.current.remove(); } catch (e) {}
                    ref.current = null;
                }
            });
            
            const origin = route.origin;
            const destination = route.destination;
            const geometry = route.geometry;
            
            // ===== DRAW ROUTE LINE =====
            let latlngs = [];
            
            if (geometry && geometry.length > 1) {
                console.log('✅ Drawing route from geometry, points:', geometry.length);
                
                // Convert geometry to Leaflet LatLng
                latlngs = geometry.map(point => {
                    if (Array.isArray(point) && point.length === 2) {
                        return L.latLng(parseFloat(point[0]), parseFloat(point[1]));
                    } else if (point && typeof point === 'object') {
                        const lat = point.lat || point.latitude;
                        const lng = point.lng || point.longitude;
                        if (lat !== undefined && lng !== undefined) {
                            return L.latLng(parseFloat(lat), parseFloat(lng));
                        }
                    }
                    return null;
                }).filter(p => p !== null);
            }
            
            // Fallback: straight line
            if (latlngs.length < 2) {
                console.log('⚠️ No valid geometry, using straight line');
                latlngs = [
                    L.latLng(origin.lat, origin.lng),
                    L.latLng(destination.lat, destination.lng)
                ];
            }
            
            if (latlngs.length >= 2) {
                // Main route line
                routeLayerRef.current = L.polyline(latlngs, {
                    color: '#2563eb',
                    weight: 5,
                    opacity: 0.9,
                    lineJoin: 'round',
                    lineCap: 'round',
                    smoothFactor: 1
                }).addTo(mapInstanceRef.current);
                
                // Glow effect
                routeGlowRef.current = L.polyline(latlngs, {
                    color: '#3b82f6',
                    weight: 14,
                    opacity: 0.15,
                    lineJoin: 'round',
                    lineCap: 'round',
                    smoothFactor: 1
                }).addTo(mapInstanceRef.current);
                
                // Fit bounds
                const bounds = L.latLngBounds(latlngs);
                mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
            
            // ===== ADD ORIGIN MARKER =====
            originMarkerRef.current = L.marker(
                [origin.lat, origin.lng],
                { icon: OriginIcon }
            ).addTo(mapInstanceRef.current)
             .bindPopup(`
                <div style="padding: 10px; min-width: 120px;">
                    <strong style="color: #22c55e;">📍 Origin</strong><br/>
                    <span style="font-size: 12px; color: #666;">${origin.address || 'Starting point'}</span>
                </div>
            `);
            
            // ===== ADD DESTINATION MARKER =====
            destMarkerRef.current = L.marker(
                [destination.lat, destination.lng],
                { icon: DestinationIcon }
            ).addTo(mapInstanceRef.current)
             .bindPopup(`
                <div style="padding: 10px; min-width: 120px;">
                    <strong style="color: #ef4444;">🏁 Destination</strong><br/>
                    <span style="font-size: 12px; color: #666;">${destination.address || 'End point'}</span>
                </div>
            `);
            
            // ===== ADD VEHICLE MARKER - FIXED =====
            addVehicleMarker();
            
            console.log('✅ Route drawn successfully');
            
        } catch (error) {
            console.error('Error drawing route:', error);
        }
    }, []);

    // ============== ADD VEHICLE MARKER - SEPARATE FUNCTION ==============
    const addVehicleMarker = useCallback(() => {
        if (!isMounted.current) return;
        if (!mapInstanceRef.current) return;
        
        // Get vehicle position from state
        let pos = null;
        let vehicleLocation = null;
        
        // Try multiple sources for vehicle position
        if (currentPosition && currentPosition.latitude && currentPosition.longitude) {
            pos = [currentPosition.latitude, currentPosition.longitude];
            vehicleLocation = currentPosition;
        } else if (routeData?.vehicle?.on_route_location) {
            const loc = routeData.vehicle.on_route_location;
            pos = [loc.latitude, loc.longitude];
            vehicleLocation = loc;
        } else if (routeData?.vehicle?.current_location) {
            const loc = routeData.vehicle.current_location;
            pos = [loc.latitude, loc.longitude];
            vehicleLocation = loc;
        } else if (routeData?.route?.origin) {
            // Fallback to origin
            pos = [routeData.route.origin.lat, routeData.route.origin.lng];
            vehicleLocation = {
                latitude: routeData.route.origin.lat,
                longitude: routeData.route.origin.lng,
                speed: 0,
                progress: 0
            };
        }
        
        if (!pos || !vehicleLocation) {
            console.warn('⚠️ No vehicle position available for marker');
            return;
        }
        
        try {
            // Remove existing marker
            if (vehicleMarkerRef.current) {
                try { vehicleMarkerRef.current.remove(); } catch (e) {}
                vehicleMarkerRef.current = null;
            }
            
            console.log('📍 Creating vehicle marker at:', pos);
            
            // Use pulse icon for better visibility
            const marker = L.marker(pos, { 
                icon: VehicleIconPulse,
                zIndexOffset: 1000
            }).addTo(mapInstanceRef.current);
            
            // Create popup content
            const progress = vehicleLocation.progress || liveProgress || 0;
            const speed = vehicleLocation.speed || 0;
            
            const popupContent = `
                <div style="padding: 12px; min-width: 180px; font-family: 'Inter', sans-serif;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <div style="background: #3b82f6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">🚚</div>
                        <div>
                            <strong style="color: #1e293b; font-size: 14px;">${vehicle?.registration || 'Vehicle'}</strong>
                            <div style="font-size: 11px; color: #64748b;">${vehicle?.status || 'Active'}</div>
                        </div>
                    </div>
                    <hr style="margin: 6px 0; border: none; border-top: 1px solid #e2e8f0;"/>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: 12px; color: #475569;">
                        <span>Speed:</span>
                        <span style="font-weight: 600; color: #0f172a;">${speed.toFixed(1)} km/h</span>
                        <span>Progress:</span>
                        <span style="font-weight: 600; color: #3b82f6;">${progress.toFixed(1)}%</span>
                        <span>Lat:</span>
                        <span style="font-weight: 600; color: #0f172a; font-size: 11px;">${vehicleLocation.latitude.toFixed(6)}</span>
                        <span>Lng:</span>
                        <span style="font-weight: 600; color: #0f172a; font-size: 11px;">${vehicleLocation.longitude.toFixed(6)}</span>
                    </div>
                    <div style="margin-top: 6px; font-size: 10px; color: #94a3b8; text-align: right;">
                        Updated: ${new Date().toLocaleTimeString()}
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            
            // Open popup by default
            setTimeout(() => {
                if (marker) {
                    marker.openPopup();
                }
            }, 300);
            
            vehicleMarkerRef.current = marker;
            setMarkerVisible(true);
            
            // Center map on vehicle with zoom
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setView(pos, 14);
            }
            
            console.log('✅ Vehicle marker created and visible at:', pos);
            
        } catch (error) {
            console.error('Error creating vehicle marker:', error);
        }
    }, [currentPosition, routeData, vehicle, liveProgress]);

    // ============== UPDATE VEHICLE POSITION ==============
    const updateVehiclePosition = useCallback((location) => {
        if (!isMounted.current) return;
        if (!location || !location.latitude || !location.longitude) {
            console.warn('⚠️ Invalid location for update:', location);
            return;
        }
        
        try {
            const pos = [location.latitude, location.longitude];
            
            // Update state
            setCurrentPosition({
                latitude: location.latitude,
                longitude: location.longitude,
                speed: location.speed || 0,
                progress: location.progress || liveProgress || 0
            });
            
            if (vehicleMarkerRef.current && mapInstanceRef.current) {
                // Update existing marker
                vehicleMarkerRef.current.setLatLng(pos);
                
                // Update popup
                const progress = location.progress || liveProgress || 0;
                const speed = location.speed || 0;
                const popupContent = `
                    <div style="padding: 12px; min-width: 180px; font-family: 'Inter', sans-serif;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <div style="background: #3b82f6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">🚚</div>
                            <div>
                                <strong style="color: #1e293b; font-size: 14px;">${vehicle?.registration || 'Vehicle'}</strong>
                                <div style="font-size: 11px; color: #64748b;">${vehicle?.status || 'Active'}</div>
                            </div>
                        </div>
                        <hr style="margin: 6px 0; border: none; border-top: 1px solid #e2e8f0;"/>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: 12px; color: #475569;">
                            <span>Speed:</span>
                            <span style="font-weight: 600; color: #0f172a;">${speed.toFixed(1)} km/h</span>
                            <span>Progress:</span>
                            <span style="font-weight: 600; color: #3b82f6;">${progress.toFixed(1)}%</span>
                        </div>
                        <div style="margin-top: 6px; font-size: 10px; color: #94a3b8; text-align: right;">
                            Updated: ${new Date().toLocaleTimeString()}
                        </div>
                    </div>
                `;
                vehicleMarkerRef.current.setPopupContent(popupContent);
                
                console.log('📍 Vehicle marker moved to:', pos);
            } else {
                // Recreate marker if it doesn't exist
                addVehicleMarker();
            }
            
            // Update live progress
            if (location.progress !== undefined) {
                setLiveProgress(location.progress);
            }
            
            setLastUpdate(new Date());
            
            // Center map on vehicle if tracking
            if (tracking && mapInstanceRef.current) {
                mapInstanceRef.current.panTo(pos, { animate: true, duration: 0.5 });
            }
            
        } catch (error) {
            console.error('Error updating vehicle position:', error);
        }
    }, [vehicle, tracking, liveProgress, addVehicleMarker]);

    // ============== START TRACKING ==============
    const startTracking = useCallback(() => {
        if (!isMounted.current) return;
        if (!shipmentId) return;
        
        setTracking(true);
        toast.success('📍 Live tracking started!');
        
        // Fetch location every 5 seconds
        if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
        }
        
        trackingIntervalRef.current = setInterval(async () => {
            if (!isMounted.current) {
                clearInterval(trackingIntervalRef.current);
                return;
            }
            
            try {
                const response = await api.get(`/tracking/shipment-route/${shipmentId}`);
                const data = response.data;
                
                if (data) {
                    // Update route data
                    setRouteData(data);
                    setLiveProgress(data.route?.progress_percentage || 0);
                    
                    // Update vehicle position - use on_route_location
                    const vehicleLocation = data.vehicle?.on_route_location || 
                                           data.vehicle?.current_location;
                    
                    if (vehicleLocation && vehicleLocation.latitude && vehicleLocation.longitude) {
                        updateVehiclePosition({
                            latitude: vehicleLocation.latitude,
                            longitude: vehicleLocation.longitude,
                            speed: vehicleLocation.speed || 0,
                            progress: vehicleLocation.progress || data.route?.progress_percentage || 0
                        });
                    } else {
                        console.warn('⚠️ No vehicle location in tracking data');
                    }
                }
                
            } catch (error) {
                console.error('Tracking error:', error);
            }
        }, 5000);
    }, [shipmentId, updateVehiclePosition]);

    // ============== STOP TRACKING ==============
    const stopTracking = useCallback(() => {
        if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
        }
        setTracking(false);
        toast.success('⏸️ Tracking paused');
    }, []);

    // ============== TOGGLE TRACKING ==============
    const toggleTracking = useCallback(() => {
        if (tracking) {
            stopTracking();
        } else {
            startTracking();
        }
    }, [tracking, startTracking, stopTracking]);

    // ============== HANDLERS ==============
    const handleRefresh = useCallback(() => {
        if (!isMounted.current) return;
        setUpdating(true);
        setRetryCount(0);
        setMarkerVisible(false);
        
        // Clear existing data
        setRouteData(null);
        setLoading(true);
        setApiError(null);
        
        // Cleanup and reinitialize
        cleanupMap();
        isInitialized.current = false;
        
        setTimeout(() => {
            if (isMounted.current) {
                initializeMap();
            }
            setUpdating(false);
        }, 500);
    }, [cleanupMap, initializeMap]);

    const handleZoomIn = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.zoomOut();
        }
    };

    const handleCenter = () => {
        if (!mapInstanceRef.current) return;
        
        if (vehicleMarkerRef.current) {
            const pos = vehicleMarkerRef.current.getLatLng();
            mapInstanceRef.current.panTo(pos, { animate: true, duration: 0.5 });
            mapInstanceRef.current.setZoom(14);
        } else if (routeData?.route) {
            const route = routeData.route;
            const bounds = L.latLngBounds([
                [route.origin.lat, route.origin.lng],
                [route.destination.lat, route.destination.lng]
            ]);
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen && mapContainerRef.current) {
            if (mapContainerRef.current.requestFullscreen) {
                mapContainerRef.current.requestFullscreen();
            }
        }
        setTimeout(() => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
            }
        }, 200);
    };

    const handleLogout = () => {
        if (tracking) stopTracking();
        cleanupMap();
        logout();
        navigate('/login');
    };

    // ============== EFFECTS ==============
    
    // Initialize map on mount
    useEffect(() => {
        isMounted.current = true;
        console.log('🔄 ShipmentRouteMap mounted');
        
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            if (isMounted.current) {
                initializeMap();
            }
        }, 300);
        
        return () => {
            isMounted.current = false;
            if (tracking) stopTracking();
            cleanupMap();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (mapInstanceRef.current) {
                setTimeout(() => {
                    mapInstanceRef.current.invalidateSize();
                }, 200);
            }
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    // ============== RENDER ==============

    if (!shipmentId) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
                    <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Shipment Selected</h2>
                    <p className="text-gray-600 mb-4">Please select a shipment to track</p>
                    <Link to="/shipments" className="inline-block px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition">
                        Go to Shipments
                    </Link>
                </div>
            </div>
        );
    }

    if (apiError) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
                    <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Route</h2>
                    <p className="text-gray-600 mb-4">{apiError}</p>
                    <button onClick={handleRefresh} className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center space-x-2 mx-auto">
                        <FaSync className={updating ? 'animate-spin' : ''} />
                        <span>{updating ? 'Retrying...' : 'Retry'}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="container-custom mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <Link to="/shipments" className="text-gray-600 hover:text-blue-600 transition">
                                <FaArrowLeft className="text-xl" />
                            </Link>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <FaRoute className="text-white text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    FleetFlow
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={toggleTracking} 
                                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm transition ${
                                    tracking 
                                        ? 'bg-red-500 text-white hover:bg-red-600' 
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                            >
                                {tracking ? <FaPause /> : <FaPlay />}
                                <span>{tracking ? 'Stop' : 'Track'}</span>
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                                    <p className="text-xs text-gray-500">{user?.role}</p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition">
                                <FaSignOutAlt />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container-custom mx-auto px-4 py-6">
                {/* Shipment Info */}
                {shipment && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <FaBox className="text-blue-600 mr-3" />
                                    {shipment.tracking_number}
                                </h2>
                                <div className="flex items-center mt-2 text-gray-600 flex-wrap gap-2">
                                    <FaMapMarkerAlt className="text-green-500" />
                                    <span>{shipment.source}</span>
                                    <span className="mx-2">→</span>
                                    <FaMapMarkerAlt className="text-red-500" />
                                    <span>{shipment.destination}</span>
                                </div>
                                {shipment.customer_name && (
                                    <div className="mt-1 text-sm text-gray-500">
                                        Customer: {shipment.customer_name}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-4 flex-wrap gap-2">
                                <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                                    shipment.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    shipment.status === 'InTransit' ? 'bg-blue-100 text-blue-700' :
                                    shipment.status === 'Assigned' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {shipment.status}
                                </span>
                                <button 
                                    onClick={handleRefresh} 
                                    disabled={updating} 
                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {updating ? <FaSpinner className="animate-spin" /> : <FaLocationArrow />}
                                    <span>{updating ? 'Updating...' : 'Refresh'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Progress */}
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <FaRoute className="text-blue-500 mr-2" />
                                Progress
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-semibold text-blue-600">{Math.min(liveProgress, 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(liveProgress, 100)}%` }}
                                    ></div>
                                </div>
                                {tracking && (
                                    <div className="flex items-center space-x-2 text-xs text-green-600">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span>Live tracking active</span>
                                    </div>
                                )}
                                {lastUpdate && (
                                    <div className="text-xs text-gray-400">
                                        Last update: {lastUpdate.toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Route Details */}
                        {routeData?.route && (
                            <div className="bg-white rounded-2xl shadow-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <FaMapMarkerAlt className="text-indigo-500 mr-2" />
                                    Route Details
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600 text-sm">Distance</span>
                                        <span className="font-semibold">{distance.toFixed(1)} km</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <span className="text-gray-600 text-sm">Est. Time</span>
                                        <span className="font-semibold">{Math.round(duration)} min</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                                        <span className="text-gray-600 text-sm">Route Points</span>
                                        <span className="font-semibold text-blue-600">{routeData.route.geometry?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ETA */}
                        {routeData?.eta && (
                            <div className="bg-white rounded-2xl shadow-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <FaClock className="text-green-500 mr-2" />
                                    ETA
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                                        <span className="text-gray-600 text-sm">Time Remaining</span>
                                        <span className="font-semibold text-green-700">{routeData.eta.minutes} min</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                                        <span className="text-gray-600 text-sm">Est. Arrival</span>
                                        <span className="font-semibold text-blue-700">
                                            {new Date(routeData.eta.estimated_arrival).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vehicle Info */}
                        {vehicle && (
                            <div className="bg-white rounded-2xl shadow-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <FaTruck className="text-purple-500 mr-2" />
                                    Vehicle
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                                        <span className="text-gray-600 text-sm">Registration</span>
                                        <span className="font-semibold text-sm">{vehicle.registration || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                                        <span className="text-gray-600 text-sm">Status</span>
                                        <span className={`font-semibold text-sm ${
                                            vehicle.status === 'Available' ? 'text-green-600' :
                                            vehicle.status === 'InTransit' ? 'text-blue-600' :
                                            'text-yellow-600'
                                        }`}>
                                            {vehicle.status || 'Unknown'}
                                        </span>
                                    </div>
                                    {currentPosition && (
                                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                                            <span className="text-gray-600 text-sm">Route Progress</span>
                                            <span className="font-semibold text-blue-600">{(currentPosition.progress || liveProgress || 0).toFixed(1)}%</span>
                                        </div>
                                    )}
                                    {currentPosition && currentPosition.speed !== undefined && (
                                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                                            <span className="text-gray-600 text-sm">Speed</span>
                                            <span className="font-semibold">{(currentPosition.speed || 0).toFixed(1)} km/h</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Map Container */}
                    <div className="lg:col-span-3 relative">
                        <div 
                            className={`rounded-2xl shadow-lg overflow-hidden bg-gray-200 relative ${
                                isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
                            }`}
                            style={{ height: isFullscreen ? '100vh' : '600px', width: '100%', minHeight: '400px' }}
                        >
                            {/* Map Container */}
                            <div
                                id="map-container"
                                ref={mapContainerRef}
                                className="absolute inset-0 z-0"
                            />

                            {/* Loading Overlay */}
                            {loading && !apiError && (
                                <div className="absolute inset-0 flex justify-center items-center bg-gray-200/90 z-10">
                                    <div className="text-center">
                                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="mt-4 text-gray-600 font-medium">Loading route...</p>
                                        <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
                                    </div>
                                </div>
                            )}

                            {/* Map Controls */}
                            <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
                                <button 
                                    onClick={handleZoomIn} 
                                    className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-gray-700 text-xl font-bold hover:scale-105"
                                    title="Zoom In"
                                >
                                    +
                                </button>
                                <button 
                                    onClick={handleZoomOut} 
                                    className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-gray-700 text-xl font-bold hover:scale-105"
                                    title="Zoom Out"
                                >
                                    −
                                </button>
                                <button 
                                    onClick={handleCenter} 
                                    className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-blue-600 hover:scale-105"
                                    title="Center on Vehicle"
                                >
                                    <FaCrosshairs />
                                </button>
                                <button 
                                    onClick={toggleFullscreen} 
                                    className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-gray-700 hover:scale-105"
                                    title="Fullscreen"
                                >
                                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                                </button>
                            </div>

                            {/* Live Indicator */}
                            {tracking && (
                                <div className="absolute top-4 left-4 z-[1000] bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-2 animate-pulse">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    <span>LIVE</span>
                                </div>
                            )}

                            {/* Legend */}
                            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg z-[1000]">
                                <div className="space-y-1.5">
                                    <div className="flex items-center space-x-2 text-xs">
                                        <div className="w-8 h-1 bg-blue-500 rounded"></div>
                                        <span className="text-gray-600">Route</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-gray-600">Vehicle</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-gray-600">Origin</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-gray-600">Destination</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar at bottom */}
                            <div className="absolute bottom-4 left-4 right-20 z-[1000]">
                                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                                    <div className="flex justify-between items-center text-xs text-gray-600">
                                        <span>Origin</span>
                                        <span className="font-medium text-blue-600">{Math.min(liveProgress, 100).toFixed(1)}%</span>
                                        <span>Destination</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-green-500 via-blue-500 to-red-500 h-1.5 rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(liveProgress, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Map attribution */}
                            <div className="absolute bottom-0 left-0 right-0 z-[1000]">
                                <div className="leaflet-control-attribution leaflet-control" style={{ 
                                    background: 'rgba(255,255,255,0.8)',
                                    fontSize: '9px',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    margin: '4px'
                                }}>
                                    © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipmentRouteMap;