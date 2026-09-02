import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaTruck, 
    FaSignOutAlt, 
    FaArrowLeft, 
    FaEdit, 
    FaTrash, 
    FaCalendar, 
    FaUser, 
    FaGasPump, 
    FaWeightHanging, 
    FaWrench, 
    FaRoad, 
    FaBars,
    FaChartLine,
    FaRoute,
    FaUsers,
    FaBox,
    FaMapMarkerAlt,
    FaUserCog
} from 'react-icons/fa';  // ❌ REMOVED FaChartLine

const VehicleDetail = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [maintenanceHistory, setMaintenanceHistory] = useState([]);
    const [tripHistory, setTripHistory] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchVehicleData();
    }, [id]);

    const fetchVehicleData = async () => {
        try {
            setLoading(true);
            const [vehicleRes, maintenanceRes, tripsRes] = await Promise.all([
                api.get(`/vehicles/${id}`),
                api.get('/maintenance/', { params: { vehicle_id: id } }),
                api.get('/trips/', { params: { vehicle_id: id } })
            ]);
            setVehicle(vehicleRes.data);
            setMaintenanceHistory(maintenanceRes.data || []);
            setTripHistory(tripsRes.data || []);
        } catch (error) {
            toast.error('Failed to fetch vehicle details');
            navigate('/vehicles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await api.delete(`/vehicles/${id}`);
            toast.success('Vehicle deleted successfully');
            navigate('/vehicles');
        } catch (error) {
            toast.error('Failed to delete vehicle');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Available': return 'badge-success';
            case 'Assigned': return 'badge-warning';
            case 'Maintenance': return 'badge-danger';
            case 'In Transit': return 'badge-info';
            default: return 'badge-gray';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-500">Vehicle not found</p>
            </div>
        );
    }

    const isAdminOrManager = user?.role === 'Admin' || user?.role === 'FleetManager';

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="container-custom mx-auto">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <FaBars className="text-gray-600 text-xl" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <FaTruck className="text-white text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    FleetFlow
                                </h1>
                            </div>
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

            <aside className={`fixed left-0 top-16 h-full bg-white shadow-lg transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
                <nav className="p-4 space-y-1">
                    <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaChartLine className="text-gray-400" /> {/* ✅ ADDED FaChartLine */}
                        <span className="text-sm">Dashboard</span>
                    </Link>
                    <Link to="/vehicles" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-semibold">
                        <FaTruck className="text-blue-600" />
                        <span className="text-sm">Vehicles</span>
                    </Link>
                    <Link to="/shipments" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaBox className="text-gray-400" />
                        <span className="text-sm">Shipments</span>
                    </Link>
                    <Link to="/trips" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaRoute className="text-gray-400" />
                        <span className="text-sm">Trips</span>
                    </Link>
                    <Link to="/drivers" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaUsers className="text-gray-400" />
                        <span className="text-sm">Drivers</span>
                    </Link>
                    <Link to="/maintenance" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaWrench className="text-gray-400" />
                        <span className="text-sm">Maintenance</span>
                    </Link>
                    <Link to="/analytics" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaChartLine className="text-gray-400" />
                        <span className="text-sm">Analytics</span>
                    </Link>
                    <Link to="/live-tracking" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="text-sm">Live Tracking</span>
                    </Link>
                    <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition">
                        <FaUserCog className="text-gray-400" />
                        <span className="text-sm">Profile</span>
                    </Link>
                </nav>
            </aside>

            <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6`}>
                <button onClick={() => navigate('/vehicles')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition">
                    <FaArrowLeft />
                    <span>Back to Vehicles</span>
                </button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{vehicle.registration_number}</h2>
                            <p className="text-sm text-gray-500">{vehicle.brand} {vehicle.model} - {vehicle.vehicle_type}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`badge ${getStatusColor(vehicle.status)} text-sm`}>
                                {vehicle.status}
                            </span>
                            {isAdminOrManager && (
                                <>
                                    <Link to={`/vehicles/edit/${vehicle.vehicle_id}`} className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition">
                                        <FaEdit />
                                        <span>Edit</span>
                                    </Link>
                                    <button onClick={handleDelete} className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition">
                                        <FaTrash />
                                        <span>Delete</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaCalendar className="text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Manufacture Year</p>
                                        <p className="font-semibold text-gray-900">{vehicle.manufacture_year || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaGasPump className="text-green-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Fuel Type</p>
                                        <p className="font-semibold text-gray-900">{vehicle.fuel_type || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaWeightHanging className="text-purple-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Capacity</p>
                                        <p className="font-semibold text-gray-900">{vehicle.capacity_kg || '-'} kg</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaUser className="text-yellow-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Assigned Driver</p>
                                        <p className="font-semibold text-gray-900">{vehicle.driver_name || 'Unassigned'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaWrench className="text-red-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Last Maintenance</p>
                                        <p className="font-semibold text-gray-900">{vehicle.last_maintenance_date ? new Date(vehicle.last_maintenance_date).toLocaleDateString() : '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-3">
                                    <FaRoad className="text-indigo-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Total Trips</p>
                                        <p className="font-semibold text-gray-900">{tripHistory.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {vehicle.notes && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                <p className="text-sm text-gray-700"><strong>Notes:</strong> {vehicle.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <FaRoad className="text-blue-500" />
                            <span>Trip History</span>
                        </h3>
                    </div>
                    {tripHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No trips recorded for this vehicle
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Destination</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Distance</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {tripHistory.slice(0, 5).map((trip) => (
                                        <tr key={trip.trip_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{trip.destination}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(trip.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{trip.distance_km || '-'} km</td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${trip.status === 'Completed' ? 'badge-success' : trip.status === 'In Transit' ? 'badge-warning' : 'badge-primary'}`}>
                                                    {trip.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <FaWrench className="text-red-500" />
                            <span>Maintenance History</span>
                        </h3>
                    </div>
                    {maintenanceHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No maintenance records for this vehicle
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {maintenanceHistory.slice(0, 5).map((record) => (
                                        <tr key={record.maintenance_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{record.maintenance_type}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(record.scheduled_date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${record.status === 'Completed' ? 'badge-success' : record.status === 'In Progress' ? 'badge-warning' : 'badge-primary'}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">₹{record.cost || '0'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default VehicleDetail;