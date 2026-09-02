import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useAuth();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} user={user} />
            <div className="flex">
                <Sidebar isOpen={sidebarOpen} user={user} />
                <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6`}>
                    <div className="max-w-7xl mx-auto">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;