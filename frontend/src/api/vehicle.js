import api from './axios';

export const vehicleApi = {
    // Get all vehicles with filters
    getVehicles: (params = {}) => {
        return api.get('/vehicles/', { params });
    },
    
    // Get vehicle stats
    getStats: () => {
        return api.get('/vehicles/stats');
    },
    
    // Get single vehicle
    getVehicle: (id) => {
        return api.get(`/vehicles/${id}`);
    },
    
    // Create vehicle - Use trailing slash
    createVehicle: (data) => {
        return api.post('/vehicles/', data);
    },
    
    // Update vehicle
    updateVehicle: (id, data) => {
        return api.put(`/vehicles/${id}`, data);
    },
    
    // Update vehicle status
    updateStatus: (id, status) => {
        return api.patch(`/vehicles/${id}/status`, { status });
    },
    
    // Delete vehicle
    deleteVehicle: (id) => {
        return api.delete(`/vehicles/${id}`);
    },
    
    // Get status options
    getStatusOptions: () => {
        return api.get('/vehicles/status/options');
    },
    
    // Get type options
    getTypeOptions: () => {
        return api.get('/vehicles/type/options');
    },
    
    // Test route
    testRoute: () => {
        return api.get('/vehicles/test');
    }
};