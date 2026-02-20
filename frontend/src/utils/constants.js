// API constants and configuration
// Use empty string to make relative requests through Vite proxy
// Vite proxy is configured in vite.config.js to forward /api to http://localhost:8000
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Application status options
export const STATUS_OPTIONS = [
    { value: 'applied', label: 'Applied', color: '#3b82f6' },
    { value: 'hr_contacted', label: 'HR Contacted', color: '#8b5cf6' },
    { value: 'interview', label: 'Interview', color: '#f59e0b' },
    { value: 'offer', label: 'Offer', color: '#10b981' },
    { value: 'rejected', label: 'Rejected', color: '#ef4444' },
];

// Token storage keys
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_DATA_KEY = 'user_data';
