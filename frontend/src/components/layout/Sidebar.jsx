// frontend/src/components/layout/Sidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaHome, 
    FaTruck, 
    FaUser, 
    FaBox, 
    FaRoute, 
    FaWrench, 
    FaGasPump,
    FaFileAlt,
    FaMapMarkerAlt,
    FaSignOutAlt,
    FaUsers,
    FaUserClock,
    FaChartBar
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();
    
    const menuItems = [
    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { path: '/trips-routes', icon: FaRoute, label: 'Trips & Routes' },
    { path: '/fleet-vehicles', icon: FaTruck, label: 'Fleet Vehicles' },
    { path: '/driver-directory', icon: FaUsers, label: 'Drivers Directory' },
    { path: '/driver-attendance', icon: FaUserClock, label: 'Driver Attendance' },
    { path: '/shipments', icon: FaBox, label: 'Shipments' },  // ✅ ADDED
    { path: '/live-tracking', icon: FaMapMarkerAlt, label: 'Live Tracking' },
    { path: '/maintenance-logs', icon: FaWrench, label: 'Maintenance & Fuel' },
    { path: '/reports', icon: FaFileAlt, label: 'Reports & Export' },
];

    return (
        <div className="w-56 bg-white shadow-lg h-screen flex flex-col flex-shrink-0 overflow-y-auto">
            <div className="p-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-blue-600">Fleet</span>
                    <span className="text-gray-800">Flow</span>
                </h2>
                <nav className="space-y-0.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || 
                                       location.pathname.startsWith(item.path + '/');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${
                                    isActive 
                                        ? 'bg-blue-50 text-blue-600' 
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Icon className={`text-base ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
            
            <div className="mt-auto p-4 border-t border-gray-200">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition text-sm"
                >
                    <FaSignOutAlt className="text-base" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;