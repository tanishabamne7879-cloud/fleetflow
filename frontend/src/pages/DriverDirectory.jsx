// frontend/src/pages/DriverDirectory.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaSearch, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt,
    FaUserPlus, FaEdit, FaTrash, FaEye
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DriverDirectory = () => {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await api.get('/drivers/');
            setDrivers(response.data || []);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            toast.error('Failed to fetch drivers');
        } finally {
            setLoading(false);
        }
    };

    const filteredDrivers = drivers.filter(driver =>
        driver.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone?.includes(searchTerm) ||
        driver.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading drivers...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Drivers Directory</h1>
                    <p className="text-sm text-gray-500">Manage and view all drivers in your fleet</p>
                </div>
                <Link
                    to="/drivers/add"
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                    <FaUserPlus className="text-sm" />
                    <span>Add Driver</span>
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone, or license number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrivers.length > 0 ? (
                    filteredDrivers.map((driver) => (
                        <div key={driver.driver_id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
                            <div className="flex items-start space-x-4">
                                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                                    {driver.full_name?.charAt(0) || 'D'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">{driver.full_name || 'Unknown'}</h3>
                                    <p className="text-sm text-gray-500 truncate">{driver.email || 'No email'}</p>
                                    <div className="flex items-center mt-1 space-x-3 text-sm text-gray-500">
                                        <span className="flex items-center">
                                            <FaPhone className="mr-1 text-xs" />
                                            {driver.phone || 'N/A'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            driver.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {driver.is_available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>
                                    <div className="flex items-center mt-2 space-x-2">
                                        <Link
                                            to={`/drivers/${driver.driver_id}`}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            <FaEye className="text-sm" />
                                        </Link>
                                        <Link
                                            to={`/drivers/edit/${driver.driver_id}`}
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
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                    <span className="px-2 py-1 bg-gray-100 rounded-lg">License: {driver.license_number || 'N/A'}</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded-lg">Status: {driver.status || 'Active'}</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded-lg">Exp: {driver.experience_years || '0'} yrs</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        <FaUser className="text-4xl mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium text-gray-500">No drivers found</p>
                        <p className="text-sm">Try adjusting your search or add a new driver</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverDirectory;