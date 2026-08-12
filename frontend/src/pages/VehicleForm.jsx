import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleApi } from '../api/vehicle';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const VehicleForm = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [statusOptions, setStatusOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    
    const [formData, setFormData] = useState({
        registration_number: '',
        vehicle_type: 'Truck',
        brand: '',
        model: '',
        manufacture_year: '',
        fuel_type: 'Diesel',
        capacity_kg: '',
        assigned_driver_id: '',
        notes: '',
        status: 'Available'
    });

    useEffect(() => {
        fetchOptions();
        if (isEdit) {
            fetchVehicle();
        }
    }, [id]);

    const fetchOptions = async () => {
        try {
            const [statusRes, typeRes] = await Promise.all([
                vehicleApi.getStatusOptions(),
                vehicleApi.getTypeOptions()
            ]);
            setStatusOptions(statusRes.data?.statuses || []);
            setTypeOptions(typeRes.data?.types || []);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const fetchVehicle = async () => {
        try {
            const response = await vehicleApi.getVehicle(id);
            const data = response.data;
            setFormData({
                registration_number: data.registration_number || '',
                vehicle_type: data.vehicle_type || 'Truck',
                brand: data.brand || '',
                model: data.model || '',
                manufacture_year: data.manufacture_year || '',
                fuel_type: data.fuel_type || 'Diesel',
                capacity_kg: data.capacity_kg || '',
                assigned_driver_id: data.assigned_driver_id || '',
                notes: data.notes || '',
                status: data.status || 'Available'
            });
        } catch (error) {
            toast.error('Failed to fetch vehicle');
            navigate('/vehicles');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const data = {
                registration_number: formData.registration_number.trim().toUpperCase(),
                vehicle_type: formData.vehicle_type,
                brand: formData.brand.trim() || null,
                model: formData.model.trim() || null,
                manufacture_year: formData.manufacture_year ? parseInt(formData.manufacture_year) : null,
                fuel_type: formData.fuel_type || null,
                capacity_kg: formData.capacity_kg ? parseFloat(formData.capacity_kg) : null,
                assigned_driver_id: formData.assigned_driver_id || null,
                notes: formData.notes || null,
                status: formData.status
            };
            
            if (isEdit) {
                await vehicleApi.updateVehicle(id, data);
                toast.success('Vehicle updated successfully!');
            } else {
                await vehicleApi.createVehicle(data);
                toast.success('Vehicle created successfully!');
            }
            navigate('/vehicles');
        } catch (error) {
            const message = error.response?.data?.detail || 'Operation failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-xl font-semibold text-gray-900">FleetFlow</h1>
                            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                            <Link to="/vehicles" className="text-gray-700 hover:text-blue-600">Vehicles</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">{user?.full_name}</span>
                            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {isEdit ? 'Update vehicle details' : 'Enter vehicle information'}
                        </p>
                        
                        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                {/* Registration Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Registration Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="registration_number"
                                        required
                                        value={formData.registration_number}
                                        onChange={handleChange}
                                        placeholder="KA-01-1234"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                {/* Vehicle Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Vehicle Type *
                                    </label>
                                    <select
                                        name="vehicle_type"
                                        required
                                        value={formData.vehicle_type}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        {typeOptions.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Brand */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Brand
                                    </label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        placeholder="Tata, Mahindra, etc."
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                {/* Model */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Model
                                    </label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        placeholder="Ace, Bolero, etc."
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                {/* Manufacture Year */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Manufacture Year
                                    </label>
                                    <input
                                        type="number"
                                        name="manufacture_year"
                                        value={formData.manufacture_year}
                                        onChange={handleChange}
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        placeholder="2023"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                {/* Fuel Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Fuel Type
                                    </label>
                                    <select
                                        name="fuel_type"
                                        value={formData.fuel_type}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="Diesel">Diesel</option>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>

                                {/* Capacity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Capacity (kg)
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity_kg"
                                        value={formData.capacity_kg}
                                        onChange={handleChange}
                                        min="0"
                                        step="100"
                                        placeholder="1000"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Driver Assignment */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Assigned Driver ID (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="assigned_driver_id"
                                        value={formData.assigned_driver_id}
                                        onChange={handleChange}
                                        placeholder="Enter driver ID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Driver ID from the drivers table. Leave empty to unassign.
                                    </p>
                                </div>

                                {/* Notes */}
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Additional notes about the vehicle..."
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/vehicles')}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : (isEdit ? 'Update Vehicle' : 'Create Vehicle')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleForm;