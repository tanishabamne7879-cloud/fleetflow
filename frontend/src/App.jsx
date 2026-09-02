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

// Protected Pages
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import DriverDetail from "./pages/DriverDetail";
import DriverForm from "./pages/DriverForm";
import DriverList from "./pages/DriverList";
import LiveTracking from "./pages/LiveTracking";
import MaintenanceDetail from "./pages/MaintenanceDetail";
import MaintenanceForm from "./pages/MaintenanceForm";
import MaintenanceList from "./pages/MaintenanceList";
import Profile from "./pages/Profile";
import ShipmentDetail from "./pages/ShipmentDetail";
import ShipmentForm from "./pages/ShipmentForm";
import ShipmentList from "./pages/ShipmentList";
import ShipmentRouteMap from "./pages/ShipmentRouteMap"; // ✅ ADD THIS
import TrackingMap from "./pages/TrackingMap";
import TripDetail from "./pages/TripDetail";
import TripForm from "./pages/TripForm";
import Trips from "./pages/Trips";
import VehicleDetail from "./pages/VehicleDetail";
import VehicleForm from "./pages/VehicleForm";
import VehicleList from "./pages/VehicleList";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes WITH Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Vehicles */}
            <Route
              path="/vehicles"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VehicleList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicles/add"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VehicleForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicles/edit/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VehicleForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicles/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VehicleDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Drivers */}
            <Route
              path="/drivers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DriverList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivers/add"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DriverForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivers/edit/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DriverForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/drivers/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DriverDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Shipments */}
            <Route
              path="/shipments"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ShipmentList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipments/add"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ShipmentForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipments/edit/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ShipmentForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipments/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ShipmentDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* ✅ ADD: Shipment Route Tracking - WITHOUT Layout (full page map) */}
            <Route
              path="/shipment-route/:shipmentId"
              element={
                <ProtectedRoute>
                  <ShipmentRouteMap />
                </ProtectedRoute>
              }
            />

            {/* Trips */}
            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Trips />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/add"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TripForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TripDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Maintenance */}
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MaintenanceList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance/add"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MaintenanceForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance/edit/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MaintenanceForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MaintenanceDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Tracking */}
            <Route
              path="/live-tracking"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LiveTracking />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracking-map"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TrackingMap />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;