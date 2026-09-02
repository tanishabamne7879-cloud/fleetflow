import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaHome,
    FaTruck,
    FaBox,
    FaRoute,
    FaUsers,
    FaWrench,
    FaChartLine,
    FaMapMarkerAlt,
    FaUserCog
} from 'react-icons/fa';

const Sidebar = ({ isOpen }) => {
    const menuItems = [
        { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/vehicles', icon: FaTruck, label: 'Vehicles' },
        { path: '/shipments', icon: FaBox, label: 'Shipments' },
        { path: '/trips', icon: FaRoute, label: 'Trips' },
        { path: '/drivers', icon: FaUsers, label: 'Drivers' },
        { path: '/maintenance', icon: FaWrench, label: 'Maintenance' },
        { path: '/analytics', icon: FaChartLine, label: 'Analytics' },
        { path: '/live-tracking', icon: FaMapMarkerAlt, label: 'Live Tracking' },
        { path: '/profile', icon: FaUserCog, label: 'Profile' },
    ];

    return (
        <aside className={`fixed left-0 top-16 h-full bg-white shadow-lg transition-all duration-300 z-40 ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
            <nav className="p-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                            }`
                        }
                    >
                        <item.icon className={`text-lg ${({ isActive }) => isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;