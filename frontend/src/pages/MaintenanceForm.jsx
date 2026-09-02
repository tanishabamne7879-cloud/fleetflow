import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaWrench, FaSignOutAlt, FaArrowLeft, FaCalendar, 
    FaTruck, FaMoneyBill, FaClipboardList, FaSave
} from 'react-icons/fa';

const MaintenanceForm = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [vehicles, setVehicles] = useState([]);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        maintenance_type: 'Oil Change',
        description: '',
        scheduled_date: '',
        cost: '',
        notes: '',
        status: 'Scheduled'
    });

    const maintenanceTypes = [
        'Oil Change',
        'Tire Replacement',
        'Engine Service',
        'Brake Service',
        'General Inspection',
        'Transmission Service',
        'Cooling System',
        'Electrical System',
        'Exhaust System',
        'Suspension Service'
    ];

    useEffect(() => {
        fetchVehicles();
        if (isEdit) fetchMaintenance();
    }, [id]);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles/');
            setVehicles(response.data || []);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Failed to fetch vehicles');
        }
    };

    const fetchMaintenance = async () => {
        try {
            const response = await api.get(`/maintenance/${id}`);
            const data = response.data;
            setFormData({
                vehicle_id: data.vehicle_id || '',
                maintenance_type: data.maintenance_type || 'Oil Change',
                description: data.description || '',
                scheduled_date: data.scheduled_date ? new Date(data.scheduled_date).toISOString().slice(0, 16) : '',
                cost: data.cost || '',
                notes: data.notes || '',
                status: data.status || 'Scheduled'
            });
        } catch (error) {
            toast.error('Failed to fetch maintenance record');
            navigate('/maintenance');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = {
                ...formData,
                cost: formData.cost ? parseFloat(formData.cost) : null,
                status: formData.status || 'Scheduled',
            };
            
            if (isEdit) {
                await api.put(`/maintenance/${id}`, data);
                toast.success('Maintenance record updated successfully!');
            } else {
                await api.post('/maintenance/', data);
                toast.success('Maintenance record created successfully!');
            }
            navigate('/maintenance');
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
                                    <FaWrench className="text-white text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    FleetFlow
                                </h1>
                            </div>
                            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
                            <Link to="/maintenance" className="text-gray-600 hover:text-blue-600 transition">Maintenance</Link>
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
                    <button onClick={() => navigate('/maintenance')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition">
                        <FaArrowLeft />
                        <span>Back to Maintenance</span>
                    </button>

                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 slide-up">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {isEdit ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEdit ? 'Update maintenance details' : 'Schedule vehicle maintenance'}
                        </p>
                        
                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaTruck className="text-gray-400" />
                                        </div>
                                        <select
                                            name="vehicle_id"
                                            required
                                            value={formData.vehicle_id}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                        >
                                            <option value="">Select Vehicle</option>
                                            {vehicles.map(v => (
                                                <option key={v.vehicle_id} value={v.vehicle_id}>
                                                    {v.registration_number} - {v.brand} {v.model}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaClipboardList className="text-gray-400" />
                                        </div>
                                        <select
                                            name="maintenance_type"
                                            required
                                            value={formData.maintenance_type}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                        >
                                            {maintenanceTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaCalendar className="text-gray-400" />
                                        </div>
                                        <input
                                            type="datetime-local"
                                            name="scheduled_date"
                                            required
                                            value={formData.scheduled_date}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost (₹)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaMoneyBill className="text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            name="cost"
                                            value={formData.cost}
                                            onChange={handleChange}
                                            min="0"
                                            step="100"
                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            placeholder="Enter cost"
                                        />
                                    </div>
                                </div>

                                {isEdit && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                                        >
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Describe the maintenance work..."
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        placeholder="Additional notes..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/maintenance')}
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
                                        <div className="flex items-center space-x-2">
                                            <FaSave />
                                            <span>{isEdit ? 'Update Record' : 'Create Record'}</span>
                                        </div>
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

export default MaintenanceForm;