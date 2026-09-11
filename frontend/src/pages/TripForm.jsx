// frontend/src/pages/TripForm.jsx - Updated to handle edit

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaRoute, FaArrowLeft, FaTruck, FaUser, FaBox, FaBars, FaChartLine,FaSignOutAlt,FaUsers,FaWrench,FaMapMarkerAlt,FaUserCog, FaSave } from 'react-icons/fa';

const TripForm = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        driver_id: '',
        shipment_id: '',
        start_location: '',
        destination: '',
        route_type: 'Fastest',
        start_time: '',
    });

    const routeTypes = [
        { value: 'Fastest', label: 'Fastest' },
        { value: 'Shortest', label: 'Shortest' },
        { value: 'Traffic Avoidance', label: 'Traffic Avoidance' },
        { value: 'Fuel Efficient', label: 'Fuel Efficient' }
    ];

    useEffect(() => {
        fetchOptions();
        if (isEdit) fetchTrip();
    }, [id]);

    const fetchOptions = async () => {
        try {
            const [vehiclesRes, driversRes, shipmentsRes] = await Promise.all([
                api.get('/vehicles/'),
                api.get('/drivers/'),
                api.get('/shipments/')
            ]);
            setVehicles(vehiclesRes.data || []);
            setDrivers(driversRes.data || []);
            setShipments(shipmentsRes.data || []);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const fetchTrip = async () => {
        try {
            const response = await api.get(`/trips/${id}`);
            const data = response.data;
            setFormData({
                vehicle_id: data.vehicle_id || '',
                driver_id: data.driver_id || '',
                shipment_id: data.shipment_id || '',
                start_location: data.start_location || '',
                destination: data.destination || '',
                route_type: data.route_type || 'Fastest',
                start_time: data.start_time || '',
            });
        } catch (error) {
            toast.error('Failed to fetch trip');
            navigate('/trips');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/trips/${id}`, formData);
                toast.success('Trip updated successfully!');
            } else {
                await api.post('/trips/', formData);
                toast.success('Trip created successfully!');
            }
            navigate('/trips');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner"></div>
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
                <div className="max-w-3xl mx-auto">
                    <button onClick={() => navigate('/trips')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition">
                        <FaArrowLeft />
                        <span>Back to Trips</span>
                    </button>

                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 slide-up">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {isEdit ? 'Edit Trip' : 'Add New Trip'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEdit ? 'Update trip details' : 'Schedule a new trip with vehicle, driver, and shipment'}
                        </p>
                        
                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaTruck className="text-gray-400" />
                                        </div>
                                        <select
                                            name="vehicle_id"
                                            required
                                            value={formData.vehicle_id}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                        >
                                            <option value="">Select Vehicle</option>
                                            {vehicles.map(v => (
                                                <option key={v.vehicle_id} value={v.vehicle_id}>
                                                    {v.registration_number} - {v.brand} {v.model}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-gray-400" />
                                        </div>
                                        <select
                                            name="driver_id"
                                            required
                                            value={formData.driver_id}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                        >
                                            <option value="">Select Driver</option>
                                            {drivers.map(d => (
                                                <option key={d.driver_id} value={d.driver_id}>
                                                    {d.full_name} - {d.license_number || 'No license'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipment *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaBox className="text-gray-400" />
                                        </div>
                                        <select
                                            name="shipment_id"
                                            required
                                            value={formData.shipment_id}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                        >
                                            <option value="">Select Shipment</option>
                                            {shipments.map(s => (
                                                <option key={s.shipment_id} value={s.shipment_id}>
                                                    {s.tracking_number} - {s.source} → {s.destination}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Route Type</label>
                                    <select
                                        name="route_type"
                                        value={formData.route_type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                    >
                                        {routeTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Location *</label>
                                    <input
                                        type="text"
                                        name="start_location"
                                        required
                                        value={formData.start_location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Mumbai, India"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                                    <input
                                        type="text"
                                        name="destination"
                                        required
                                        value={formData.destination}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Delhi, India"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/trips')}
                                    className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="spinner-sm mr-2"></div>
                                            {isEdit ? 'Updating...' : 'Creating...'}
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <FaSave />
                                            <span>{isEdit ? 'Update Trip' : 'Create Trip'}</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TripForm;