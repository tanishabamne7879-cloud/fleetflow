// frontend/src/pages/MaintenanceLogs.jsx - Complete fixed version

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaWrench, FaGasPump, FaSearch, FaPlus,
    FaCalendarAlt, FaDollarSign, FaClock, FaEdit, FaTrash, FaEye
} from 'react-icons/fa';

const MaintenanceLogs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [fuelLogs, setFuelLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('maintenance');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [maintenanceRes, fuelRes] = await Promise.all([
                api.get('/maintenance/'),
                api.get('/fuel/')
            ]);
            setMaintenanceLogs(maintenanceRes.data || []);
            setFuelLogs(fuelRes.data || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMaintenance = async (id) => {
        if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
        try {
            await api.delete(`/maintenance/${id}`);
            toast.success('Maintenance record deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleDeleteFuel = async (id) => {
        if (!window.confirm('Are you sure you want to delete this fuel record?')) return;
        try {
            await api.delete(`/fuel/${id}`);
            toast.success('Fuel record deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    // Calculate stats
    const maintenanceStats = {
        expense: maintenanceLogs.reduce((sum, m) => sum + (m.cost || 0), 0),
        count: maintenanceLogs.length
    };

    const fuelStats = {
        totalCost: fuelLogs.reduce((sum, f) => sum + (f.fuel_cost || 0), 0),
        totalFuel: fuelLogs.reduce((sum, f) => sum + (f.fuel_amount_liters || 0), 0)
    };

    const filteredMaintenance = maintenanceLogs.filter(m =>
        m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.maintenance_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.vehicle_registration?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFuel = fuelLogs.filter(f =>
        f.vehicle_registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.refueling_station?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Maintenance & Fuel Logs</h1>
                <p className="text-sm text-gray-500">Track vehicle maintenance and fuel consumption</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">MAINTENANCE EXPENSE</p>
                    <p className="text-xl font-bold text-blue-600">${maintenanceStats.expense.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">SERVICE RECORDS</p>
                    <p className="text-xl font-bold text-purple-600">{maintenanceStats.count}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">TOTAL FUEL COST</p>
                    <p className="text-xl font-bold text-green-600">${fuelStats.totalCost.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">TOTAL FUEL USED</p>
                    <p className="text-xl font-bold text-orange-600">{fuelStats.totalFuel.toFixed(1)} L</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={`px-4 py-3 text-sm font-medium transition flex items-center space-x-2 ${
                            activeTab === 'maintenance'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FaWrench />
                        <span>Maintenance Logs ({maintenanceLogs.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('fuel')}
                        className={`px-4 py-3 text-sm font-medium transition flex items-center space-x-2 ${
                            activeTab === 'fuel'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FaGasPump />
                        <span>Fuel Logs ({fuelLogs.length})</span>
                    </button>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab === 'maintenance' ? 'maintenance' : 'fuel'} logs...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    {activeTab === 'maintenance' ? (
                        filteredMaintenance.length > 0 ? (
                            <div className="space-y-3">
                                {filteredMaintenance.map((log) => (
                                    <div key={log.maintenance_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{log.maintenance_type || 'Maintenance'}</p>
                                            <p className="text-sm text-gray-500">{log.description || 'No description'}</p>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <span className="text-xs text-gray-400 flex items-center">
                                                    <FaCalendarAlt className="mr-1" />
                                                    {new Date(log.scheduled_date).toLocaleDateString()}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                    log.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    log.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {log.status || 'Scheduled'}
                                                </span>
                                                <span className="text-xs text-gray-500">{log.vehicle_registration || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right mr-3">
                                                <p className="font-semibold text-blue-600">${log.cost?.toFixed(2) || '0.00'}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Link to={`/maintenance/edit/${log.maintenance_id}`} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                                                    <FaEdit />
                                                </Link>
                                                <Link to={`/maintenance/${log.maintenance_id}`} className="text-blue-600 hover:text-blue-800" title="View">
                                                    <FaEye />
                                                </Link>
                                                <button onClick={() => handleDeleteMaintenance(log.maintenance_id)} className="text-red-600 hover:text-red-800" title="Delete">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <FaWrench className="text-3xl mx-auto mb-2 opacity-50" />
                                No maintenance logs recorded.
                                <div className="mt-3">
                                    <Link to="/maintenance/add" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        Add Maintenance Record →
                                    </Link>
                                </div>
                            </div>
                        )
                    ) : (
                        filteredFuel.length > 0 ? (
                            <div className="space-y-3">
                                {filteredFuel.map((log) => (
                                    <div key={log.fuel_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{log.vehicle_registration || 'Vehicle'}</p>
                                            <p className="text-sm text-gray-500">{log.refueling_station || 'Station'}</p>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <span className="text-xs text-gray-400 flex items-center">
                                                    <FaCalendarAlt className="mr-1" />
                                                    {new Date(log.recorded_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-600">{log.fuel_type || 'Diesel'}</span>
                                                <span className="text-xs text-gray-500">{log.fuel_amount_liters?.toFixed(1)} L</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right mr-3">
                                                <p className="font-semibold text-green-600">${log.fuel_cost?.toFixed(2) || '0.00'}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => toast.info('Edit fuel log coming soon')} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDeleteFuel(log.fuel_id)} className="text-red-600 hover:text-red-800" title="Delete">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <FaGasPump className="text-3xl mx-auto mb-2 opacity-50" />
                                No fuel logs recorded.
                                <div className="mt-3">
                                    <Link to="/fuel-records" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        Add Fuel Record →
                                    </Link>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* ✅ FIXED: Add Button - Now redirects correctly */}
            <div className="fixed bottom-6 right-6">
                <Link
                    to={activeTab === 'maintenance' ? '/maintenance/add' : '/fuel-records'}
                    className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center hover:scale-110 transform"
                >
                    <FaPlus className="text-xl" />
                </Link>
            </div>
        </div>
    );
};

export default MaintenanceLogs;