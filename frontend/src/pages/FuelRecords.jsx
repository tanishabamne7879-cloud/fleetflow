// frontend/src/pages/FuelRecords.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaGasPump, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FuelRecords = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    
    const [formData, setFormData] = useState({
        vehicle_id: '',
        driver_id: '',
        fuel_type: 'Diesel',
        fuel_amount_liters: '',
        fuel_cost: '',
        cost_per_liter: '',
        odometer_reading: '',
        trip_distance: '',
        refueling_station: '',
        location: '',
        receipt_number: '',
        notes: ''
    });

    useEffect(() => {
        fetchRecords();
        fetchVehicles();
        fetchDrivers();
        fetchStats();
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await api.get('/fuel/');
            setRecords(response.data || []);
        } catch (error) {
            console.error('Error fetching fuel records:', error);
            toast.error('Failed to fetch fuel records');
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles/');
            setVehicles(response.data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    const fetchDrivers = async () => {
        try {
            const response = await api.get('/drivers/');
            setDrivers(response.data || []);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/fuel/statistics/summary');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingRecord ? `/fuel/${editingRecord.fuel_id}` : '/fuel/';
            const method = editingRecord ? 'put' : 'post';
            
            const response = await api[method](url, {
                ...formData,
                fuel_amount_liters: parseFloat(formData.fuel_amount_liters),
                fuel_cost: parseFloat(formData.fuel_cost),
                cost_per_liter: parseFloat(formData.cost_per_liter),
                odometer_reading: formData.odometer_reading ? parseFloat(formData.odometer_reading) : null,
                trip_distance: formData.trip_distance ? parseFloat(formData.trip_distance) : null
            });
            
            toast.success(editingRecord ? 'Fuel record updated!' : 'Fuel record created!');
            setShowModal(false);
            setEditingRecord(null);
            resetForm();
            fetchRecords();
            fetchStats();
        } catch (error) {
            console.error('Error saving fuel record:', error);
            toast.error(error.response?.data?.detail || 'Failed to save fuel record');
        }
    };

    const handleDelete = async (fuelId) => {
        if (!window.confirm('Are you sure you want to delete this fuel record?')) return;
        
        try {
            await api.delete(`/fuel/${fuelId}`);
            toast.success('Fuel record deleted!');
            fetchRecords();
            fetchStats();
        } catch (error) {
            console.error('Error deleting fuel record:', error);
            toast.error('Failed to delete fuel record');
        }
    };

    const resetForm = () => {
        setFormData({
            vehicle_id: '',
            driver_id: '',
            fuel_type: 'Diesel',
            fuel_amount_liters: '',
            fuel_cost: '',
            cost_per_liter: '',
            odometer_reading: '',
            trip_distance: '',
            refueling_station: '',
            location: '',
            receipt_number: '',
            notes: ''
        });
    };

    const openEditModal = (record) => {
        setEditingRecord(record);
        setFormData({
            vehicle_id: record.vehicle_id || '',
            driver_id: record.driver_id || '',
            fuel_type: record.fuel_type || 'Diesel',
            fuel_amount_liters: record.fuel_amount_liters || '',
            fuel_cost: record.fuel_cost || '',
            cost_per_liter: record.cost_per_liter || '',
            odometer_reading: record.odometer_reading || '',
            trip_distance: record.trip_distance || '',
            refueling_station: record.refueling_station || '',
            location: record.location || '',
            receipt_number: record.receipt_number || '',
            notes: record.notes || ''
        });
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container-custom mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <FaGasPump className="text-blue-600 mr-3" />
                            Fuel Records
                        </h1>
                        <p className="text-gray-500 mt-1">Track and manage vehicle fuel consumption</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingRecord(null);
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                    >
                        <FaPlus />
                        <span>Add Fuel Record</span>
                    </button>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <p className="text-sm text-gray-500">Total Fuel Used</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.total_fuel_used.toFixed(2)} L</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <p className="text-sm text-gray-500">Total Cost</p>
                            <p className="text-2xl font-bold text-green-600">₹{stats.total_cost.toFixed(2)}</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <p className="text-sm text-gray-500">Average Mileage</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.average_mileage.toFixed(2)} km/L</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-4">
                            <p className="text-sm text-gray-500">Total Records</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.records_count}</p>
                        </div>
                    </div>
                )}

                {/* Records Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (L)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {records.map((record) => (
                                    <tr key={record.fuel_id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-gray-900">
                                                {record.vehicle_registration || record.vehicle_id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {record.driver_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                record.fuel_type === 'Diesel' ? 'bg-yellow-100 text-yellow-800' :
                                                record.fuel_type === 'Petrol' ? 'bg-red-100 text-red-800' :
                                                record.fuel_type === 'Electric' ? 'bg-green-100 text-green-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {record.fuel_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {record.fuel_amount_liters?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            ₹{record.fuel_cost?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {record.mileage?.toFixed(2) || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {new Date(record.recorded_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openEditModal(record)}
                                                    className="text-blue-600 hover:text-blue-800 transition"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(record.fuel_id)}
                                                    className="text-red-600 hover:text-red-800 transition"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {editingRecord ? 'Edit Fuel Record' : 'Add Fuel Record'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                                    <select
                                        value={formData.vehicle_id}
                                        onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(v => (
                                            <option key={v.vehicle_id} value={v.vehicle_id}>
                                                {v.registration_number}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                                    <select
                                        value={formData.driver_id}
                                        onChange={(e) => setFormData({...formData, driver_id: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Driver</option>
                                        {drivers.map(d => (
                                            <option key={d.driver_id} value={d.driver_id}>
                                                {d.full_name || d.driver_id}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
                                    <select
                                        value={formData.fuel_type}
                                        onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="Diesel">Diesel</option>
                                        <option value="Petrol">Petrol</option>
                                        <option value="CNG">CNG</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Liters) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.fuel_amount_liters}
                                        onChange={(e) => setFormData({...formData, fuel_amount_liters: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.fuel_cost}
                                        onChange={(e) => setFormData({...formData, fuel_cost: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Liter</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cost_per_liter}
                                        onChange={(e) => setFormData({...formData, cost_per_liter: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Odometer Reading</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.odometer_reading}
                                        onChange={(e) => setFormData({...formData, odometer_reading: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trip Distance (km)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.trip_distance}
                                        onChange={(e) => setFormData({...formData, trip_distance: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Refueling Station</label>
                                    <input
                                        type="text"
                                        value={formData.refueling_station}
                                        onChange={(e) => setFormData({...formData, refueling_station: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                                    <input
                                        type="text"
                                        value={formData.receipt_number}
                                        onChange={(e) => setFormData({...formData, receipt_number: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    rows="2"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingRecord(null);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                                >
                                    {editingRecord ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuelRecords;