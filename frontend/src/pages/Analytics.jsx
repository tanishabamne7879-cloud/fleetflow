import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaTruck, FaBox, FaUsers, FaGasPump, FaChartBar, FaChartLine } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Analytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [fleetData, setFleetData] = useState(null);
    const [logisticsData, setLogisticsData] = useState(null);
    const [driverData, setDriverData] = useState(null);
    const [fuelData, setFuelData] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [fleet, logistics, drivers, fuel] = await Promise.all([
                api.get('/analytics/fleet'),
                api.get('/analytics/logistics'),
                api.get('/analytics/drivers'),
                api.get('/analytics/fuel')
            ]);
            setFleetData(fleet.data);
            setLogisticsData(logistics.data);
            setDriverData(drivers.data);
            setFuelData(fuel.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <button onClick={fetchAnalytics} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <FaTruck className="text-blue-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-gray-900">Fleet Overview</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Total Vehicles</p>
                        <p className="text-2xl font-bold text-gray-900">{fleetData?.vehicles?.total || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Available</p>
                        <p className="text-2xl font-bold text-green-700">{fleetData?.vehicles?.available || 0}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Assigned</p>
                        <p className="text-2xl font-bold text-yellow-700">{fleetData?.vehicles?.assigned || 0}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">In Maintenance</p>
                        <p className="text-2xl font-bold text-red-700">{fleetData?.vehicles?.maintenance || 0}</p>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-sm text-gray-500">Fleet Utilization</p>
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full" style={{ width: `${fleetData?.utilization?.utilization_rate || 0}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{fleetData?.utilization?.utilization_rate || 0}% utilization</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <FaBox className="text-green-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-gray-900">Logistics Overview</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Total Shipments</p>
                        <p className="text-2xl font-bold text-gray-900">{logisticsData?.shipments?.total || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Delivered</p>
                        <p className="text-2xl font-bold text-green-700">{logisticsData?.shipments?.delivered || 0}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">In Transit</p>
                        <p className="text-2xl font-bold text-yellow-700">{logisticsData?.shipments?.in_transit || 0}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Delayed</p>
                        <p className="text-2xl font-bold text-red-700">{logisticsData?.shipments?.delayed || 0}</p>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Delivery Rate</p>
                        <p className="text-2xl font-bold text-green-700">{logisticsData?.performance?.delivered_rate || 0}%</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Delayed Rate</p>
                        <p className="text-2xl font-bold text-red-700">{logisticsData?.performance?.delayed_rate || 0}%</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <FaUsers className="text-purple-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-gray-900">Driver Performance</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Total Drivers</p>
                        <p className="text-2xl font-bold text-gray-900">{driverData?.total_drivers || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Available</p>
                        <p className="text-2xl font-bold text-green-700">{driverData?.available || 0}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Busy</p>
                        <p className="text-2xl font-bold text-red-700">{driverData?.busy || 0}</p>
                    </div>
                </div>
                {driverData?.driver_performance?.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Driver</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Trips</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Deliveries</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">On-Time Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {driverData.driver_performance.map((driver, index) => (
                                    <tr key={index} className="border-b border-gray-100">
                                        <td className="px-4 py-2 text-sm text-gray-900">{driver.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{driver.trips_completed}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{driver.deliveries}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`badge ${driver.on_time_rate >= 90 ? 'badge-success' : 'badge-warning'}`}>
                                                {driver.on_time_rate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <FaGasPump className="text-orange-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-gray-900">Fuel Consumption</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Total Fuel Used</p>
                        <p className="text-2xl font-bold text-gray-900">{fuelData?.total_fuel || 0} L</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Total Cost</p>
                        <p className="text-2xl font-bold text-red-700">₹{fuelData?.total_cost || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;