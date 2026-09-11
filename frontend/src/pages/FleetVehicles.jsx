// frontend/src/pages/FleetVehicles.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaSearch, FaTruck, FaPlus, FaEdit, FaTrash, FaEye,
    FaWrench, FaCheckCircle, FaClock, FaExclamationTriangle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FleetVehicles = () => {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles/');
            setVehicles(response.data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Available': 'bg-green-100 text-green-800',
            'Assigned': 'bg-yellow-100 text-yellow-800',
            'In Transit': 'bg-blue-100 text-blue-800',
            'Maintenance': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Available': return <FaCheckCircle className="text-green-500" />;
            case 'Assigned': return <FaClock className="text-yellow-500" />;
            case 'In Transit': return <FaTruck className="text-blue-500" />;
            case 'Maintenance': return <FaWrench className="text-red-500" />;
            default: return <FaExclamationTriangle className="text-gray-500" />;
        }
    };

    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading vehicles...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fleet Vehicles</h1>
                    <p className="text-sm text-gray-500">Manage and track all vehicles in your fleet</p>
                </div>
                <Link
                    to="/vehicles/add"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                    <FaPlus className="text-sm" />
                    <span>Add Vehicle</span>
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by registration, brand, or model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle) => (
                        <div key={vehicle.vehicle_id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <FaTruck className="text-blue-600 text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{vehicle.registration_number}</h3>
                                        <p className="text-sm text-gray-500">{vehicle.brand} {vehicle.model}</p>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(vehicle.status)}`}>
                                    {getStatusIcon(vehicle.status)}
                                    <span>{vehicle.status || 'Unknown'}</span>
                                </span>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <p className="text-xs text-gray-500">Type</p>
                                    <p className="font-medium">{vehicle.vehicle_type || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <p className="text-xs text-gray-500">Year</p>
                                    <p className="font-medium">{vehicle.manufacture_year || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <p className="text-xs text-gray-500">Fuel</p>
                                    <p className="font-medium">{vehicle.fuel_type || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2">
                                    <p className="text-xs text-gray-500">Capacity</p>
                                    <p className="font-medium">{vehicle.capacity_kg || 'N/A'} kg</p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end space-x-2">
                                <Link
                                    to={`/vehicles/${vehicle.vehicle_id}`}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                    <FaEye className="text-sm" />
                                </Link>
                                <Link
                                    to={`/vehicles/edit/${vehicle.vehicle_id}`}
                                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                >
                                    <FaEdit className="text-sm" />
                                </Link>
                                <button
                                    onClick={() => toast.info('Delete feature coming soon')}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                    <FaTrash className="text-sm" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        <FaTruck className="text-4xl mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium text-gray-500">No vehicles found</p>
                        <p className="text-sm">Try adjusting your search or add a new vehicle</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FleetVehicles;