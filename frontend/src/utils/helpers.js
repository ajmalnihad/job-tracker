// Helper utility functions

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
    const colors = {
        applied: '#3b82f6',
        hr_contacted: '#8b5cf6',
        interview: '#f59e0b',
        offer: '#10b981',
        rejected: '#ef4444',
    };
    return colors[status] || '#6b7280';
};

/**
 * Get status label
 */
export const getStatusLabel = (status) => {
    const labels = {
        applied: 'Applied',
        hr_contacted: 'HR Contacted',
        interview: 'Interview',
        offer: 'Offer',
        rejected: 'Rejected',
    };
    return labels[status] || status;
};

/**
 * Calculate days ago
 */
export const daysAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
};

/**
 * Truncate text
 */
export const truncate = (str, length = 50) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
};
