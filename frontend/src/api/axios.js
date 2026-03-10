/**
 * Axios instance with interceptors for JWT token handling
 */

import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../utils/constants';

// Create axios instance pointing to the backend (Render in production, localhost in dev)
// Controlled by VITE_API_URL environment variable
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    // Don't set Content-Type here - let it be set per request
    // This allows multipart/form-data for file uploads
});

// Request interceptor - Add JWT token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh on 401
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet and it's not the refresh endpoint itself
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // KILL SWITCH: If the refresh token request itself fails with 401, logout immediately to prevent infinite loop
            if (originalRequest.url === '/api/auth/refresh/') {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                localStorage.removeItem('user_data');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

            if (refreshToken) {
                try {
                    // Try to refresh the token (use axiosInstance so baseURL is applied)
                    const response = await axiosInstance.post('/api/auth/refresh/', {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    localStorage.setItem(ACCESS_TOKEN_KEY, access);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, logout user
                    localStorage.removeItem(ACCESS_TOKEN_KEY);
                    localStorage.removeItem(REFRESH_TOKEN_KEY);
                    localStorage.removeItem('user_data');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, redirect to login
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
