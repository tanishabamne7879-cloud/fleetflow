// frontend/src/pages/FuelLogs.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaGasPump, FaSearch, FaPlus, FaEdit, FaTrash,
    FaCalendarAlt, FaDollarSign, FaTruck
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FuelLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/fuel/');
            setLogs(response.data || []);
        } catch (error) {
            console.error('Error fetching fuel logs:', error);
            toast.error('Failed to fetch fuel logs');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalFuel: logs.reduce((sum, l) => sum + (l.fuel_amount_liters || 0), 0),
        totalCost: logs.reduce((sum, l) => sum + (l.fuel_cost || 0), 0),
        totalTrips: logs.filter(l => l.trip_distance).length,
        avgMileage: logs.reduce((sum, l) => sum + (l.mileage || 0), 0) / (logs.filter(l => l.mileage).length || 1)
    };

    const filteredLogs = logs.filter(log =>
        log.vehicle_registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.refueling_station?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading fuel logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fuel Logs</h1>
                    <p className="text-sm text-gray-500">Track and manage fuel consumption</p>
                </div>
                <button
                    onClick={() => toast.info('Add fuel log feature coming soon')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                    <FaPlus className="text-sm" />
                    <span>Add Fuel Log</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">TOTAL FUEL USED</p>
                    <p className="text-xl font-bold text-blue-600">{stats.totalFuel.toFixed(1)} L</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">TOTAL COST</p>
                    <p className="text-xl font-bold text-green-600">${stats.totalCost.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">TOTAL TRIPS</p>
                    <p className="text-xl font-bold text-purple-600">{stats.totalTrips}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <p className="text-xs text-gray-500">AVG MILEAGE</p>
                    <p className="text-xl font-bold text-orange-600">{stats.avgMileage.toFixed(1)} km/L</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by vehicle, station, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fuel Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mileage</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.fuel_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-2">
                                                <FaTruck className="text-gray-400 text-sm" />
                                                <span className="text-sm font-medium text-gray-900">{log.vehicle_registration || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                {log.fuel_type || 'Diesel'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{log.fuel_amount_liters?.toFixed(1)} L</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">${log.fuel_cost?.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{log.mileage?.toFixed(1) || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{log.refueling_station || 'N/A'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(log.recorded_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => toast.info('Edit feature coming soon')}
                                                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                                >
                                                    <FaEdit className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => toast.info('Delete feature coming soon')}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                                        <FaGasPump className="text-3xl mx-auto mb-2 opacity-50" />
                                        No fuel logs found
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

export default FuelLogs;