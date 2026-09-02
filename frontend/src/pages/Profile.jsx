import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: '',
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put('/auth/me', formData);
            updateUser(response.data);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordData.new_password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await api.put('/auth/me', {
                current_password: passwordData.current_password,
                password: passwordData.new_password,
            });
            toast.success('Password updated successfully!');
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: '',
            });
            setShowPasswordForm(false);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                    >
                        <FaEdit />
                        <span>Edit Profile</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="text-white">
                            <h3 className="text-xl font-bold">{user?.full_name}</h3>
                            <p className="text-blue-100">{user?.role}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                <FaUser className="text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="font-medium text-gray-900">{user?.full_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                <FaEnvelope className="text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                <FaPhone className="text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                <span className="text-gray-400 font-semibold">Role</span>
                                <div>
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-medium text-gray-900">{user?.role}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
                            </button>

                            {showPasswordForm && (
                                <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4 p-4 border border-gray-200 rounded-xl">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            name="current_password"
                                            value={passwordData.current_password}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            name="new_password"
                                            value={passwordData.new_password}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            minLength="6"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={passwordData.confirm_password}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;