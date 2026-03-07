/**
 * Applications Page - List view with CRUD operations
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applicationsAPI } from '../api/applications';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/helpers';
import { resumesAPI } from '../api/resumes';
import './ApplicationsPage.css';

const ApplicationsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [applications, setApplications] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [viewingApp, setViewingApp] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const getInitialFormData = () => {
        const today = new Date();
        const appliedDate = today.toISOString().split('T')[0];
        const followUp = new Date(today);
        followUp.setDate(today.getDate() + 7);
        const followUpDate = followUp.toISOString().split('T')[0];

        return {
            company_name: '',
            role: '',
            job_url: '',
            status: 'applied',
            applied_date: appliedDate,
            follow_up_date: followUpDate,
            resume: '',
            notes: '',
        };
    };

    const [formData, setFormData] = useState(getInitialFormData());

    useEffect(() => {
        fetchData();
    }, []);

    // Handle ?new=true query parameter from Dashboard navigation
    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            openNewModal();
            // Clean up URL after opening modal
            searchParams.delete('new');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const fetchData = async () => {
        try {
            const [appsRes, resumesRes] = await Promise.all([
                applicationsAPI.getAll(),
                resumesAPI.getAll(),
            ]);
            setApplications(appsRes.data.results || appsRes.data);
            setResumes(resumesRes.data.results || resumesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedData = { ...formData, [name]: value };

        // Automatically recalculate follow-up date if applied_date changes
        if (name === 'applied_date' && value) {
            const newAppliedDate = new Date(value);
            if (!isNaN(newAppliedDate.getTime())) {
                const followUp = new Date(newAppliedDate);
                followUp.setDate(followUp.getDate() + 7);
                updatedData.follow_up_date = followUp.toISOString().split('T')[0];
            }
        }

        setFormData(updatedData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingApp) {
                await applicationsAPI.update(editingApp.id, formData);
            } else {
                await applicationsAPI.create(formData);
            }
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving application:', error);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this application?')) {
            try {
                await applicationsAPI.delete(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting application:', error);
            }
        }
    };

    const openEditModal = (app, e) => {
        if (e) e.stopPropagation();
        setEditingApp(app);
        setFormData({
            company_name: app.company_name,
            role: app.role,
            job_url: app.job_url || '',
            status: app.status,
            applied_date: app.applied_date,
            follow_up_date: app.follow_up_date || '',
            resume: app.resume || '',
            notes: app.notes || '',
        });
        setIsModalOpen(true);
    };

    const openDetailsModal = (app) => {
        setViewingApp(app);
        setIsDetailsModalOpen(true);
    };

    const resetForm = () => {
        setEditingApp(null);
        setFormData(getInitialFormData());
    };

    const openNewModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="applications-container">
                    <div className="applications-header">
                        <h1 className="gradient-text">Applications</h1>
                        <Button disabled>+ New Application</Button>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        <SkeletonLoader count={6} type="card" />
                    </div>
                </div>
            </div>
        );
    }

    // Dynamic filtering based on search term and selected status
    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.company_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || app.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const glassInputStyle = {
        padding: '0.6rem 0.8rem',
        background: 'rgba(30, 30, 30, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        color: '#fff',
        backdropFilter: 'blur(10px)',
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: '0',
        marginTop: '0.25rem',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
    };

    return (
        <div>
            <Navbar />
            <div className="applications-container">
                <div className="applications-header">
                    <h1 className="gradient-text">Applications</h1>
                    <Button onClick={openNewModal}>+ New Application</Button>
                </div>

                {/* Filters Section */}
                <div className="filters-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Company Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input"
                            style={{ margin: 0, width: '100%', paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <div style={{ minWidth: '200px' }}>
                        <select
                            className="input"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ margin: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="applied">Applied</option>
                            <option value="hr_contacted">HR Contacted</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="applications-grid">
                    {filteredApplications.map(app => (
                        <Card
                            key={app.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            className="application-card"
                        >
                            {/* Subtle Delete Icon Button (Top Right corner absolute positioning) / Prevent easy accidental clicks */}
                            <button
                                onClick={(e) => handleDelete(app.id, e)}
                                title="Delete application"
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.4rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--color-text-muted)',
                                    opacity: 0.6,
                                    transition: 'all 0.2s ease',
                                    zIndex: 10
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.color = 'var(--color-danger)';
                                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                    e.currentTarget.style.opacity = 1;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.color = 'var(--color-text-muted)';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.opacity = 0.6;
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.color = 'var(--color-danger)';
                                    e.currentTarget.style.opacity = 1;
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.color = 'var(--color-text-muted)';
                                    e.currentTarget.style.opacity = 0.6;
                                }}
                                aria-label="Delete"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>

                            <div className="app-card-header" style={{ paddingRight: '2.5rem' /* Leave space for delete button */ }}>
                                <div>
                                    <h3 style={{ marginBottom: '0.2rem', color: 'var(--color-text-title)' }}>{app.company_name}</h3>
                                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>{app.role}</p>
                                </div>
                                <span className={`badge badge-${app.status.toLowerCase()}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                    {app.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <div className="app-card-details" style={{ margin: '1.5rem 0', flexGrow: 1 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <div>
                                        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Applied</p>
                                        <p style={{ margin: 0, fontWeight: '500' }}>{formatDate(app.applied_date)}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Follow-up</p>
                                        <p style={{ margin: 0, fontWeight: '500' }}>{app.follow_up_date ? formatDate(app.follow_up_date) : '-'}</p>
                                    </div>
                                </div>
                                {app.notes && (
                                    <div style={{ marginTop: '1rem', padding: '0.8rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '6px' }}>
                                        <p className="text-sm text-muted" style={{ margin: 0, fontStyle: 'italic' }}>
                                            "{app.notes.length > 80 ? app.notes.substring(0, 80) + '...' : app.notes}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Emphasized primary actions */}
                            <div className="app-card-actions" style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                                <Button
                                    variant="primary"
                                    onClick={() => openDetailsModal(app)}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    View Details
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={(e) => openEditModal(app, e)}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', border: '1px solid var(--color-border)' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    Edit
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {filteredApplications.length === 0 && (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <EmptyState
                                icon="🚀"
                                title="No applications found"
                                description={applications.length === 0
                                    ? "You haven't added any applications yet. Add your first job to get started!"
                                    : "We couldn't find any applications matching your current filters."
                                }
                                actionText={(searchTerm || statusFilter !== 'All') ? 'Clear Filters' : 'Add New Application'}
                                onAction={(searchTerm || statusFilter !== 'All') ? () => { setSearchTerm(''); setStatusFilter('All'); } : openNewModal}
                            />
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingApp ? 'Edit Application' : 'New Application'}
                style={{ padding: '1rem' }}
            >
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>

                    {/* Rows 1-3: Full Width Span */}
                    <div style={{ gridColumn: 'span 2', marginBottom: '-0.3rem' }}>
                        <Input
                            label={<span style={{ fontSize: '0.8rem', marginBottom: '0' }}>Company Name</span>}
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                            style={glassInputStyle}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2', marginBottom: '-0.3rem' }}>
                        <Input
                            label={<span style={{ fontSize: '0.8rem', marginBottom: '0' }}>Role</span>}
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            style={glassInputStyle}
                        />
                    </div>

                    <div style={{ gridColumn: 'span 2', marginBottom: '-0.3rem' }}>
                        <Input
                            label={<span style={{ fontSize: '0.8rem', marginBottom: '0' }}>Job URL</span>}
                            name="job_url"
                            type="url"
                            value={formData.job_url}
                            onChange={handleChange}
                            style={glassInputStyle}
                        />
                    </div>

                    {/* Row 4: Side-by-side Dates */}
                    <div style={{ marginBottom: '-0.3rem' }}>
                        <Input
                            label={<span style={{ fontSize: '0.8rem', marginBottom: '0' }}>Applied Date</span>}
                            name="applied_date"
                            type="date"
                            value={formData.applied_date}
                            onChange={handleChange}
                            required
                            style={glassInputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: '-0.3rem' }}>
                        <Input
                            label={<span style={{ fontSize: '0.8rem', marginBottom: '0' }}>Follow-up Date</span>}
                            name="follow_up_date"
                            type="date"
                            value={formData.follow_up_date}
                            onChange={handleChange}
                            style={glassInputStyle}
                        />
                    </div>

                    {/* Row 5: Side-by-side Status & Resume */}
                    <div className="form-group" style={{ marginBottom: '-0.3rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.1rem', fontSize: '0.8rem', fontWeight: '500' }}>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="input" style={glassInputStyle}>
                            <option value="applied">Applied</option>
                            <option value="hr_contacted">HR Contacted</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '-0.3rem' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.1rem', fontSize: '0.8rem', fontWeight: '500' }}>Resume</label>
                        <select name="resume" value={formData.resume} onChange={handleChange} className="input" style={glassInputStyle}>
                            <option value="">None</option>
                            {resumes.map(resume => (
                                <option key={resume.id} value={resume.id}>{resume.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Row 6: Full Width Notes */}
                    <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.1rem', fontSize: '0.8rem', fontWeight: '500' }}>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="input"
                            rows="2"
                            style={{ ...glassInputStyle, resize: 'vertical' }}
                        />
                    </div>

                    {/* Full Width Submit Button */}
                    <Button type="submit" variant="primary" style={{ gridColumn: 'span 2', width: '100%', marginTop: '0.2rem', padding: '0.6rem', borderRadius: '6px', fontWeight: 'bold' }}>
                        {editingApp ? 'Update' : 'Create'} Application
                    </Button>
                </form>
            </Modal>

            {/* View Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Application Details"
            >
                {viewingApp && (
                    <div className="application-details">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-title)' }}>{viewingApp.company_name}</h2>
                                <h4 style={{ margin: 0, color: 'var(--color-text-muted)', fontWeight: 'normal' }}>{viewingApp.role}</h4>
                            </div>
                            <span className={`badge badge-${viewingApp.status.toLowerCase()}`}>
                                {viewingApp.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                            <div>
                                <p style={{ margin: '0 0 0.2rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Applied Date</p>
                                <p style={{ margin: 0, fontWeight: '500' }}>{formatDate(viewingApp.applied_date)}</p>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 0.2rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Follow-up Date</p>
                                <p style={{ margin: 0, fontWeight: '500' }}>{viewingApp.follow_up_date ? formatDate(viewingApp.follow_up_date) : 'N/A'}</p>
                            </div>
                        </div>

                        {viewingApp.job_url && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ margin: '0 0 0.2rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Job URL</p>
                                <a href={viewingApp.job_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', wordBreak: 'break-all' }}>
                                    {viewingApp.job_url}
                                </a>
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Notes</p>
                            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--color-primary)', minHeight: '80px' }}>
                                {viewingApp.notes ? (
                                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{viewingApp.notes}</p>
                                ) : (
                                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No notes added.</p>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <Button
                                variant="primary"
                                style={{ flex: 1 }}
                                onClick={() => {
                                    setIsDetailsModalOpen(false);
                                    openEditModal(viewingApp);
                                }}
                            >
                                Edit Application
                            </Button>
                            <Button
                                variant="ghost"
                                style={{ flex: 1 }}
                                onClick={() => setIsDetailsModalOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ApplicationsPage;
