import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTruck, FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        toast.success('Logged out successfully');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            <FaBars className="text-gray-600 text-xl" />
                        </button>
                        <Link to="/dashboard" className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <FaTruck className="text-white text-xl" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                FleetFlow
                            </h1>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
                            <FaBell className="text-gray-600 text-xl" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                                    <p className="text-xs text-gray-500">{user?.role}</p>
                                </div>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 slide-up">
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <FaUserCircle className="text-gray-400" />
                                        <span className="text-sm text-gray-700">Profile</span>
                                    </Link>
                                    <hr className="my-1" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition w-full text-left"
                                    >
                                        <FaSignOutAlt className="text-red-400" />
                                        <span className="text-sm text-red-600">Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;