import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaTruck, FaSignOutAlt, FaArrowLeft, FaBars, FaChartLine,FaRoute,FaUsers,FaWrench,FaBox,FaMapMarkerAlt,FaUserCog } from 'react-icons/fa';  // ❌ REMOVED FaChartLine

const VehicleForm = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    registration_number: '',
    vehicle_type: 'Truck',
    brand: '',
    model: '',
    manufacture_year: '',
    fuel_type: 'Diesel',
    capacity_kg: '',
    status: 'Available',
    assigned_driver_id: '',
    notes: '',
  });

  const statusOptions = [
    { value: 'Available', label: 'Available' },
    { value: 'Assigned', label: 'Assigned' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'InTransit', label: 'In Transit' }  // ✅ FIX: Value no space, Label with space
];

  const vehicleTypes = ['Truck', 'Van', 'Car', 'Motorcycle'];
  const fuelTypes = ['Diesel', 'Petrol', 'Electric', 'Hybrid'];

  useEffect(() => {
    fetchDrivers();
    if (isEdit) fetchVehicle();
  }, [id]);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers/');
      setDrivers(response.data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  const fetchVehicle = async () => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      const data = response.data;
      setFormData({
        registration_number: data.registration_number || '',
        vehicle_type: data.vehicle_type || 'Truck',
        brand: data.brand || '',
        model: data.model || '',
        manufacture_year: data.manufacture_year || '',
        fuel_type: data.fuel_type || 'Diesel',
        capacity_kg: data.capacity_kg || '',
        status: data.status || 'Available',
        assigned_driver_id: data.assigned_driver_id || '',
        notes: data.notes || '',
      });
    } catch (error) {
      toast.error('Failed to fetch vehicle');
      navigate('/vehicles');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        manufacture_year: formData.manufacture_year ? parseInt(formData.manufacture_year) : null,
        capacity_kg: formData.capacity_kg ? parseFloat(formData.capacity_kg) : null,
        assigned_driver_id: formData.assigned_driver_id || null,
      };
      
      if (isEdit) {
        await api.put(`/vehicles/${id}`, data);
        toast.success('Vehicle updated successfully!');
      } else {
        await api.post('/vehicles/', data);
        toast.success('Vehicle created successfully!');
      }
      navigate('/vehicles');
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
                <h1 className="text-2xl font-bold gradient-text">FleetFlow</h1>
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
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate('/vehicles')} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition">
            <FaArrowLeft />
            <span>Back to Vehicles</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 slide-up">
            <h3 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? 'Update vehicle details' : 'Enter vehicle information'}
            </p>
            
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                  <input
                    type="text"
                    name="registration_number"
                    required
                    value={formData.registration_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="KA-01-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
                  <select
                    name="vehicle_type"
                    required
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Tata, Mahindra, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Ace, Bolero, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacture Year</label>
                  <input
                    type="number"
                    name="manufacture_year"
                    value={formData.manufacture_year}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                  <select
                    name="fuel_type"
                    value={formData.fuel_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    {fuelTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg)</label>
                  <input
                    type="number"
                    name="capacity_kg"
                    value={formData.capacity_kg}
                    onChange={handleChange}
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
                  <select
                    name="assigned_driver_id"
                    value={formData.assigned_driver_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(d => (
                      <option key={d.driver_id} value={d.driver_id}>
                        {d.full_name} - {d.license_number || 'No license'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Additional notes about the vehicle..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/vehicles')}
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
                    isEdit ? 'Update Vehicle' : 'Create Vehicle'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VehicleForm;