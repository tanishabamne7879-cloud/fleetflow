import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaArrowLeft, FaEdit, FaTrash, FaTruck, FaUser, 
    FaBox, FaMapMarkerAlt, FaCalendar, FaClock, FaBars, FaChartLine,FaRoute,FaUsers,FaWrench,FaSignOutAlt,FaUserCog
} from 'react-icons/fa';

const TripDetail = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const fetchTrip = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/trips/${id}`);
            setTrip(response.data);
        } catch (error) {
            toast.error('Failed to fetch trip details');
            navigate('/trips');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this trip?')) return;
        try {
            await api.delete(`/trips/${id}`);
            toast.success('Trip deleted successfully');
            navigate('/trips');
        } catch (error) {
            toast.error('Failed to delete trip');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-500">Trip not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="container-custom mx-auto">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <FaBars className="text-gray-600 text-xl" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <FaRoute className="text-white text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    FleetFlow
                                </h1>
                            </div>
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

            {/* Sidebar */}
            <aside className={`fixed left-0 top-16 h-full bg-white shadow-lg transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
                <nav className="p-4 space-y-1">
                    <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaChartLine className="text-gray-400" />
                        <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link to="/vehicles" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaTruck className="text-gray-400" />
                        <span className="text-sm">Vehicles</span>
                    </Link>
                    <Link to="/shipments" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaBox className="text-gray-400" />
                        <span className="text-sm">Shipments</span>
                    </Link>
                    <Link to="/trips" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-semibold">
                        <FaRoute className="text-blue-600" />
                        <span className="text-sm">Trips</span>
                    </Link>
                    <Link to="/drivers" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaUsers className="text-gray-400" />
                        <span className="text-sm">Drivers</span>
                    </Link>
                    <Link to="/maintenance" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaWrench className="text-gray-400" />
                        <span className="text-sm">Maintenance</span>
                    </Link>
                    <Link to="/analytics" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaChartLine className="text-gray-400" />
                        <span className="text-sm">Analytics</span>
                    </Link>
                    <Link to="/live-tracking" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="text-sm">Live Tracking</span>
                    </Link>
                    <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaUserCog className="text-gray-400" />
                        <span className="text-sm">Profile</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6`}>
                <button onClick={() => navigate('/trips')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition">
                    <FaArrowLeft />
                    <span>Back to Trips</span>
                </button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Trip Details</h2>
                            <p className="text-sm text-gray-500">Trip ID: {trip.trip_id}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`badge ${getStatusColor(trip.status)} text-sm`}>
                                {trip.status}
                            </span>
                            <button onClick={handleDelete} className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition">
                                <FaTrash />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaTruck className="text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Vehicle</p>
                                        <p className="font-semibold text-gray-900">{trip.vehicle_registration || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaUser className="text-green-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Driver</p>
                                        <p className="font-semibold text-gray-900">{trip.driver_name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaBox className="text-purple-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Shipment</p>
                                        <p className="font-semibold text-gray-900">{trip.tracking_number || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaMapMarkerAlt className="text-yellow-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Start Location</p>
                                        <p className="font-semibold text-gray-900">{trip.start_location}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaMapMarkerAlt className="text-red-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Destination</p>
                                        <p className="font-semibold text-gray-900">{trip.destination}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaCalendar className="text-indigo-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Start Time</p>
                                        <p className="font-semibold text-gray-900">{trip.start_time ? new Date(trip.start_time).toLocaleString() : 'Not started'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaClock className="text-orange-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">End Time</p>
                                        <p className="font-semibold text-gray-900">{trip.end_time ? new Date(trip.end_time).toLocaleString() : 'Not ended'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-400 font-semibold">Distance</span>
                                    <div>
                                        <p className="text-xs text-gray-500">Distance</p>
                                        <p className="font-semibold text-gray-900">{trip.distance_km || '-'} km</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-400 font-semibold">Route Type</span>
                                    <div>
                                        <p className="text-xs text-gray-500">Route</p>
                                        <p className="font-semibold text-gray-900">{trip.route_type || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TripDetail;