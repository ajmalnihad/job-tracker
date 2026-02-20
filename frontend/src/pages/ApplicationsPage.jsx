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
import { formatDate } from '../utils/helpers';
import { resumesAPI } from '../api/resumes';
import './ApplicationsPage.css';

const ApplicationsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [applications, setApplications] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [formData, setFormData] = useState({
        company_name: '',
        role: '',
        job_url: '',
        status: 'applied',
        applied_date: '',
        follow_up_date: '',
        resume: '',
        notes: '',
    });

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
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            try {
                await applicationsAPI.delete(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting application:', error);
            }
        }
    };

    const openEditModal = (app) => {
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

    const resetForm = () => {
        setEditingApp(null);
        setFormData({
            company_name: '',
            role: '',
            job_url: '',
            status: 'applied',
            applied_date: '',
            follow_up_date: '',
            resume: '',
            notes: '',
        });
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
                    <div className="spinner" style={{ margin: '3rem auto' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="applications-container">
                <div className="applications-header">
                    <h1 className="gradient-text">Applications</h1>
                    <Button onClick={openNewModal}>+ New Application</Button>
                </div>

                <div className="applications-grid">
                    {applications.map(app => (
                        <Card key={app.id} className="application-card">
                            <div className="app-card-header">
                                <div>
                                    <h3>{app.company_name}</h3>
                                    <p className="text-muted">{app.role}</p>
                                </div>
                                <span className={`badge badge-${app.status}`}>
                                    {app.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="app-card-details">
                                <p><strong>Applied:</strong> {formatDate(app.applied_date)}</p>
                                {app.follow_up_date && (
                                    <p><strong>Follow-up:</strong> {formatDate(app.follow_up_date)}</p>
                                )}
                                {app.notes && <p className="text-sm text-muted">{app.notes.substring(0, 100)}...</p>}
                            </div>

                            <div className="app-card-actions">
                                <Button variant="ghost" onClick={() => openEditModal(app)}>Edit</Button>
                                <Button variant="danger" onClick={() => handleDelete(app.id)}>Delete</Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {applications.length === 0 && (
                    <div className="text-center" style={{ marginTop: '3rem' }}>
                        <p className="text-muted">No applications yet. Create one to get started!</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingApp ? 'Edit Application' : 'New Application'}
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Company Name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Job URL"
                        name="job_url"
                        type="url"
                        value={formData.job_url}
                        onChange={handleChange}
                    />

                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="input">
                            <option value="applied">Applied</option>
                            <option value="hr_contacted">HR Contacted</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <Input
                        label="Applied Date"
                        name="applied_date"
                        type="date"
                        value={formData.applied_date}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Follow-up Date"
                        name="follow_up_date"
                        type="date"
                        value={formData.follow_up_date}
                        onChange={handleChange}
                    />

                    <div className="form-group">
                        <label className="form-label">Resume</label>
                        <select name="resume" value={formData.resume} onChange={handleChange} className="input">
                            <option value="">None</option>
                            {resumes.map(resume => (
                                <option key={resume.id} value={resume.id}>{resume.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="input"
                            rows="3"
                        />
                    </div>

                    <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '1rem' }}>
                        {editingApp ? 'Update' : 'Create'} Application
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default ApplicationsPage;
