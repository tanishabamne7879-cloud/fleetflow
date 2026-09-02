import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaBox, 
    FaSignOutAlt, 
    FaArrowLeft, 
    FaEdit, 
    FaTrash, 
    FaMapMarkerAlt, 
    FaUser, 
    FaPhone, 
    FaWeightHanging, 
    FaCalendar, 
    FaTruck, 
    FaCheckCircle, 
    FaClock, 
    FaBars,
    FaChartLine,
    FaRoute,
    FaUsers,
    FaWrench,
    FaUserCog 
} from 'react-icons/fa';  // ❌ REMOVED FaChartLine

const ShipmentDetail = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchShipment();
    }, [id]);

    const fetchShipment = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/shipments/${id}`);
            setShipment(response.data);
        } catch (error) {
            toast.error('Failed to fetch shipment details');
            navigate('/shipments');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this shipment?')) return;
        try {
            await api.delete(`/shipments/${id}`);
            toast.success('Shipment deleted successfully');
            navigate('/shipments');
        } catch (error) {
            toast.error('Failed to delete shipment');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Created': return 'badge-primary';
            case 'Assigned': return 'badge-info';
            case 'In Transit': return 'badge-warning';
            case 'Delayed': return 'badge-danger';
            case 'Delivered': return 'badge-success';
            case 'Cancelled': return 'badge-gray';
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

    if (!shipment) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-500">Shipment not found</p>
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
                                    <FaBox className="text-white text-xl" />
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
                        <FaChartLine className="text-gray-400" /> {/* ✅ ADDED FaChartLine */}
                        <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link to="/vehicles" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaTruck className="text-gray-400" />
                        <span className="text-sm">Vehicles</span>
                    </Link>
                    <Link to="/shipments" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-semibold">
                        <FaBox className="text-blue-600" />
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
                <button onClick={() => navigate('/shipments')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition">
                    <FaArrowLeft />
                    <span>Back to Shipments</span>
                </button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{shipment.tracking_number}</h2>
                            <p className="text-sm text-gray-500">Shipment Details</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`badge ${getStatusColor(shipment.status)} text-sm`}>
                                {shipment.status}
                            </span>
                            <Link to={`/shipments/edit/${shipment.shipment_id}`} className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition">
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
                                    <FaMapMarkerAlt className="text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Source</p>
                                        <p className="font-semibold text-gray-900">{shipment.source}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaMapMarkerAlt className="text-green-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Destination</p>
                                        <p className="font-semibold text-gray-900">{shipment.destination}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaUser className="text-yellow-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Customer</p>
                                        <p className="font-semibold text-gray-900">{shipment.customer_name || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaPhone className="text-purple-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Customer Phone</p>
                                        <p className="font-semibold text-gray-900">{shipment.customer_phone || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaWeightHanging className="text-red-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Weight</p>
                                        <p className="font-semibold text-gray-900">{shipment.shipment_weight || '-'} kg</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaCalendar className="text-indigo-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Expected Delivery</p>
                                        <p className="font-semibold text-gray-900">{shipment.expected_delivery ? new Date(shipment.expected_delivery).toLocaleDateString() : '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaTruck className="text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Assigned Vehicle</p>
                                        <p className="font-semibold text-gray-900">{shipment.vehicle_id || 'Not assigned'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaUser className="text-green-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Assigned Driver</p>
                                        <p className="font-semibold text-gray-900">{shipment.driver_id || 'Not assigned'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaCheckCircle className={shipment.status === 'Delivered' ? 'text-green-500' : 'text-gray-400'} />
                                    <div>
                                        <p className="text-xs text-gray-500">Delivery Status</p>
                                        <p className="font-semibold text-gray-900">
                                            {shipment.status === 'Delivered' ? 'Delivered' : 'Pending'}
                                            {shipment.actual_delivery && (
                                                <span className="text-xs text-gray-500 ml-2">
                                                    {new Date(shipment.actual_delivery).toLocaleDateString()}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <FaClock className="text-blue-500" />
                            <span>Status Timeline</span>
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                                <div>
                                    <p className="font-medium text-gray-900">Created</p>
                                    <p className="text-sm text-gray-500">{new Date(shipment.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            {shipment.status !== 'Created' && (
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                                    <div>
                                        <p className="font-medium text-gray-900">Assigned</p>
                                        <p className="text-sm text-gray-500">Vehicle and driver assigned</p>
                                    </div>
                                </div>
                            )}
                            {shipment.status === 'In Transit' && (
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">▶</div>
                                    <div>
                                        <p className="font-medium text-gray-900">In Transit</p>
                                        <p className="text-sm text-gray-500">Shipment is on the way</p>
                                    </div>
                                </div>
                            )}
                            {shipment.status === 'Delivered' && (
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                                    <div>
                                        <p className="font-medium text-gray-900">Delivered</p>
                                        <p className="text-sm text-gray-500">{shipment.actual_delivery ? new Date(shipment.actual_delivery).toLocaleString() : 'Completed'}</p>
                                    </div>
                                </div>
                            )}
                            {shipment.status === 'Delayed' && (
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">⚠</div>
                                    <div>
                                        <p className="font-medium text-gray-900">Delayed</p>
                                        <p className="text-sm text-gray-500">Delivery is delayed</p>
                                    </div>
                                </div>
                            )}
                            {shipment.status === 'Cancelled' && (
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✕</div>
                                    <div>
                                        <p className="font-medium text-gray-900">Cancelled</p>
                                        <p className="text-sm text-gray-500">Shipment cancelled</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShipmentDetail;