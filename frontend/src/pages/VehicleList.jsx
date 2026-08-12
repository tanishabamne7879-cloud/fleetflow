import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { vehicleApi } from '../api/vehicle';
import toast from 'react-hot-toast';

const VehicleList = () => {
    const { user, logout } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    useEffect(() => {
        fetchVehicles();
        fetchStats();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter !== 'all') params.status = filter;
            if (search) params.search = search;
            
            const response = await vehicleApi.getVehicles(params);
            setVehicles(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await vehicleApi.getStats();
            setStats(response.data || {});
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleDelete = async () => {
        if (!selectedVehicle) return;
        
        try {
            await vehicleApi.deleteVehicle(selectedVehicle.vehicle_id);
            toast.success('Vehicle deleted successfully');
            setShowDeleteModal(false);
            setSelectedVehicle(null);
            fetchVehicles();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to delete vehicle');
        }
    };

    const handleStatusChange = async (vehicleId, newStatus) => {
        try {
            await vehicleApi.updateStatus(vehicleId, newStatus);
            toast.success('Status updated successfully');
            fetchVehicles();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Available': 'bg-green-100 text-green-800',
            'Assigned': 'bg-yellow-100 text-yellow-800',
            'Maintenance': 'bg-red-100 text-red-800',
            'In Transit': 'bg-blue-100 text-blue-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const isAdminOrManager = user?.role === 'Admin' || user?.role === 'FleetManager';

    if (loading) {
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
                            <Link to="/vehicles" className="text-blue-600 font-medium">Vehicles</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">{user?.full_name}</span>
                            <span className="text-xs text-gray-500">({user?.role})</span>
                            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Vehicles</h2>
                    {isAdminOrManager && (
                        <Link
                            to="/vehicles/add"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Vehicle
                        </Link>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold">{stats.total || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg shadow">
                        <p className="text-sm text-green-600">Available</p>
                        <p className="text-2xl font-bold text-green-700">{stats.Available || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg shadow">
                        <p className="text-sm text-yellow-600">Assigned</p>
                        <p className="text-2xl font-bold text-yellow-700">{stats.Assigned || 0}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg shadow">
                        <p className="text-sm text-blue-600">In Transit</p>
                        <p className="text-2xl font-bold text-blue-700">{stats['In Transit'] || 0}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg shadow">
                        <p className="text-sm text-red-600">Maintenance</p>
                        <p className="text-2xl font-bold text-red-700">{stats.Maintenance || 0}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            All ({stats.total || 0})
                        </button>
                        {['Available', 'Assigned', 'In Transit', 'Maintenance'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    filter === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {status} ({stats[status] || 0})
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search by registration, brand, model..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchVehicles()}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <button
                        onClick={fetchVehicles}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Search
                    </button>
                </div>

                {/* Vehicle List */}
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    {vehicles.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No vehicles found</p>
                            {isAdminOrManager && (
                                <Link to="/vehicles/add" className="inline-block mt-4 text-blue-600 hover:text-blue-800">
                                    Add your first vehicle
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Registration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type / Brand / Model
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Capacity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Driver
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vehicles.map((vehicle) => (
                                        <tr key={vehicle.vehicle_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-blue-600">
                                                    {vehicle.registration_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {vehicle.vehicle_type}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {vehicle.brand} {vehicle.model}
                                                    {vehicle.manufacture_year && ` (${vehicle.manufacture_year})`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {vehicle.capacity_kg ? `${vehicle.capacity_kg} kg` : '-'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {vehicle.fuel_type || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isAdminOrManager ? (
                                                    <select
                                                        value={vehicle.status}
                                                        onChange={(e) => handleStatusChange(vehicle.vehicle_id, e.target.value)}
                                                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(vehicle.status)}`}
                                                    >
                                                        <option value="Available">Available</option>
                                                        <option value="Assigned">Assigned</option>
                                                        <option value="In Transit">In Transit</option>
                                                        <option value="Maintenance">Maintenance</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                                                        {vehicle.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {vehicle.driver_name || 'Unassigned'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        to={`/vehicles/${vehicle.vehicle_id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View
                                                    </Link>
                                                    {isAdminOrManager && (
                                                        <>
                                                            <Link
                                                                to={`/vehicles/edit/${vehicle.vehicle_id}`}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVehicle(vehicle);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
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
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedVehicle && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Vehicle</h3>
                        <p className="text-gray-500 mb-6">
                            Are you sure you want to delete vehicle <strong>{selectedVehicle.registration_number}</strong>? 
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedVehicle(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleList;