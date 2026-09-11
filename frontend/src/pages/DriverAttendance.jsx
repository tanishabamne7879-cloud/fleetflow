// frontend/src/pages/DriverAttendance.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaSearch, FaUserCheck, FaUserTimes, FaCalendarAlt,
    FaClock, FaUsers, FaFilter, FaSync, FaEdit, FaCheck
} from 'react-icons/fa';

const DriverAttendance = () => {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState({});
    const [showRoster, setShowRoster] = useState(false);

    useEffect(() => {
        fetchDrivers();
        fetchAttendance();
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

    const fetchAttendance = async () => {
        try {
            // Fetch attendance for today
            const response = await api.get('/attendance/', {
                params: { date: attendanceDate }
            });
            // Convert to object for easy lookup
            const attMap = {};
            response.data.forEach(a => {
                attMap[a.driver_id] = a;
            });
            setAttendance(attMap);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            // If endpoint doesn't exist, just use driver availability
            const attMap = {};
            drivers.forEach(d => {
                attMap[d.driver_id] = { 
                    status: d.is_available ? 'Present' : 'Absent',
                    driver_id: d.driver_id
                };
            });
            setAttendance(attMap);
        }
    };

    const updateAttendance = async (driverId, status) => {
        try {
            await api.post('/attendance/', {
                driver_id: driverId,
                date: attendanceDate,
                status: status,
                check_in: status === 'Present' ? new Date().toISOString() : null,
                check_out: status === 'Absent' ? new Date().toISOString() : null
            });
            toast.success(`Attendance updated to ${status}`);
            fetchAttendance();
        } catch (error) {
            // If endpoint doesn't exist, update locally
            setAttendance(prev => ({
                ...prev,
                [driverId]: { ...prev[driverId], status: status }
            }));
            toast.success(`Attendance marked as ${status} (local)`);
        }
    };

    const stats = {
        total: drivers.length,
        present: Object.values(attendance).filter(a => a.status === 'Present').length,
        onLeave: Object.values(attendance).filter(a => a.status === 'On Leave').length,
        absent: Object.values(attendance).filter(a => a.status === 'Absent').length,
        unused: drivers.length - Object.values(attendance).length
    };

    const filteredDrivers = drivers.filter(driver => 
        driver.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.license_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.driver_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading attendance...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Driver Attendance & Leave Management</h1>
                <p className="text-sm text-gray-500">Fleet wide attendance tracking, daily roster management, and leave approval workflow</p>
            </div>

            {/* Date & Actions */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <FaCalendarAlt className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">ATTENDANCE DATE:</span>
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => {
                                setAttendanceDate(e.target.value);
                                fetchAttendance();
                            }}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-blue-600 font-medium">
                            {new Date(attendanceDate).toDateString() === new Date().toDateString() ? 'Today' : new Date(attendanceDate).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={fetchAttendance}
                            className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition flex items-center space-x-1"
                        >
                            <FaSync className="text-xs" />
                            <span>Refresh</span>
                        </button>
                        <button 
                            onClick={() => setShowRoster(!showRoster)}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                        >
                            {showRoster ? 'Hide Roster' : 'Daily Attendance Roster'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <div className="bg-white rounded-xl shadow-sm p-3">
                    <p className="text-xs text-gray-500">TOTAL DRIVERS</p>
                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-green-500">
                    <p className="text-xs text-gray-500">PRESENT / AVAILABLE</p>
                    <p className="text-xl font-bold text-green-600">{stats.present}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-yellow-500">
                    <p className="text-xs text-gray-500">ON LEAVE</p>
                    <p className="text-xl font-bold text-yellow-600">{stats.onLeave}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-red-500">
                    <p className="text-xs text-gray-500">ABSENT</p>
                    <p className="text-xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border-l-4 border-gray-400">
                    <p className="text-xs text-gray-500">UNMARKED</p>
                    <p className="text-xl font-bold text-gray-600">{stats.unused}</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search driver name, license #, remarks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Drivers Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Driver Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duty Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredDrivers.length > 0 ? (
                                filteredDrivers.map((driver) => {
                                    const att = attendance[driver.driver_id];
                                    const status = att?.status || 'Unmarked';
                                    return (
                                        <tr key={driver.driver_id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                        {driver.full_name?.charAt(0) || 'D'}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {driver.full_name || 'Unknown Driver'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-sm text-gray-600">
                                                {driver.license_number || 'N/A'}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    driver.is_available ? 'bg-green-100 text-green-800' :
                                                    driver.status === 'Off Duty' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {driver.is_available ? 'Active' : driver.status || 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    status === 'Present' ? 'bg-green-100 text-green-800' :
                                                    status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                                                    status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => updateAttendance(driver.driver_id, 'Present')}
                                                        className={`p-1 rounded ${status === 'Present' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50 text-gray-400'}`}
                                                        title="Mark Present"
                                                    >
                                                        <FaCheck className="text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateAttendance(driver.driver_id, 'On Leave')}
                                                        className={`p-1 rounded ${status === 'On Leave' ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-yellow-50 text-gray-400'}`}
                                                        title="Mark On Leave"
                                                    >
                                                        <FaClock className="text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateAttendance(driver.driver_id, 'Absent')}
                                                        className={`p-1 rounded ${status === 'Absent' ? 'bg-red-100 text-red-600' : 'hover:bg-red-50 text-gray-400'}`}
                                                        title="Mark Absent"
                                                    >
                                                        <FaUserTimes className="text-sm" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-4 text-center text-gray-400 text-sm">
                                        No drivers found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DriverAttendance;