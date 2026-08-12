import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, logout } = useAuth();
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
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      const data = response.data || [];
      setVehicles(data);
      
      const newStats = { total: data.length, available: 0, assigned: 0, maintenance: 0, inTransit: 0 };
      data.forEach(v => {
        switch(v.status) {
          case 'Available': newStats.available++; break;
          case 'Assigned': newStats.assigned++; break;
          case 'Maintenance': newStats.maintenance++; break;
          case 'In Transit': newStats.inTransit++; break;
        }
      });
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">FleetFlow</h1>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
              <Link to="/vehicles" className="text-gray-700 hover:text-blue-600">Vehicles</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.full_name}</span>
              <span className="text-sm text-gray-500">({user?.role})</span>
              <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fleet Dashboard</h2>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 shadow rounded-lg p-6">
            <p className="text-sm font-medium text-green-800">Available</p>
            <p className="mt-1 text-3xl font-semibold text-green-600">{stats.available}</p>
          </div>
          <div className="bg-yellow-50 shadow rounded-lg p-6">
            <p className="text-sm font-medium text-yellow-800">Assigned</p>
            <p className="mt-1 text-3xl font-semibold text-yellow-600">{stats.assigned}</p>
          </div>
          <div className="bg-red-50 shadow rounded-lg p-6">
            <p className="text-sm font-medium text-red-800">Maintenance</p>
            <p className="mt-1 text-3xl font-semibold text-red-600">{stats.maintenance}</p>
          </div>
          <div className="bg-blue-50 shadow rounded-lg p-6">
            <p className="text-sm font-medium text-blue-800">In Transit</p>
            <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.inTransit}</p>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Vehicles</h3>
          </div>
          <div className="border-t border-gray-200">
            {vehicles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No vehicles found. Add your first vehicle!
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {vehicles.slice(0, 5).map((v) => (
                  <li key={v.vehicle_id} className="px-4 py-4 sm:px-6 flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">{v.registration_number}</p>
                      <p className="text-sm text-gray-500">{v.brand} {v.model}</p>
                    </div>
                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                      v.status === 'Available' ? 'bg-green-100 text-green-800' :
                      v.status === 'Assigned' ? 'bg-yellow-100 text-yellow-800' :
                      v.status === 'Maintenance' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {v.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;