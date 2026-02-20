/**
 * Authentication API methods
 */

import axiosInstance from './axios';

export const authAPI = {
    // Register new user
    register: (userData) => {
        return axiosInstance.post('/api/auth/register/', userData);
    },

    // Login
    login: (credentials) => {
        return axiosInstance.post('/api/auth/login/', credentials);
    },

    // Logout
    logout: (refreshToken) => {
        return axiosInstance.post('/api/auth/logout/', { refresh: refreshToken });
    },

    // Refresh token
    refresh: (refreshToken) => {
        return axiosInstance.post('/api/auth/refresh/', { refresh: refreshToken });
    },

    // Get user profile
    getProfile: () => {
        return axiosInstance.get('/api/auth/profile/');
    },

    // Update user profile
    updateProfile: (userData) => {
        return axiosInstance.patch('/api/auth/profile/', userData);
    },
};
