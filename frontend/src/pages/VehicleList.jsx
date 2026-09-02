import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaTruck, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const VehicleList = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const statusOptions = ['Available', 'Assigned', 'Maintenance', 'InTransit'];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vehicles/');
      setVehicles(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete');
    }
  };

  const updateVehicleStatus = async (id, newStatus) => {
    try {
      await api.patch(`/vehicles/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
        case 'Available': return 'badge-success';
        case 'Assigned': return 'badge-warning';
        case 'Maintenance': return 'badge-danger';
        case 'InTransit': return 'badge-info';  // ✅ FIX
        default: return 'badge-gray';
    }
};

  const filteredVehicles = vehicles.filter(v => {
    const matchStatus = filter === 'all' || v.status === filter;
    const matchSearch = v.registration_number?.toLowerCase().includes(search.toLowerCase()) ||
                        v.brand?.toLowerCase().includes(search.toLowerCase()) ||
                        v.model?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'FleetManager';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicles</h2>
          <p className="text-sm text-gray-500">Manage your fleet vehicles</p>
        </div>
        {isAdminOrManager && (
          <Link to="/vehicles/add" className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition hover:scale-105">
            <FaPlus />
            <span>Add Vehicle</span>
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search vehicles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 min-w-[200px]"
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            All ({vehicles.length})
          </button>
          {statusOptions.map(status => (
            <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              {status} ({vehicles.filter(v => v.status === status).length})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16">
            <FaTruck className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No vehicles found</p>
            {isAdminOrManager && (
              <Link to="/vehicles/add" className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium">
                Add your first vehicle →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.vehicle_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{vehicle.registration_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{vehicle.brand} {vehicle.model}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{vehicle.vehicle_type}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <select
                          value={vehicle.status}
                          onChange={(e) => updateVehicleStatus(vehicle.vehicle_id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <Link to={`/vehicles/${vehicle.vehicle_id}`} className="text-blue-600 hover:text-blue-800" title="View">
                          <FaEye />
                        </Link>
                        {isAdminOrManager && (
                          <>
                            <Link to={`/vehicles/edit/${vehicle.vehicle_id}`} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                              <FaEdit />
                            </Link>
                            <button onClick={() => handleDelete(vehicle.vehicle_id)} className="text-red-600 hover:text-red-800" title="Delete">
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleList;