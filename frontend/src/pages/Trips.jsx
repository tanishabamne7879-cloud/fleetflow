// frontend/src/pages/Trips.jsx - Add Edit button

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaRoute, FaPlus, FaSignOutAlt, FaEye, FaEdit, FaPlay, FaStop, FaTruck, FaUser, FaTrash } from 'react-icons/fa';

const Trips = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const response = await api.get('/trips/');
            setTrips(response.data || []);
        } catch (error) {
            console.error('Error fetching trips:', error);
            toast.error('Failed to fetch trips');
        } finally {
            setLoading(false);
        }
    };

    const startTrip = async (id) => {
        try {
            await api.patch(`/trips/${id}/start`);
            toast.success('Trip started successfully!');
            fetchTrips();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to start trip');
        }
    };

    const endTrip = async (id) => {
        try {
            await api.patch(`/trips/${id}/end`);
            toast.success('Trip completed successfully!');
            fetchTrips();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to end trip');
        }
    };

    const deleteTrip = async (id) => {
        if (!window.confirm('Are you sure you want to delete this trip?')) return;
        try {
            await api.delete(`/trips/${id}`);
            toast.success('Trip deleted successfully');
            fetchTrips();
        } catch (error) {
            toast.error('Failed to delete trip');
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Scheduled': return 'badge-primary';
            case 'In Transit': return 'badge-warning';
            case 'Completed': return 'badge-success';
            case 'Cancelled': return 'badge-danger';
            default: return 'badge-gray';
        }
    };

    const filteredTrips = filter === 'all' ? trips : trips.filter(t => t.status === filter);

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
                                    <FaRoute className="text-white text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    FleetFlow
                                </h1>
                            </div>
                            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
                            <Link to="/trips" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Trips</Link>
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
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Trips</h2>
                    <Link to="/trips/add" className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition hover:scale-105">
                        <FaPlus />
                        <span>Add Trip</span>
                    </Link>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                        All ({trips.length})
                    </button>
                    {['Scheduled', 'In Transit', 'Completed', 'Cancelled'].map(status => (
                        <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                            {status} ({trips.filter(t => t.status === status).length})
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {filteredTrips.length === 0 ? (
                        <div className="text-center py-16">
                            <FaRoute className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No trips found</p>
                            <Link to="/trips/add" className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium">
                                Create your first trip →
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredTrips.map((trip) => (
                                        <tr key={trip.trip_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900">{trip.start_location}</p>
                                                <p className="text-sm text-gray-500">→ {trip.destination}</p>
                                                <p className="text-xs text-gray-400">{trip.distance_km ? `${trip.distance_km} km` : ''}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <FaTruck className="text-blue-500" />
                                                    <span className="text-sm text-gray-900">{trip.vehicle_registration || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <FaUser className="text-green-500" />
                                                    <span className="text-sm text-gray-900">{trip.driver_name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${getStatusColor(trip.status)}`}>
                                                    {trip.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <Link to={`/trips/${trip.trip_id}`} className="text-blue-600 hover:text-blue-800" title="View">
                                                        <FaEye />
                                                    </Link>
                                                    {/* ✅ ADDED: Edit Button */}
                                                    <Link to={`/trips/edit/${trip.trip_id}`} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                                                        <FaEdit />
                                                    </Link>
                                                    {/* ✅ ADDED: Delete Button */}
                                                    <button onClick={() => deleteTrip(trip.trip_id)} className="text-red-600 hover:text-red-800" title="Delete">
                                                        <FaTrash />
                                                    </button>
                                                    {trip.status === 'Scheduled' && (
                                                        <button onClick={() => startTrip(trip.trip_id)} className="text-green-600 hover:text-green-800" title="Start Trip">
                                                            <FaPlay />
                                                        </button>
                                                    )}
                                                    {trip.status === 'In Transit' && (
                                                        <button onClick={() => endTrip(trip.trip_id)} className="text-red-600 hover:text-red-800" title="End Trip">
                                                            <FaStop />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Trips;