/**
 * Resumes API methods
 */

import axiosInstance from './axios';

export const resumesAPI = {
    // Get all resumes
    getAll: () => {
        return axiosInstance.get('/api/resumes/');
    },

    // Get single resume
    getById: (id) => {
        return axiosInstance.get(`/api/resumes/${id}/`);
    },

    // Upload new resume
    upload: (formData) => {
        return axiosInstance.post('/api/resumes/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Delete resume
    delete: (id) => {
        return axiosInstance.delete(`/api/resumes/${id}/`);
    },
};
