import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaEdit, FaTrash, FaCalendar, FaMoneyBill, FaBars, FaChartLine,FaRoute,FaUsers,FaWrench,FaSignOutAlt,FaTruck,FaBox,FaMapMarkerAlt,FaUserCog } from 'react-icons/fa';

const MaintenanceDetail = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [maintenance, setMaintenance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchMaintenance();
    }, [id]);

    const fetchMaintenance = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/maintenance/${id}`);
            setMaintenance(response.data);
        } catch (error) {
            toast.error('Failed to fetch maintenance details');
            navigate('/maintenance');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
        try {
            await api.delete(`/maintenance/${id}`);
            toast.success('Maintenance record deleted successfully');
            navigate('/maintenance');
        } catch (error) {
            toast.error('Failed to delete maintenance record');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Scheduled': return 'badge-primary';
            case 'In Progress': return 'badge-warning';
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

    if (!maintenance) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-500">Maintenance record not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
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
                                    <FaWrench className="text-white text-xl" />
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
                    <Link to="/trips" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaRoute className="text-gray-400" />
                        <span className="text-sm">Trips</span>
                    </Link>
                    <Link to="/drivers" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaUsers className="text-gray-400" />
                        <span className="text-sm">Drivers</span>
                    </Link>
                    <Link to="/maintenance" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-semibold">
                        <FaWrench className="text-blue-600" />
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

            <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6`}>
                <button onClick={() => navigate('/maintenance')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition">
                    <FaArrowLeft />
                    <span>Back to Maintenance</span>
                </button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{maintenance.maintenance_type}</h2>
                            <p className="text-sm text-gray-500">Vehicle: {maintenance.vehicle_registration || 'N/A'}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`badge ${getStatusColor(maintenance.status)} text-sm`}>
                                {maintenance.status}
                            </span>
                            <Link to={`/maintenance/edit/${maintenance.maintenance_id}`} className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition">
                                <FaEdit />
                                <span>Edit</span>
                            </Link>
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
                                    <FaWrench className="text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Type</p>
                                        <p className="font-semibold text-gray-900">{maintenance.maintenance_type}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaCalendar className="text-green-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Scheduled Date</p>
                                        <p className="font-semibold text-gray-900">{new Date(maintenance.scheduled_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaMoneyBill className="text-purple-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Cost</p>
                                        <p className="font-semibold text-gray-900">₹{maintenance.cost || '0'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-400 font-semibold">Description</span>
                                    <div>
                                        <p className="text-xs text-gray-500">Description</p>
                                        <p className="font-semibold text-gray-900">{maintenance.description || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-400 font-semibold">Notes</span>
                                    <div>
                                        <p className="text-xs text-gray-500">Notes</p>
                                        <p className="font-semibold text-gray-900">{maintenance.notes || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-gray-400 font-semibold">Completed Date</span>
                                    <div>
                                        <p className="text-xs text-gray-500">Completed</p>
                                        <p className="font-semibold text-gray-900">{maintenance.completed_date ? new Date(maintenance.completed_date).toLocaleDateString() : 'Not completed'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {maintenance.description && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                <p className="text-sm text-gray-700"><strong>Description:</strong> {maintenance.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MaintenanceDetail;