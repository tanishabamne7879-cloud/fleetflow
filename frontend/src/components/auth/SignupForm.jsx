import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SignupForm = ({ onSuccess, onSwitchToLogin }) => {
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'Driver',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const roles = [
        { value: 'Admin', label: 'Admin' },
        { value: 'FleetManager', label: 'Fleet Manager' },
        { value: 'Dispatcher', label: 'Dispatcher' },
        { value: 'Driver', label: 'Driver' },
    ];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.full_name) {
            newErrors.full_name = 'Full name is required';
        } else if (formData.full_name.length < 2) {
            newErrors.full_name = 'Name must be at least 2 characters';
        }
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            await signup(formData);
            toast.success('Account created! Please check your email for OTP.');
            if (onSuccess) onSuccess();
        } catch (error) {
            // Error handled in context
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter your full name"
                    />
                </div>
                {errors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter your email"
                    />
                </div>
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Create a password (min 6 chars)"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="text-gray-400" />
                    </div>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter your phone number"
                    />
                </div>
                {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                </label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                    {roles.map(role => (
                        <option key={role.value} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="spinner-sm mr-2"></div>
                        Creating account...
                    </div>
                ) : (
                    'Create Account'
                )}
            </button>

            <div className="text-center">
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                    Already have an account? Sign in
                </button>
            </div>
        </form>
    );
};

export default SignupForm;