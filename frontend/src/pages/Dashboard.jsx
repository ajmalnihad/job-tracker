/**
 * Dashboard Page - Analytics and overview
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../api/analytics';
import { applicationsAPI } from '../api/applications';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentApps, setRecentApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [analyticsRes, appsRes] = await Promise.all([
                analyticsAPI.getStats(),
                applicationsAPI.getAll({ page_size: 5 })
            ]);

            setStats(analyticsRes.data);
            setRecentApps(appsRes.data.results || appsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="dashboard-container">
                    <div className="spinner" style={{ margin: '3rem auto' }}></div>
                </div>
            </div>
        );
    }

    const chartData = stats?.status_distribution?.map(item => ({
        name: item.status.replace('_', ' ').toUpperCase(),
        value: item.count
    })) || [];

    const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1 className="gradient-text">Dashboard</h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/applications?new=true')}
                    >
                        + New Application
                    </button>
                </div>

                <div className="stats-grid grid grid-4">
                    <Card className="stat-card">
                        <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
                            📊
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Applications</p>
                            <h2 className="stat-value">{stats?.total_applications || 0}</h2>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon" style={{ background: 'var(--gradient-accent)' }}>
                            📈
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Response Rate</p>
                            <h2 className="stat-value">{stats?.response_rate || 0}%</h2>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}>
                            ⏱️
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Avg Response Time</p>
                            <h2 className="stat-value">{stats?.average_response_time || 0} days</h2>
                        </div>
                    </Card>

                    <Card className="stat-card">
                        <div className="stat-icon" style={{ background: 'var(--gradient-secondary)' }}>
                            🎯
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Active Applications</p>
                            <h2 className="stat-value">
                                {chartData.reduce((acc, item) =>
                                    !item.name.includes('REJECTED') ? acc + item.value : acc, 0
                                )}
                            </h2>
                        </div>
                    </Card>
                </div>

                <div className="dashboard-content grid grid-2">
                    <Card>
                        <h3 className="mb-md">Status Distribution</h3>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted text-center">No data available</p>
                        )}
                    </Card>

                    <Card>
                        <h3 className="mb-md">Recent Applications</h3>
                        <div className="recent-apps">
                            {recentApps.length > 0 ? (
                                recentApps.map(app => (
                                    <div key={app.id} className="recent-app-item">
                                        <div>
                                            <p className="font-bold">{app.company_name}</p>
                                            <p className="text-sm text-muted">{app.role}</p>
                                        </div>
                                        <span className={`badge badge-${app.status}`}>
                                            {app.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted text-center">No applications yet</p>
                            )}
                        </div>
                        <Link to="/applications" className="btn btn-ghost" style={{ width: '100%', marginTop: '1rem' }}>
                            View All Applications
                        </Link>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
