import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaUsers, FaSignOutAlt, FaArrowLeft, FaUser, FaIdCard, FaPhone, FaEnvelope } from 'react-icons/fa';

const DriverForm = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        user_id: '',
        license_number: '',
        license_expiry: '',
        experience_years: '',
        address: '',
        phone: '',
        emergency_contact: '',
        is_available: true,
    });

    useEffect(() => {
        fetchUsers();
        if (isEdit) fetchDriver();
    }, [id]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/');
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchDriver = async () => {
        try {
            const response = await api.get(`/drivers/${id}`);
            const data = response.data;
            setFormData({
                user_id: data.user_id || '',
                license_number: data.license_number || '',
                license_expiry: data.license_expiry || '',
                experience_years: data.experience_years || '',
                address: data.address || '',
                phone: data.phone || '',
                emergency_contact: data.emergency_contact || '',
                is_available: data.is_available !== undefined ? data.is_available : true,
            });
        } catch (error) {
            toast.error('Failed to fetch driver');
            navigate('/drivers');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/drivers/${id}`, formData);
                toast.success('Driver updated successfully!');
            } else {
                await api.post('/drivers/', formData);
                toast.success('Driver created successfully!');
            }
            navigate('/drivers');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (fetching) {
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
                                    <FaUsers className="text-white text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    FleetFlow
                                </h1>
                            </div>
                            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
                            <Link to="/drivers" className="text-gray-600 hover:text-blue-600 transition">Drivers</Link>
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
                <div className="max-w-3xl mx-auto">
                    <button onClick={() => navigate('/drivers')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition">
                        <FaArrowLeft />
                        <span>Back to Drivers</span>
                    </button>

                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 slide-up">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {isEdit ? 'Edit Driver' : 'Add New Driver'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEdit ? 'Update driver details' : 'Enter driver information'}
                        </p>
                        
                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {!isEdit && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select User *</label>
                                        <select
                                            name="user_id"
                                            required
                                            value={formData.user_id}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                        >
                                            <option value="">Select a user</option>
                                            {users.map(u => (
                                                <option key={u.user_id} value={u.user_id}>
                                                    {u.full_name} ({u.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaIdCard className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="license_number"
                                            value={formData.license_number}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="DL-123456"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                                    <input
                                        type="date"
                                        name="license_expiry"
                                        value={formData.license_expiry}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                    <input
                                        type="text"
                                        name="experience_years"
                                        value={formData.experience_years}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaPhone className="text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                                    <input
                                        type="tel"
                                        name="emergency_contact"
                                        value={formData.emergency_contact}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="9876543211"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Enter driver address"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            name="is_available"
                                            checked={formData.is_available}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Driver is available for assignments</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/drivers')}
                                    className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="spinner-sm mr-2"></div>
                                            Saving...
                                        </div>
                                    ) : (
                                        isEdit ? 'Update Driver' : 'Create Driver'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverForm;