import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../api/applications';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch applications. Fetch a sufficient amount or all applications
            // In a production app you'd ideally use a backend filter, but we do it client-side here
            const appsRes = await applicationsAPI.getAll({ page_size: 100 });
            const allApps = appsRes.data.results || appsRes.data;

            // Filter logic
            const todayStr = new Date().toISOString().split('T')[0];
            const filteredApps = allApps.filter(app => {
                const isStatusValid = app.status !== 'rejected' && app.status !== 'offer' && app.status !== 'REJECTED' && app.status !== 'OFFER';
                // ensure follow_up_date exists and is <= today
                const isDateValid = app.follow_up_date && app.follow_up_date <= todayStr;
                return isStatusValid && isDateValid;
            });

            // Sort them by follow up date (oldest follow ups first/most urgent)
            const sortedFollowUps = filteredApps.sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));
            setFollowUps(sortedFollowUps);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkContacted = async (appId) => {
        try {
            // Update the status and optionally push the follow_up_date.
            // For now, we update status to 'hr_contacted' and clear follow_up_date so it's removed from today's list.
            await applicationsAPI.patch(appId, { status: 'hr_contacted', follow_up_date: null });
            // Refresh data immediately
            fetchData();
        } catch (error) {
            console.error('Error marking as contacted:', error);
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

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="gradient-text">Dashboard</h1>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/applications?new=true')}
                    >
                        + New Application
                    </button>
                </div>

                <div className="dashboard-content">
                    <Card style={{ padding: '2rem', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                            <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🚨</span>
                            <h2 style={{ color: 'var(--color-text-title)', margin: 0 }}>
                                Action Required: Follow-ups for Today
                            </h2>
                        </div>

                        {followUps.length > 0 ? (
                            <div className="follow-up-table-wrapper" style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                                            <th style={{ padding: '1rem 0.5rem' }}>Company</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Role</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Status</th>
                                            <th style={{ padding: '1rem 0.5rem' }}>Follow Up Date</th>
                                            <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {followUps.map((app, index) => (
                                            <tr key={app.id} style={{ borderBottom: index === followUps.length - 1 ? 'none' : '1px solid var(--color-border)', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'var(--color-bg-secondary)' } }}>
                                                <td style={{ padding: '1.5rem 0.5rem' }}>
                                                    <strong style={{ color: 'var(--color-text-title)' }}>{app.company_name}</strong>
                                                </td>
                                                <td style={{ padding: '1.5rem 0.5rem', color: 'var(--color-text-muted)' }}>
                                                    {app.role}
                                                </td>
                                                <td style={{ padding: '1.5rem 0.5rem' }}>
                                                    <span className={`badge badge-${app.status.toLowerCase()}`}>
                                                        {app.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.5rem 0.5rem' }}>
                                                    <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>
                                                        {new Date(app.follow_up_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.5rem 0.5rem', textAlign: 'right' }}>
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => handleMarkContacted(app.id)}
                                                        style={{ background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: '600', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                                                        onMouseOver={(e) => { e.target.style.background = 'var(--color-primary)'; e.target.style.color = '#fff'; }}
                                                        onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--color-primary)'; }}
                                                    >
                                                        ✅ Mark as Contacted
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state" style={{
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                background: 'rgba(17, 24, 39, 0.4)',
                                borderRadius: '12px',
                                border: '1px dashed var(--color-border)'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: 'bounce 2s infinite' }}>🎉</div>
                                <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-title)', fontSize: '1.75rem' }}>Awesome! No pending follow-ups for today.</h3>
                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Time to apply for new jobs and keep the momentum going!</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/applications?new=true')}
                                    style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '8px', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
                                >
                                    🚀 Apply for a New Job
                                </button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
