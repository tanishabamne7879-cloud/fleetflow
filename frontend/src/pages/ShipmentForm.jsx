import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaBars,
  FaBox,
  FaCalendar,
  FaChartLine,
  FaMapMarkerAlt,
  FaPhone,
  FaRoute,
  FaSignOutAlt,
  FaTruck,
  FaUser,
  FaUserCog,
  FaUsers,
  FaWeightHanging,
  FaWrench,
} from "react-icons/fa"; // ❌ REMOVED FaChartLine
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ShipmentForm = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    tracking_number: "",
    source: "",
    destination: "",
    customer_name: "",
    customer_phone: "",
    shipment_weight: "",
    vehicle_id: "",
    driver_id: "",
    expected_delivery: "",
    status: "Created",
    notes: "",
  });

  const statusOptions = [
    { value: "Created", label: "Created" },
    { value: "Assigned", label: "Assigned" },
    { value: "InTransit", label: "In Transit" },
    { value: "Delayed", label: "Delayed" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    fetchOptions();
    if (isEdit) fetchShipment();
  }, [id]);

  const fetchOptions = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        api.get("/vehicles/"),
        api.get("/drivers/"),
      ]);
      setVehicles(vehiclesRes.data || []);
      setDrivers(driversRes.data || []);
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const fetchShipment = async () => {
    try {
      const response = await api.get(`/shipments/${id}`);
      const data = response.data;
      setFormData({
        tracking_number: data.tracking_number || "",
        source: data.source || "",
        destination: data.destination || "",
        customer_name: data.customer_name || "",
        customer_phone: data.customer_phone || "",
        shipment_weight: data.shipment_weight || "",
        vehicle_id: data.vehicle_id || "",
        driver_id: data.driver_id || "",
        expected_delivery: data.expected_delivery || "",
        status: data.status || "Created",
        notes: data.notes || "",
      });
    } catch (error) {
      toast.error("Failed to fetch shipment");
      navigate("/shipments");
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
        shipment_weight: formData.shipment_weight ? parseFloat(formData.shipment_weight) : null,
        expected_delivery: formData.expected_delivery ? new Date(formData.expected_delivery) : null,
        vehicle_id: formData.vehicle_id || null,
        driver_id: formData.driver_id || null,
      };

      if (isEdit) {
        await api.put(`/shipments/${id}`, data);
        toast.success("Shipment updated successfully!");
      } else {
        await api.post("/shipments/", data);
        toast.success("Shipment created successfully!");
      }
      navigate("/shipments");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
                  <FaBox className="text-white text-xl" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FleetFlow
                </h1>
              </div>
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

      <aside
        className={`fixed left-0 top-16 h-full bg-white shadow-lg transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        <nav className="p-4 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaChartLine className="text-gray-400" /> {/* ✅ ADDED FaChartLine */}
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link
            to="/vehicles"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaTruck className="text-gray-400" />
            <span className="text-sm">Vehicles</span>
          </Link>
          <Link
            to="/shipments"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-semibold"
          >
            <FaBox className="text-blue-600" />
            <span className="text-sm">Shipments</span>
          </Link>
          <Link
            to="/trips"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaRoute className="text-gray-400" />
            <span className="text-sm">Trips</span>
          </Link>
          <Link
            to="/drivers"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaUsers className="text-gray-400" />
            <span className="text-sm">Drivers</span>
          </Link>
          <Link
            to="/maintenance"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaWrench className="text-gray-400" />
            <span className="text-sm">Maintenance</span>
          </Link>
          <Link
            to="/analytics"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaChartLine className="text-gray-400" />
            <span className="text-sm">Analytics</span>
          </Link>
          <Link
            to="/live-tracking"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaMapMarkerAlt className="text-gray-400" />
            <span className="text-sm">Live Tracking</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition"
          >
            <FaUserCog className="text-gray-400" />
            <span className="text-sm">Profile</span>
          </Link>
        </nav>
      </aside>

      <main className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} p-6`}>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/shipments")}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition"
          >
            <FaArrowLeft />
            <span>Back to Shipments</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 slide-up">
            <h3 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Shipment" : "Add New Shipment"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? "Update shipment details" : "Enter shipment information"}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number *
                  </label>
                  <input
                    type="text"
                    name="tracking_number"
                    required
                    value={formData.tracking_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="TRK-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="source"
                      required
                      value={formData.source}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Mumbai, India"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="destination"
                      required
                      value={formData.destination}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Delhi, India"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaWeightHanging className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="shipment_weight"
                      value={formData.shipment_weight}
                      onChange={handleChange}
                      min="0"
                      step="0.5"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      name="expected_delivery"
                      value={formData.expected_delivery}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Vehicle
                  </label>
                  <select
                    name="vehicle_id"
                    value={formData.vehicle_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>
                        {v.registration_number} - {v.brand} {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Driver
                  </label>
                  <select
                    name="driver_id"
                    value={formData.driver_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map(d => (
                      <option key={d.driver_id} value={d.driver_id}>
                        {d.full_name} - {d.license_number || "No license"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Additional notes about the shipment..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/shipments")}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? (
                      <div className="flex items-center">
                        <div className="spinner-sm mr-2"></div>
                        Saving...
                      </div>
                    )
                    : (
                      isEdit ? "Update Shipment" : "Create Shipment"
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

export default ShipmentForm;
