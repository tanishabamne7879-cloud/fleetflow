// frontend/src/App.jsx

import React from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Layout
import Layout from "./components/layout/Layout";

// Public Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Protected Pages - New Pages
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import DriverAttendance from "./pages/DriverAttendance";
import DriverDirectory from "./pages/DriverDirectory";
import FleetVehicles from "./pages/FleetVehicles";
import FuelLogs from "./pages/FuelLogs";
import LiveTracking from "./pages/LiveTracking";
import MaintenanceLogs from "./pages/MaintenanceLogs";
import Reports from "./pages/Reports";
import TripsRoutes from "./pages/TripsRoutes";
import Profile from "./pages/Profile";

// Existing Pages
import VehicleList from "./pages/VehicleList";
import VehicleDetail from "./pages/VehicleDetail";
import VehicleForm from "./pages/VehicleForm";
import DriverList from "./pages/DriverList";
import DriverDetail from "./pages/DriverDetail";
import DriverForm from "./pages/DriverForm";
import ShipmentList from "./pages/ShipmentList";
import ShipmentDetail from "./pages/ShipmentDetail";
import ShipmentForm from "./pages/ShipmentForm";
import ShipmentRouteMap from "./pages/ShipmentRouteMap";
import TripDetail from "./pages/TripDetail";
import TripForm from "./pages/TripForm";
import Trips from "./pages/Trips";
import MaintenanceDetail from "./pages/MaintenanceDetail";
import MaintenanceForm from "./pages/MaintenanceForm";
import MaintenanceList from "./pages/MaintenanceList";
import FuelRecords from "./pages/FuelRecords";
import TrackingMap from "./pages/TrackingMap";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen bg-gray-50 overflow-hidden">
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes - New Pages */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
            <Route path="/driver-attendance" element={<ProtectedRoute><Layout><DriverAttendance /></Layout></ProtectedRoute>} />
            <Route path="/driver-directory" element={<ProtectedRoute><Layout><DriverDirectory /></Layout></ProtectedRoute>} />
            <Route path="/fleet-vehicles" element={<ProtectedRoute><Layout><FleetVehicles /></Layout></ProtectedRoute>} />
            <Route path="/fuel-logs" element={<ProtectedRoute><Layout><FuelLogs /></Layout></ProtectedRoute>} />
            <Route path="/live-tracking" element={<ProtectedRoute><Layout><LiveTracking /></Layout></ProtectedRoute>} />
            <Route path="/maintenance-logs" element={<ProtectedRoute><Layout><MaintenanceLogs /></Layout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
            <Route path="/trips-routes" element={<ProtectedRoute><Layout><TripsRoutes /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

            {/* Protected Routes - Existing */}
            <Route path="/vehicles" element={<ProtectedRoute><Layout><VehicleList /></Layout></ProtectedRoute>} />
            <Route path="/vehicles/add" element={<ProtectedRoute><Layout><VehicleForm /></Layout></ProtectedRoute>} />
            <Route path="/vehicles/edit/:id" element={<ProtectedRoute><Layout><VehicleForm /></Layout></ProtectedRoute>} />
            <Route path="/vehicles/:id" element={<ProtectedRoute><Layout><VehicleDetail /></Layout></ProtectedRoute>} />
            
            <Route path="/drivers" element={<ProtectedRoute><Layout><DriverList /></Layout></ProtectedRoute>} />
            <Route path="/drivers/add" element={<ProtectedRoute><Layout><DriverForm /></Layout></ProtectedRoute>} />
            <Route path="/drivers/edit/:id" element={<ProtectedRoute><Layout><DriverForm /></Layout></ProtectedRoute>} />
            <Route path="/drivers/:id" element={<ProtectedRoute><Layout><DriverDetail /></Layout></ProtectedRoute>} />
            
            <Route path="/shipments" element={<ProtectedRoute><Layout><ShipmentList /></Layout></ProtectedRoute>} />
            <Route path="/shipments/add" element={<ProtectedRoute><Layout><ShipmentForm /></Layout></ProtectedRoute>} />
            <Route path="/shipments/edit/:id" element={<ProtectedRoute><Layout><ShipmentForm /></Layout></ProtectedRoute>} />
            <Route path="/shipments/:id" element={<ProtectedRoute><Layout><ShipmentDetail /></Layout></ProtectedRoute>} />
            <Route path="/shipment-route/:shipmentId" element={<ProtectedRoute><ShipmentRouteMap /></ProtectedRoute>} />
            
            <Route path="/trips" element={<ProtectedRoute><Layout><Trips /></Layout></ProtectedRoute>} />
            <Route path="/trips/add" element={<ProtectedRoute><Layout><TripForm /></Layout></ProtectedRoute>} />
            <Route path="/trips/edit/:id" element={<ProtectedRoute><Layout><TripForm /></Layout></ProtectedRoute>} />
            <Route path="/trips/:id" element={<ProtectedRoute><Layout><TripDetail /></Layout></ProtectedRoute>} />
            
            <Route path="/maintenance" element={<ProtectedRoute><Layout><MaintenanceList /></Layout></ProtectedRoute>} />
            <Route path="/maintenance/add" element={<ProtectedRoute><Layout><MaintenanceForm /></Layout></ProtectedRoute>} />
            <Route path="/maintenance/edit/:id" element={<ProtectedRoute><Layout><MaintenanceForm /></Layout></ProtectedRoute>} />
            <Route path="/maintenance/:id" element={<ProtectedRoute><Layout><MaintenanceDetail /></Layout></ProtectedRoute>} />
            
            <Route path="/fuel-records" element={<ProtectedRoute><Layout><FuelRecords /></Layout></ProtectedRoute>} />
            <Route path="/tracking-map" element={<ProtectedRoute><Layout><TrackingMap /></Layout></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;