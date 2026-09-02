import React, { useState, useEffect } from 'react';
import { FaLocationArrow, FaSatellite, FaSignal, FaBatteryThreeQuarters } from 'react-icons/fa';

const GPSLocation = ({ vehicleId, onLocationUpdate }) => {
    const [location, setLocation] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [watchId, setWatchId] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [watchId]);

    const startTracking = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setIsTracking(true);
        setError(null);

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy, speed, heading } = position.coords;
                const locationData = {
                    vehicle_id: vehicleId,
                    latitude,
                    longitude,
                    speed: speed || 0,
                    heading: heading || 0,
                    accuracy: accuracy || 0,
                    timestamp: new Date().toISOString()
                };
                setLocation(locationData);
                setAccuracy(accuracy);
                if (onLocationUpdate) {
                    onLocationUpdate(locationData);
                }
            },
            (err) => {
                setError(err.message);
                setIsTracking(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5000
            }
        );

        setWatchId(id);
    };

    const stopTracking = () => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsTracking(false);
    };

    const toggleTracking = () => {
        if (isTracking) {
            stopTracking();
        } else {
            startTracking();
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <FaSatellite className="text-blue-500 text-xl" />
                    <h3 className="font-semibold text-gray-900">GPS Location</h3>
                </div>
                <button
                    onClick={toggleTracking}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition ${
                        isTracking 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                    <FaLocationArrow />
                    <span>{isTracking ? 'Stop' : 'Start'}</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <div className="space-y-4">
                {location ? (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500">Latitude</p>
                                <p className="font-semibold text-gray-900">{location.latitude.toFixed(6)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500">Longitude</p>
                                <p className="font-semibold text-gray-900">{location.longitude.toFixed(6)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500">Speed</p>
                                <p className="font-semibold text-gray-900">{location.speed.toFixed(1)} km/h</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500">Accuracy</p>
                                <p className="font-semibold text-gray-900">{location.accuracy.toFixed(1)} m</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                                <FaSignal className={isTracking ? 'text-green-500' : 'text-gray-400'} />
                                <span>{isTracking ? 'Active' : 'Inactive'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaBatteryThreeQuarters className="text-green-500" />
                                <span>High Accuracy</span>
                            </div>
                            <div>
                                <span>Updated: {new Date(location.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <FaLocationArrow className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>No GPS data available</p>
                        <p className="text-sm">Click Start to begin tracking</p>
                    </div>
                )}

                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-1 rounded-full transition-all duration-300 ${
                                    isTracking && i < 3 ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                            ></div>
                        ))}
                    </div>
                    <span className="text-xs text-gray-500">
                        {isTracking ? 'Strong signal' : 'No signal'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default GPSLocation;