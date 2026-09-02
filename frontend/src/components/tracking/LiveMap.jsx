import React, { useState, useEffect, useRef } from 'react';
import { FaTruck, FaMapMarkerAlt, FaCompress, FaExpand, FaLocationArrow, FaCrosshairs } from 'react-icons/fa';

const LiveMap = ({ locations, vehicles, onVehicleSelect }) => {
    const mapContainerRef = useRef(null);
    const [zoom, setZoom] = useState(13);
    const [center, setCenter] = useState({ lat: 12.9716, lng: 77.5946 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    useEffect(() => {
        const firstLocation = Object.values(locations)[0];
        if (firstLocation) {
            setCenter({
                lat: firstLocation.latitude,
                lng: firstLocation.longitude
            });
        }
    }, [locations]);

    const handleZoomIn = () => setZoom(Math.min(zoom + 1, 20));
    const handleZoomOut = () => setZoom(Math.max(zoom - 1, 3));

    const handleCenter = () => {
        const firstLocation = Object.values(locations)[0];
        if (firstLocation) {
            setCenter({
                lat: firstLocation.latitude,
                lng: firstLocation.longitude
            });
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen && mapContainerRef.current) {
            mapContainerRef.current.requestFullscreen?.();
        }
    };

    const getVehicleStatusColor = (status) => {
        switch(status) {
            case 'Available': return 'bg-green-500';
            case 'Assigned': return 'bg-yellow-500';
            case 'Maintenance': return 'bg-red-500';
            case 'In Transit': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <h3 className="font-semibold text-gray-900">Live Map</h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {Object.keys(locations).length} Active Vehicles
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        +
                    </button>
                    <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        −
                    </button>
                    <button onClick={handleCenter} className="p-2 hover:bg-gray-100 rounded-lg transition text-blue-600">
                        <FaCrosshairs />
                    </button>
                    <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        {isFullscreen ? <FaCompress /> : <FaExpand />}
                    </button>
                </div>
            </div>

            <div 
                ref={mapContainerRef}
                className={`relative bg-gradient-to-br from-blue-50 to-purple-50 transition-all duration-300 ${
                    isFullscreen ? 'fixed inset-0 z-50' : 'h-[500px]'
                }`}
            >
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 pointer-events-none opacity-10">
                    {[...Array(48)].map((_, i) => (
                        <div key={i} className="border border-gray-400"></div>
                    ))}
                </div>

                <div className="absolute inset-0">
                    {Object.entries(locations).map(([vehicleId, location]) => {
                        const vehicle = vehicles?.find(v => v.vehicle_id === vehicleId);
                        return (
                            <div
                                key={vehicleId}
                                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-110"
                                style={{
                                    left: `${((location.longitude - center.lng) * 100) / 20 + 50}%`,
                                    top: `${((center.lat - location.latitude) * 100) / 20 + 50}%`
                                }}
                                onClick={() => {
                                    setSelectedVehicle(vehicleId);
                                    if (onVehicleSelect) onVehicleSelect(vehicleId);
                                }}
                            >
                                <div className="relative group">
                                    <div className={`w-4 h-4 rounded-full ${getVehicleStatusColor(vehicle?.status)} animate-pulse`}>
                                        <div className="absolute inset-0 bg-white rounded-full opacity-50 blur-sm"></div>
                                    </div>
                                    <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 ${getVehicleStatusColor(vehicle?.status)} border-white opacity-75`}></div>
                                    {selectedVehicle === vehicleId && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg px-3 py-2 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">{vehicle?.registration_number}</p>
                                            <p className="text-xs text-gray-500">
                                                {location.speed ? `${location.speed.toFixed(1)} km/h` : 'Stopped'}
                                            </p>
                                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-white"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-8 h-8 border-2 border-blue-500 rounded-full opacity-50"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                </div>

                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
                    <p className="text-gray-600">
                        📍 {Object.keys(locations).length} vehicles active
                    </p>
                    <p className="text-gray-500 text-xs">
                        Zoom: {zoom}x
                    </p>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-1">
                    <p className="font-medium text-gray-700">Status</p>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-gray-600">Assigned</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">In Transit</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-gray-600">Maintenance</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMap;