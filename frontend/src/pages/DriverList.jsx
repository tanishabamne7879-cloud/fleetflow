import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaEdit,
  FaEye,
  FaFilter,
  FaIdCard,
  FaPhone,
  FaPlus,
  FaSearch,
  FaSignOutAlt,
  FaTimesCircle,
  FaTrash,
  FaUserCheck,
  FaUsers,
  FaUserTimes,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const DriverList = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [drivers, search, filter]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/drivers/");
      setDrivers(response.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...drivers];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.full_name?.toLowerCase().includes(searchLower)
        || d.email?.toLowerCase().includes(searchLower)
        || d.license_number?.toLowerCase().includes(searchLower)
        || d.phone?.toLowerCase().includes(searchLower)
      );
    }

    if (filter === "available") {
      filtered = filtered.filter(d => d.is_available);
    } else if (filter === "unavailable") {
      filtered = filtered.filter(d => !d.is_available);
    }

    setFilteredDrivers(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    try {
      await api.delete(`/drivers/${id}`);
      toast.success("Driver deleted successfully");
      fetchDrivers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete driver");
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      // ✅ FIX: Send correct data format
      await api.patch(`/drivers/${id}/availability`, {
        is_available: !currentStatus,
      });
      toast.success(`Driver ${!currentStatus ? "activated" : "deactivated"} successfully`);
      fetchDrivers();
    } catch (error) {
      console.error("Error updating driver status:", error);
      toast.error("Failed to update driver status");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const statusCounts = drivers.reduce((acc, d) => {
    acc[d.is_available ? "available" : "unavailable"] = (acc[d.is_available ? "available" : "unavailable"] || 0) + 1;
    return acc;
  }, { available: 0, unavailable: 0 });

  if (loading) {
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
                  <FaUsers className="text-white text-xl" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FleetFlow
                </h1>
              </div>
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
              <Link to="/drivers" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">Drivers</Link>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-custom mx-auto py-8">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Drivers</h2>
            <p className="text-sm text-gray-500">Manage all drivers in your fleet</p>
          </div>
          <Link
            to="/drivers/add"
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition hover:scale-105"
          >
            <FaPlus />
            <span>Add Driver</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <FaUserCheck className="text-green-600 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold text-green-700">{statusCounts.available || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <FaUserTimes className="text-red-600 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Unavailable</p>
                <p className="text-2xl font-bold text-red-700">{statusCounts.unavailable || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, license..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              <FaFilter />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  All Drivers
                </button>
                <button
                  onClick={() => setFilter("available")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filter === "available" ? "bg-green-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => setFilter("unavailable")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filter === "unavailable" ? "bg-red-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Unavailable
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {filteredDrivers.length === 0
            ? (
              <div className="text-center py-16">
                <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No drivers found</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
                <Link to="/drivers/add" className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium">
                  Add your first driver →
                </Link>
              </div>
            )
            : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        License
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDrivers.map((driver) => (
                      <tr key={driver.driver_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {driver.full_name?.charAt(0) || "D"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{driver.full_name}</p>
                              <p className="text-sm text-gray-500">{driver.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <FaIdCard className="text-gray-400" />
                            <span className="text-sm text-gray-600">{driver.license_number || "-"}</span>
                          </div>
                          <p className="text-xs text-gray-400">{driver.experience_years || "N/A"} years exp.</p>
                        </td>
                        <td className="px-6 py-4">
                          {driver.phone && (
                            <div className="flex items-center space-x-2">
                              <FaPhone className="text-gray-400" />
                              <span className="text-sm text-gray-600">{driver.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${driver.is_available ? "badge-success" : "badge-danger"}`}>
                            {driver.is_available ? "Available" : "Unavailable"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() =>
                                toggleAvailability(driver.driver_id, driver.is_available)}
                              className={`p-2 rounded-lg transition ${
                                driver.is_available
                                  ? "text-red-500 hover:bg-red-50"
                                  : "text-green-500 hover:bg-green-50"
                              }`}
                              title={driver.is_available ? "Deactivate" : "Activate"}
                            >
                              {driver.is_available ? <FaTimesCircle /> : <FaCheckCircle />}
                            </button>
                            <Link
                              to={`/drivers/${driver.driver_id}`}
                              className="text-blue-600 hover:text-blue-800"
                              title="View"
                            >
                              <FaEye />
                            </Link>
                            <Link
                              to={`/drivers/edit/${driver.driver_id}`}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Edit"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() =>
                                handleDelete(driver.driver_id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
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
    </div>
  );
};

export default DriverList;
