import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaBox, FaPlus, FaSignOutAlt, FaEdit, FaTrash, FaEye, 
    FaTruck, FaCheckCircle, FaClock, FaRoute, FaMapMarkedAlt 
} from 'react-icons/fa';

const ShipmentList = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/shipments/');
            setShipments(response.data || []);
        } catch (error) {
            console.error('Error fetching shipments:', error);
            toast.error('Failed to fetch shipments');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this shipment?')) return;
        try {
            await api.delete(`/shipments/${id}`);
            toast.success('Shipment deleted successfully');
            fetchShipments();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to delete shipment');
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Created': return 'badge-primary';
            case 'Assigned': return 'badge-info';
            case 'InTransit': return 'badge-warning';
            case 'Delayed': return 'badge-danger';
            case 'Delivered': return 'badge-success';
            case 'Cancelled': return 'badge-gray';
            default: return 'badge-gray';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Delivered': return <FaCheckCircle className="text-green-500" />;
            case 'InTransit': return <FaTruck className="text-yellow-500" />;
            case 'Assigned': return <FaClock className="text-blue-500" />;
            case 'Delayed': return <FaClock className="text-red-500" />;
            default: return <FaBox className="text-blue-500" />;
        }
    };

    // ✅ NEW: Check if shipment can be tracked
    const canTrack = (status) => {
        return ['Assigned', 'InTransit', 'Delayed'].includes(status);
    };

    const filteredShipments = shipments.filter(s => {
        const matchFilter = filter === 'all' || s.status === filter;
        const matchSearch = s.tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
                           s.source?.toLowerCase().includes(search.toLowerCase()) ||
                           s.destination?.toLowerCase().includes(search.toLowerCase()) ||
                           s.customer_name?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

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
                                    <FaBox className="text-white text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    FleetFlow
                                </h1>
                            </div>
                            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
                            <Link to="/shipments" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Shipments</Link>
                            <Link to="/vehicles" className="text-gray-600 hover:text-blue-600 transition">Vehicles</Link>
                            <Link to="/live-tracking" className="text-gray-600 hover:text-blue-600 transition">Live Tracking</Link>
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
                    <h2 className="text-2xl font-bold text-gray-900">Shipments</h2>
                    <Link to="/shipments/add" className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition hover:scale-105">
                        <FaPlus />
                        <span>Add Shipment</span>
                    </Link>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search shipments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[200px]"
                    />
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                            All ({shipments.length})
                        </button>
                        {['Created', 'Assigned', 'InTransit', 'Delayed', 'Delivered', 'Cancelled'].map(status => (
                            <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                {status} ({shipments.filter(s => s.status === status).length})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {filteredShipments.length === 0 ? (
                        <div className="text-center py-16">
                            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No shipments found</p>
                            <Link to="/shipments/add" className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium">
                                Create your first shipment →
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source → Destination</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredShipments.map((shipment) => (
                                        <tr key={shipment.shipment_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-blue-600">{shipment.tracking_number}</p>
                                                <p className="text-xs text-gray-500">{new Date(shipment.created_at).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">{shipment.source}</p>
                                                <p className="text-sm text-gray-500">→ {shipment.destination}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">{shipment.customer_name || '-'}</p>
                                                <p className="text-sm text-gray-500">{shipment.customer_phone || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(shipment.status)}
                                                    <span className={`badge ${getStatusColor(shipment.status)}`}>
                                                        {shipment.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <Link to={`/shipments/${shipment.shipment_id}`} className="text-blue-600 hover:text-blue-800 transition" title="View">
                                                        <FaEye />
                                                    </Link>
                                                    <Link to={`/shipments/edit/${shipment.shipment_id}`} className="text-yellow-600 hover:text-yellow-800 transition" title="Edit">
                                                        <FaEdit />
                                                    </Link>
                                                    <button onClick={() => handleDelete(shipment.shipment_id)} className="text-red-600 hover:text-red-800 transition" title="Delete">
                                                        <FaTrash />
                                                    </button>
                                                    {/* ✅ NEW: Track Route Button */}
                                                    {canTrack(shipment.status) && (
                                                        <Link 
                                                            to={`/shipment-route/${shipment.shipment_id}`}
                                                            className="text-green-600 hover:text-green-800 transition"
                                                            title="Track Route on Map"
                                                        >
                                                            <FaRoute className="text-lg" />
                                                        </Link>
                                                    )}
                                                    {/* ✅ NEW: View on Map (for delivered) */}
                                                    {shipment.status === 'Delivered' && (
                                                        <Link 
                                                            to={`/shipment-route/${shipment.shipment_id}`}
                                                            className="text-gray-400 hover:text-gray-600 transition"
                                                            title="View Route History"
                                                        >
                                                            <FaMapMarkedAlt />
                                                        </Link>
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

                {/* ✅ NEW: Legend for Track button */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                        <FaRoute className="text-green-600" />
                        <span>Track Route (Active Shipments)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FaMapMarkedAlt className="text-gray-400" />
                        <span>View History (Delivered)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipmentList;