// src/pages/LiveTracking.jsx - FIXED with vehicle marker

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import wsService from '../api/websocket';
import toast from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    FaMapMarkerAlt, FaTruck, FaSignOutAlt, FaPlay, FaPause, 
    FaSync, FaClock, FaExpand, FaCompress, FaCrosshairs
} from 'react-icons/fa';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom vehicle icon with pulse
const VehicleIcon = L.divIcon({
    className: 'vehicle-marker-pulse',
    html: `
        <div style="position: relative; width: 40px; height: 40px;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #3b82f6, #1d4ed8); width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 30px rgba(59, 130, 246, 0.8); display: flex; align-items: center; justify-content: center; font-size: 18px; z-index: 2;">🚚</div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 50px; height: 50px; border-radius: 50%; background: rgba(59, 130, 246, 0.2); animation: pulse-ring 2s ease-out infinite; z-index: 1;"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; border-radius: 50%; background: rgba(59, 130, 246, 0.1); animation: pulse-ring 2s ease-out infinite 0.5s; z-index: 0;"></div>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -25],
});

// Add animation styles
const animationStyles = `
@keyframes pulse-ring {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}
@keyframes pulse-blue {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    70% { box-shadow: 0 0 0 25px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}
.vehicle-marker-pulse {
    animation: pulse-blue 2s infinite;
}
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = animationStyles;
    document.head.appendChild(style);
}

const LiveTracking = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [locations, setLocations] = useState({});
    const [tracking, setTracking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [wsConnected, setWsConnected] = useState(false);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({});
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    // Initialize map
    useEffect(() => {
        const initMap = () => {
            if (!mapRef.current || mapInstanceRef.current) return;
            try {
                const map = L.map(mapRef.current, {
                    center: [20.5937, 78.9629],
                    zoom: 5,
                    zoomControl: false
                });
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(map);
                mapInstanceRef.current = map;
                setMapReady(true);
                console.log('✅ Map initialized successfully');
            } catch (error) {
                console.error('Map init error:', error);
            }
        };
        const timeout = setTimeout(initMap, 500);
        return () => {
            clearTimeout(timeout);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                setMapReady(false);
            }
        };
    }, []);

    // Fetch vehicles and connect WebSocket
    useEffect(() => {
        fetchVehicles();
        connectWebSocket();
        return () => { wsService.disconnect(); };
    }, []);

    // Update markers when locations change
    useEffect(() => {
        if (mapReady && mapInstanceRef.current && Object.keys(locations).length > 0) {
            Object.entries(locations).forEach(([vehicleId, loc]) => {
                if (loc && loc.latitude && loc.longitude) {
                    updateMarker(vehicleId, loc.latitude, loc.longitude, loc.speed);
                }
            });
        }
    }, [locations, mapReady]);

    const connectWebSocket = () => {
        wsService.connect(user?.user_id);
        wsService.on('connected', () => {
            setWsConnected(true);
            toast.success('WebSocket connected!');
        });
        wsService.on('disconnected', () => {
            setWsConnected(false);
            toast.error('WebSocket disconnected!');
        });
        wsService.on('location_update', handleLocationUpdate);
    };

    const handleLocationUpdate = (data) => {
        if (data && data.vehicle_id && data.latitude && data.longitude) {
            setLocations(prev => ({
                ...prev,
                [data.vehicle_id]: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    speed: data.speed || 0,
                    timestamp: data.timestamp || new Date().toISOString()
                }
            }));
        }
    };

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/vehicles/');
            setVehicles(response.data || []);
            response.data.forEach(v => {
                wsService.subscribe(v.vehicle_id);
                fetchVehicleLocation(v.vehicle_id);
            });
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleLocation = async (vehicleId) => {
        try {
            const response = await api.get(`/tracking/location/${vehicleId}`);
            if (response.data && response.data.latitude) {
                setLocations(prev => ({
                    ...prev,
                    [vehicleId]: {
                        latitude: response.data.latitude,
                        longitude: response.data.longitude,
                        speed: response.data.speed || 0,
                        timestamp: response.data.timestamp || new Date().toISOString()
                    }
                }));
            }
        } catch (error) {
            console.log(`No location for vehicle ${vehicleId}`);
        }
    };

    const updateMarker = (vehicleId, lat, lng, speed = 0) => {
        if (!mapInstanceRef.current) return;
        try {
            const position = [parseFloat(lat), parseFloat(lng)];
            const vehicle = vehicles.find(v => v.vehicle_id === vehicleId);

            if (markersRef.current[vehicleId]) {
                markersRef.current[vehicleId].setLatLng(position);
            } else {
                const marker = L.marker(position, { icon: VehicleIcon }).addTo(mapInstanceRef.current);
                marker.bindPopup(`
                    <div style="padding: 10px; min-width: 150px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                            <div style="background: #3b82f6; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px;">🚚</div>
                            <div>
                                <strong>${vehicle?.registration_number || vehicleId}</strong>
                                <div style="font-size: 11px; color: #666;">${vehicle?.status || 'Active'}</div>
                            </div>
                        </div>
                        <hr style="margin: 4px 0;"/>
                        <div style="font-size: 12px;">
                            Speed: <strong>${speed ? speed.toFixed(1) : 0} km/h</strong><br/>
                            Lat: ${parseFloat(lat).toFixed(6)}<br/>
                            Lng: ${parseFloat(lng).toFixed(6)}
                        </div>
                    </div>
                `);
                marker.on('click', () => {
                    if (vehicle) {
                        setSelectedVehicle(vehicle);
                        mapInstanceRef.current.setView(position, 14);
                    }
                });
                markersRef.current[vehicleId] = marker;
            }
        } catch (error) {
            console.error('Marker error:', error);
        }
    };

    const handleZoomIn = () => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() + 1);
    const handleZoomOut = () => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() - 1);
    
    const handleCenter = () => {
        if (!mapInstanceRef.current) return;
        if (selectedVehicle && locations[selectedVehicle.vehicle_id]) {
            const loc = locations[selectedVehicle.vehicle_id];
            mapInstanceRef.current.setView([parseFloat(loc.latitude), parseFloat(loc.longitude)], 14);
        } else {
            mapInstanceRef.current.setView([20.5937, 78.9629], 5);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen && mapRef.current) {
            mapRef.current.requestFullscreen?.();
        }
        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="container-custom mx-auto">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <FaMapMarkerAlt className="text-white text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    FleetFlow
                                </h1>
                            </div>
                            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
                            <Link to="/live-tracking" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Live Tracking</Link>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs text-gray-500">{wsConnected ? 'Connected' : 'Disconnected'}</span>
                            </div>
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

            <div className="container-custom mx-auto py-8">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Live Vehicle Tracking</h2>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setTracking(!tracking)} className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-white transition ${tracking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                            {tracking ? <FaPause /> : <FaPlay />}
                            <span>{tracking ? 'Stop Tracking' : 'Start Tracking'}</span>
                        </button>
                        <button onClick={fetchVehicles} className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition">
                            <FaSync />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Vehicle List */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-4 max-h-[600px] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <FaTruck className="text-blue-500" />
                            <span>Vehicles</span>
                            <span className="text-sm text-gray-400">({vehicles.length})</span>
                        </h3>
                        <div className="space-y-2">
                            {vehicles.map((vehicle) => {
                                const location = locations[vehicle.vehicle_id];
                                return (
                                    <div key={vehicle.vehicle_id}
                                        onClick={() => {
                                            setSelectedVehicle(vehicle);
                                            if (location && mapInstanceRef.current) {
                                                mapInstanceRef.current.setView([parseFloat(location.latitude), parseFloat(location.longitude)], 14);
                                            }
                                        }}
                                        className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-500' : 'hover:bg-gray-50 border-2 border-transparent'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{vehicle.registration_number}</p>
                                                <p className="text-sm text-gray-500 truncate">{vehicle.brand} {vehicle.model}</p>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-2">
                                                {location && <span className="text-xs text-green-600 flex items-center"><FaClock className="mr-1" />Live</span>}
                                                <span className={`w-2 h-2 rounded-full ${location ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                            </div>
                                        </div>
                                        {location && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                <span>📍 {parseFloat(location.latitude).toFixed(5)}, {parseFloat(location.longitude).toFixed(5)}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-3 relative">
                        <div ref={mapRef} className="rounded-2xl shadow-lg overflow-hidden bg-gray-100" style={{ height: '600px', width: '100%', minHeight: '400px', zIndex: 1 }}>
                            <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
                                <button onClick={handleZoomIn} className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-gray-700">+</button>
                                <button onClick={handleZoomOut} className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-gray-700">−</button>
                                <button onClick={handleCenter} className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-blue-600"><FaCrosshairs /></button>
                                <button onClick={toggleFullscreen} className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-gray-700">{isFullscreen ? <FaCompress /> : <FaExpand />}</button>
                            </div>

                            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg z-[1000]">
                                <p className="text-xs font-medium text-gray-700 mb-1">Status</p>
                                <div className="space-y-1">
                                    {['Available', 'Assigned', 'In Transit', 'Maintenance'].map(status => (
                                        <div key={status} className="flex items-center space-x-2 text-xs">
                                            <div className={`w-3 h-3 rounded-full ${status === 'Available' ? 'bg-green-500' : status === 'Assigned' ? 'bg-yellow-500' : status === 'In Transit' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                                            <span className="text-gray-600">{status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveTracking;