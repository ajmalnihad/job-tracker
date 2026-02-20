/**
 * Analytics API methods
 */

import axiosInstance from './axios';

export const analyticsAPI = {
    // Get user analytics
    getStats: () => {
        return axiosInstance.get('/api/analytics/');
    },
};
