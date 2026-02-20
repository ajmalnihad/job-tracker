/**
 * Applications API methods
 */

import axiosInstance from './axios';

export const applicationsAPI = {
    // Get all applications with optional filters
    getAll: (params = {}) => {
        return axiosInstance.get('/api/applications/', { params });
    },

    // Get single application
    getById: (id) => {
        return axiosInstance.get(`/api/applications/${id}/`);
    },

    // Create new application
    create: (data) => {
        return axiosInstance.post('/api/applications/', data);
    },

    // Update application
    update: (id, data) => {
        return axiosInstance.put(`/api/applications/${id}/`, data);
    },

    // Partial update
    patch: (id, data) => {
        return axiosInstance.patch(`/api/applications/${id}/`, data);
    },

    // Delete application
    delete: (id) => {
        return axiosInstance.delete(`/api/applications/${id}/`);
    },

    // Update status (for Kanban)
    updateStatus: (id, status) => {
        return axiosInstance.patch(`/api/applications/${id}/update_status/`, { status });
    },
};
