import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  FaTruck, FaCheckCircle, FaWrench, FaRoad, 
  FaPlus, FaCar
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    assigned: 0,
    maintenance: 0,
    inTransit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, statsRes] = await Promise.all([
        api.get('/vehicles/'),
        api.get('/vehicles/stats')
      ]);
      setVehicles(vehiclesRes.data || []);
      setStats(statsRes.data || {
        total: 0,
        available: 0,
        assigned: 0,
        maintenance: 0,
        inTransit: 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Vehicles', value: stats.total, icon: FaTruck, color: 'from-blue-500 to-blue-700', bg: 'bg-blue-50' },
    { title: 'Available', value: stats.available, icon: FaCheckCircle, color: 'from-green-500 to-green-700', bg: 'bg-green-50' },
    { title: 'Assigned', value: stats.assigned, icon: FaRoad, color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50' },
    { title: 'Maintenance', value: stats.maintenance, icon: FaWrench, color: 'from-red-500 to-pink-500', bg: 'bg-red-50' },
    { title: 'In Transit', value: stats.inTransit, icon: FaCar, color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-8 fade-in">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, <span className="gradient-text">{user?.full_name}</span>!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your fleet today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className={`${stat.bg} rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                <stat.icon />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Vehicles */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden fade-in">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Vehicles</h3>
            <p className="text-sm text-gray-500">Latest vehicles added to your fleet</p>
          </div>
          <Link 
            to="/vehicles/add" 
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <FaPlus />
            <span>Add Vehicle</span>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {vehicles.length === 0 ? (
            <div className="text-center py-16">
              <FaTruck className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No vehicles in your fleet yet</p>
              <Link to="/vehicles/add" className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium">
                Add your first vehicle →
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.slice(0, 5).map((vehicle) => (
                  <tr key={vehicle.vehicle_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{vehicle.registration_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{vehicle.brand} {vehicle.model}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{vehicle.vehicle_type}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        vehicle.status === 'Available' ? 'badge-success' :
                        vehicle.status === 'Assigned' ? 'badge-warning' :
                        vehicle.status === 'Maintenance' ? 'badge-danger' :
                        'badge-info'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/vehicles/${vehicle.vehicle_id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {vehicles.length > 5 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Link to="/vehicles" className="text-blue-600 hover:text-blue-800 font-medium">
              View all vehicles →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;