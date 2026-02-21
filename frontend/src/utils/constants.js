// API constants and configuration
// In production (Vercel): VITE_API_URL = https://your-app.onrender.com
// In local dev: VITE_API_URL = http://localhost:8000 (set in .env.local)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://job-tracker-iwj8.onrender.com';

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
