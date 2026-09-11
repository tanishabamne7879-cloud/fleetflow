// frontend/src/pages/TripsRoutes.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaRoute, FaTruck, FaUser, FaClock, FaMapMarkerAlt,
    FaEye, FaEdit, FaPlus, FaArrowRight
} from 'react-icons/fa';

const TripsRoutes = () => {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await api.get('/trips/');
            setTrips(response.data || []);
        } catch (error) {
            console.error('Error fetching trips:', error);
            toast.error('Failed to fetch trips');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Scheduled': 'bg-yellow-100 text-yellow-800',
            'In Transit': 'bg-blue-100 text-blue-800',
            'InProgress': 'bg-blue-100 text-blue-800',
            'Completed': 'bg-green-100 text-green-800',
            'Cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const stats = {
        total: trips.length,
        scheduled: trips.filter(t => t.status === 'Scheduled').length,
        inProgress: trips.filter(t => t.status === 'In Transit' || t.status === 'InProgress').length,
        completed: trips.filter(t => t.status === 'Completed').length
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading trips...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Trips & Route Optimization</h1>
                <p className="text-sm text-gray-500">Schedule disruptions, optimize routes, and manage trip frequency</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">TOTAL TRIPS</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">SCHEDULED</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">IN PROGRESS</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">COMPLETED</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
            </div>

            {/* Trips List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Active Trips</h3>
                    <Link
                        to="/trips/add"
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                        <FaPlus className="text-xs" />
                        <span>Add Trip</span>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {trips.length > 0 ? (
                                trips.map((trip) => (
                                    <tr key={trip.trip_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{trip.start_location || trip.source || 'N/A'}</p>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <FaArrowRight className="mx-1" />
                                                    <span>{trip.destination || trip.end_location || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <FaTruck className="text-gray-400 text-sm" />
                                                <span className="text-sm text-gray-600">{trip.vehicle?.registration_number || trip.vehicle_id || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <FaUser className="text-gray-400 text-sm" />
                                                <span className="text-sm text-gray-600">{trip.driver?.full_name || trip.driver_id || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {trip.distance_km ? `${trip.distance_km} km` : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {trip.duration_min ? `${trip.duration_min} min` : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                                                {trip.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/trips/${trip.trip_id}`}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition inline-block"
                                            >
                                                <FaEye className="text-sm" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-4 text-center text-gray-400 text-sm">
                                        No trips found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TripsRoutes;