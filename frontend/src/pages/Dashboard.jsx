import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../api/applications';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [followUps, setFollowUps] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch both ALL applications (for stats) and follow-ups in parallel
            const [followUpsRes, allAppsRes] = await Promise.all([
                applicationsAPI.getFollowUps(),
                applicationsAPI.getAll({ page_size: 1000 })
            ]);

            const followUpApps = followUpsRes.data.results || followUpsRes.data;
            setFollowUps(followUpApps);

            // Dynamically calculate metrics from ALL applications
            const allApps = allAppsRes.data.results || allAppsRes.data;
            const total_applications = allApps.length;
            const respondedApps = allApps.filter(app => app.status !== 'applied');
            const response_rate = total_applications > 0 ? Math.round((respondedApps.length / total_applications) * 100) : 0;
            const active_interviews = allApps.filter(app => app.status === 'interview').length;

            setStats({
                total_applications,
                response_rate,
                active_interviews
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkContacted = async (appId) => {
        try {
            await applicationsAPI.patch(appId, { status: 'hr_contacted', follow_up_date: null });
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
                        style={{ padding: '0.6rem 1.2rem', fontWeight: '500', borderRadius: '8px' }}
                    >
                        + New Application
                    </button>
                </div>

                {/* Compact Analytics Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <Card style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', background: 'rgba(30, 30, 30, 0.4)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Total Applications</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(58, 134, 255, 0.1)', flexShrink: 0, padding: '6px', borderRadius: '8px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', margin: 0, lineHeight: 1 }}>
                                {stats ? stats.total_applications : '--'}
                            </p>
                        </div>
                    </Card>

                    <Card style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', background: 'rgba(30, 30, 30, 0.4)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Response Rate</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(56, 176, 0, 0.1)', flexShrink: 0, padding: '6px', borderRadius: '8px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                            </div>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-success)', margin: 0, lineHeight: 1 }}>
                                {stats ? stats.response_rate : '--'}%
                            </p>
                        </div>
                    </Card>

                    <Card style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', background: 'rgba(30, 30, 30, 0.4)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Active Interviews</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(255, 159, 10, 0.1)', flexShrink: 0, padding: '6px', borderRadius: '8px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
                            </div>
                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-warning)', margin: 0, lineHeight: 1 }}>
                                {stats ? stats.active_interviews : '--'}
                            </p>
                        </div>
                    </Card>
                </div>

                <div className="dashboard-content">
                    <Card style={{
                        padding: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        background: 'rgba(20, 20, 20, 0.4)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '6px', height: '24px', background: 'var(--color-warning)', borderRadius: '4px', marginRight: '12px' }}></div>
                            <h2 style={{ color: 'var(--color-text-title)', margin: 0, fontSize: '1.4rem', fontWeight: '600' }}>
                                Action Required: Follow-ups
                            </h2>
                        </div>

                        {followUps.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                                {followUps.map((app) => {
                                    const isToday = new Date(app.follow_up_date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                                    return (
                                        <div key={app.id} style={{
                                            padding: '1.25rem',
                                            background: 'rgba(40, 40, 40, 0.3)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.3s ease',
                                        }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.background = 'rgba(50, 50, 50, 0.4)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.background = 'rgba(40, 40, 40, 0.3)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                            }}
                                        >
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                                    <strong style={{ color: 'var(--color-text-title)', fontSize: '1.1rem', fontWeight: '600' }}>{app.company_name}</strong>
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '600',
                                                        letterSpacing: '0.5px',
                                                        background: isToday ? 'rgba(255, 69, 58, 0.15)' : 'rgba(255, 159, 10, 0.15)',
                                                        color: isToday ? '#ff453a' : '#ff9f0a',
                                                    }}>
                                                        {isToday ? 'TODAY' : 'TOMORROW'}
                                                    </span>
                                                </div>
                                                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>{app.role}</p>
                                            </div>

                                            <button
                                                onClick={() => handleMarkContacted(app.id)}
                                                style={{
                                                    width: '100%',
                                                    background: 'rgba(255, 255, 255, 0.04)',
                                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                                    color: 'var(--color-text-muted)',
                                                    fontWeight: '500',
                                                    fontSize: '0.9rem',
                                                    padding: '0.6rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                    e.currentTarget.style.color = 'var(--color-text-title)';
                                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                                    e.currentTarget.style.color = 'var(--color-text-muted)';
                                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                                }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                Mark as Contacted
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state" style={{
                                textAlign: 'center',
                                padding: '3rem 2rem',
                                background: 'rgba(30, 30, 30, 0.2)',
                                borderRadius: '12px',
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.8 }}>✨</div>
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-text-title)', fontSize: '1.2rem', fontWeight: '500' }}>All caught up!</h3>
                                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>No pending follow-ups required at the moment.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
