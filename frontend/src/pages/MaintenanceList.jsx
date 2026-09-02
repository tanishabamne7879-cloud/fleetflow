import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaWrench, FaPlus, FaSignOutAlt, FaEdit, FaTrash, FaEye, 
    FaCheckCircle, FaClock, FaExclamationTriangle, FaCalendar,
    FaSearch, FaFilter, FaTimes
} from 'react-icons/fa';

const MaintenanceList = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [maintenance, setMaintenance] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchMaintenance();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [maintenance, filter, search, dateRange]);

    const fetchMaintenance = async () => {
        try {
            setLoading(true);
            const response = await api.get('/maintenance/');
            setMaintenance(response.data || []);
        } catch (error) {
            console.error('Error fetching maintenance:', error);
            toast.error('Failed to fetch maintenance records');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...maintenance];

        if (filter !== 'all') {
            filtered = filtered.filter(m => m.status === filter);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(m =>
                m.maintenance_type?.toLowerCase().includes(searchLower) ||
                m.description?.toLowerCase().includes(searchLower) ||
                m.vehicle_registration?.toLowerCase().includes(searchLower)
            );
        }

        if (dateRange.start) {
            filtered = filtered.filter(m => 
                new Date(m.scheduled_date) >= new Date(dateRange.start)
            );
        }
        if (dateRange.end) {
            filtered = filtered.filter(m => 
                new Date(m.scheduled_date) <= new Date(dateRange.end)
            );
        }

        setFilteredRecords(filtered);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
        try {
            await api.delete(`/maintenance/${id}`);
            toast.success('Maintenance record deleted successfully');
            fetchMaintenance();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to delete');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            // ✅ Fix 7: Send status in body, not query params
            await api.patch(`/maintenance/${id}/status`, { 
                status: status 
            });
            toast.success(`Status updated to ${status}`);
            fetchMaintenance();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
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

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Completed': return <FaCheckCircle className="text-green-500" />;
            case 'Scheduled': return <FaClock className="text-blue-500" />;
            case 'In Progress': return <FaExclamationTriangle className="text-yellow-500" />;
            default: return <FaWrench className="text-gray-500" />;
        }
    };

    const getStatusActions = (record) => {
        switch(record.status) {
            case 'Scheduled':
                return (
                    <button 
                        onClick={() => updateStatus(record.maintenance_id, 'In Progress')} 
                        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                    >
                        Start
                    </button>
                );
            case 'In Progress':
                return (
                    <button 
                        onClick={() => updateStatus(record.maintenance_id, 'Completed')} 
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                        Complete
                    </button>
                );
            default:
                return null;
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const clearFilters = () => {
        setFilter('all');
        setSearch('');
        setDateRange({ start: '', end: '' });
        setShowFilters(false);
    };

    const statusCounts = maintenance.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
    }, {});

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
                                    <FaWrench className="text-white text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    FleetFlow
                                </h1>
                            </div>
                            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
                            <Link to="/maintenance" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Maintenance</Link>
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
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Maintenance Records</h2>
                        <p className="text-sm text-gray-500">Manage all vehicle maintenance records</p>
                    </div>
                    <Link to="/maintenance/add" className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition hover:scale-105">
                        <FaPlus />
                        <span>Add Maintenance</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-blue-700">{maintenance.length}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Scheduled</p>
                        <p className="text-2xl font-bold text-yellow-700">{statusCounts['Scheduled'] || 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">In Progress</p>
                        <p className="text-2xl font-bold text-purple-700">{statusCounts['In Progress'] || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-2xl font-bold text-green-700">{statusCounts['Completed'] || 0}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px] relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by type, description, vehicle..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                        >
                            <FaFilter />
                            <span>Filters</span>
                        </button>
                        {(filter !== 'all' || search || dateRange.start || dateRange.end) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                            >
                                <FaTimes />
                                <span>Clear</span>
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-16">
                            <FaWrench className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No maintenance records found</p>
                            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
                            <Link to="/maintenance/add" className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium">
                                Create your first maintenance record →
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredRecords.map((record) => (
                                        <tr key={record.maintenance_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900">{record.maintenance_type}</p>
                                                <p className="text-sm text-gray-500 truncate max-w-[200px]">{record.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">{record.vehicle_registration || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <FaCalendar className="text-gray-400" />
                                                    <span className="text-sm text-gray-900">
                                                        {new Date(record.scheduled_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {record.completed_date && (
                                                    <p className="text-xs text-gray-500">
                                                        Completed: {new Date(record.completed_date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(record.status)}
                                                    <span className={`badge ${getStatusColor(record.status)}`}>
                                                        {record.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    {getStatusActions(record)}
                                                    <Link to={`/maintenance/${record.maintenance_id}`} className="text-blue-600 hover:text-blue-800" title="View">
                                                        <FaEye />
                                                    </Link>
                                                    <Link to={`/maintenance/edit/${record.maintenance_id}`} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                                                        <FaEdit />
                                                    </Link>
                                                    <button onClick={() => handleDelete(record.maintenance_id)} className="text-red-600 hover:text-red-800" title="Delete">
                                                        <FaTrash />
                                                    </button>
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

export default MaintenanceList;