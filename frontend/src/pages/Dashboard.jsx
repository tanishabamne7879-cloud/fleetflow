// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaTruck, FaUser, FaBox, FaGasPump, 
    FaArrowRight, FaClock, FaCheckCircle,
    FaWrench, FaRoute, FaChartBar, FaCalendarAlt,
    FaExclamationTriangle, FaMapMarkerAlt, FaUsers
} from 'react-icons/fa';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [recentShipments, setRecentShipments] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsResponse = await api.get('/reports/dashboard-overview');
            setStats(statsResponse.data);
            const shipmentsResponse = await api.get('/shipments/?limit=5');
            setRecentShipments(shipmentsResponse.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">FleetFlow Operations Command</h1>
                <p className="text-sm text-gray-500">System Administrator • Fleet Dashboard</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">ACTION DEMANDED</p>
                            <p className="text-2xl font-bold text-blue-600">1</p>
                            <p className="text-xs text-gray-400">Logging in to Fleet</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaExclamationTriangle className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">ON THE DELIVERY DATE</p>
                            <p className="text-2xl font-bold text-green-600">100%</p>
                            <p className="text-xs text-gray-400">Picked up in Fleet</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FaCheckCircle className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">ETA ACCURACY</p>
                            <p className="text-2xl font-bold text-purple-600">94.8%</p>
                            <p className="text-xs text-gray-400">Picked up in Fleet</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <FaClock className="text-purple-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">ON THE DELIVERY DATE</p>
                            <p className="text-2xl font-bold text-orange-600">1457.5 km</p>
                            <p className="text-xs text-gray-400">Picked up in Fleet</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <FaRoute className="text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Fleet Tracking Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-900">Live Fleet Tracking Snapshot</h3>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                            Open Full Line Map →
                        </button>
                    </div>
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <FaMapMarkerAlt className="text-4xl text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Live Map View</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Shipment Pipeline Breakdown</h3>
                    <div className="space-y-2">
                        {[
                            { label: 'Control', value: 0, color: 'gray' },
                            { label: 'Assigned', value: 2, color: 'yellow' },
                            { label: 'In Transit', value: 3, color: 'blue' },
                            { label: 'Delayed', value: 1, color: 'red' },
                            { label: 'Delivered', value: 5, color: 'green' },
                            { label: 'Cancelled', value: 0, color: 'gray' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{item.label}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">{item.value}</span>
                                    <div className={`w-16 h-1.5 bg-${item.color === 'gray' ? 'gray-200' : item.color === 'yellow' ? 'yellow-200' : item.color === 'blue' ? 'blue-200' : item.color === 'red' ? 'red-200' : 'green-200'} rounded-full overflow-hidden`}>
                                        <div className={`h-full bg-${item.color === 'gray' ? 'gray-500' : item.color === 'yellow' ? 'yellow-500' : item.color === 'blue' ? 'blue-500' : item.color === 'red' ? 'red-500' : 'green-500'} rounded-full`} style={{ width: `${item.value * 20}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Shipments */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Recent Shipments</h3>
                    <Link to="/shipments" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        View All
                        <FaArrowRight className="ml-1 text-xs" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recentShipments.length > 0 ? (
                                recentShipments.map((shipment) => (
                                    <tr key={shipment.shipment_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{shipment.tracking_number}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{shipment.source}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{shipment.destination}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                                                shipment.status === 'Assigned' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {shipment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-4 py-4 text-center text-gray-400 text-sm">
                                        No shipments found
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

export default Dashboard;