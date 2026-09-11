// frontend/src/components/layout/Navbar.jsx

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm px-4 py-3 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold text-gray-800">
                    Dashboard
                </h1>
            </div>
            <div className="flex items-center space-x-4">
                <button className="text-gray-500 hover:text-gray-700 transition relative">
                    <FaBell className="text-lg" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        3
                    </span>
                </button>
                
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                </div>
                
                <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Logout"
                >
                    <FaSignOutAlt className="text-xl" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;