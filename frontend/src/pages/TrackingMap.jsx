// src/pages/TrackingMap.jsx - Now using Leaflet

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaRoute, FaSignOutAlt, FaCrosshairs, FaExpand, FaCompress } from 'react-icons/fa';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const OriginIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #22c55e; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

const DestinationIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

const TrackingMap = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const routeLayerRef = useRef(null);
    const originMarkerRef = useRef(null);
    const destMarkerRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [routeOptions, setRouteOptions] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Initialize Leaflet map
    useEffect(() => {
        const initMap = () => {
            if (!mapRef.current || mapInstanceRef.current) return;
            try {
                const map = L.map(mapRef.current, {
                    center: [21.1458, 79.0882],
                    zoom: 7,
                    zoomControl: false,
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

    const geocodeAddress = async (address) => {
        try {
            const response = await api.get('/tracking/geocode', { params: { address } });
            return response.data;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    };

    const calculateRoute = async () => {
        if (!origin || !destination) {
            toast.error('Please enter both origin and destination');
            return;
        }
        setLoading(true);
        try {
            const originCoords = await geocodeAddress(origin);
            const destCoords = await geocodeAddress(destination);
            if (!originCoords || !destCoords) {
                toast.error('Could not find locations. Please check addresses.');
                setLoading(false);
                return;
            }

            const response = await api.post('/tracking/route', {
                origin: originCoords,
                destination: destCoords
            });
            const routeData = response.data;
            setDistance(routeData.distance_km);
            setDuration(routeData.duration_min);
            setRouteOptions(routeData.options || []);

            // Draw route on map
            if (mapInstanceRef.current && routeData.route_data) {
                // Clear old layers
                if (routeLayerRef.current) {
                    routeLayerRef.current.remove();
                    routeLayerRef.current = null;
                }
                if (originMarkerRef.current) {
                    originMarkerRef.current.remove();
                    originMarkerRef.current = null;
                }
                if (destMarkerRef.current) {
                    destMarkerRef.current.remove();
                    destMarkerRef.current = null;
                }

                const geometry = routeData.route_data.geometry;
                if (geometry && geometry.length > 1) {
                    const latlngs = geometry.map(p => {
                        if (Array.isArray(p) && p.length === 2) {
                            return L.latLng(p[0], p[1]);
                        }
                        return null;
                    }).filter(p => p !== null);

                    if (latlngs.length > 1) {
                        routeLayerRef.current = L.polyline(latlngs, {
                            color: '#2563eb',
                            weight: 5,
                            opacity: 0.9,
                            lineJoin: 'round',
                            lineCap: 'round',
                        }).addTo(mapInstanceRef.current);
                        
                        const bounds = L.latLngBounds(latlngs);
                        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
                    }
                }

                // Add markers
                originMarkerRef.current = L.marker([originCoords.lat, originCoords.lng], { icon: OriginIcon })
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`<strong>📍 Origin</strong><br/>${origin}`);
                
                destMarkerRef.current = L.marker([destCoords.lat, destCoords.lng], { icon: DestinationIcon })
                    .addTo(mapInstanceRef.current)
                    .bindPopup(`<strong>🏁 Destination</strong><br/>${destination}`);
            }

            toast.success('Route calculated!');
        } catch (error) {
            console.error('Route calculation error:', error);
            toast.error('Failed to calculate route');
        } finally {
            setLoading(false);
        }
    };

    const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
    const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

    const handleCenter = () => {
        if (!mapInstanceRef.current) return;
        if (routeLayerRef.current) {
            const bounds = routeLayerRef.current.getBounds();
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else {
            mapInstanceRef.current.setView([21.1458, 79.0882], 7);
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

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="container-custom mx-auto">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <FaRoute className="text-white text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    FleetFlow
                                </h1>
                            </div>
                            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
                            <Link to="/tracking-map" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Route Optimization</Link>
                        </div>
                        <div className="flex items-center space-x-6">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Route Input */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Planner</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                                    <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)}
                                        placeholder="Enter origin address"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                                    <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)}
                                        placeholder="Enter destination address"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                </div>
                                <button onClick={calculateRoute} disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
                                    {loading ? 'Calculating...' : 'Calculate Route'}
                                </button>
                            </div>
                        </div>

                        {distance && duration && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <p className="text-sm text-gray-500">Distance</p>
                                        <p className="text-2xl font-bold text-blue-700">{distance.toFixed(2)} km</p>
                                    </div>
                                    <div className="bg-green-50 rounded-xl p-4">
                                        <p className="text-sm text-gray-500">Duration</p>
                                        <p className="text-2xl font-bold text-green-700">{Math.round(duration)} min</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {routeOptions.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Options</h3>
                                <div className="space-y-2">
                                    {routeOptions.map((option, index) => (
                                        <button key={index} onClick={() => setSelectedRoute(option)}
                                            className={`w-full p-4 rounded-xl transition ${selectedRoute === option ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-900 capitalize">{option.type}</span>
                                                <span className="text-sm text-gray-500">{option.distance_km.toFixed(1)} km • {Math.round(option.duration_min)} min</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div ref={mapRef} className={`relative rounded-2xl shadow-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[600px]'}`}>
                            <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
                                <button onClick={handleZoomIn} className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-gray-700 text-xl font-bold">+</button>
                                <button onClick={handleZoomOut} className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-gray-700 text-xl font-bold">−</button>
                                <button onClick={handleCenter} className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-blue-600"><FaCrosshairs /></button>
                                <button onClick={toggleFullscreen} className="w-10 h-10 bg-white rounded-xl shadow-md hover:bg-gray-50 transition flex items-center justify-center text-gray-700">{isFullscreen ? <FaCompress /> : <FaExpand />}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackingMap;