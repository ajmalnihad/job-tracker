/**
 * Resume Manager Page - Upload and manage resumes
 */

import React, { useState, useEffect } from 'react';
import { resumesAPI } from '../api/resumes';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { formatDate } from '../utils/helpers';
import './ResumeManager.css';

const ResumeManager = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        file: null,
    });

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const response = await resumesAPI.getAll();
            setResumes(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching resumes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('file', formData.file);

        try {
            await resumesAPI.upload(data);
            setFormData({ title: '', file: null });
            e.target.reset();
            fetchResumes();
        } catch (error) {
            console.error('Error uploading resume:', error);
            alert('Error uploading resume. Please ensure it is a PDF file under 5MB.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resume?')) {
            try {
                await resumesAPI.delete(id);
                fetchResumes();
            } catch (error) {
                console.error('Error deleting resume:', error);
            }
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="resume-container">
                    <div className="spinner" style={{ margin: '3rem auto' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="resume-container">
                <h1 className="gradient-text mb-lg">Resume Manager</h1>

                <Card className="upload-card">
                    <h3 className="mb-md">Upload New Resume</h3>
                    <form onSubmit={handleSubmit} className="upload-form">
                        <Input
                            label="Resume Title"
                            name="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Software Engineer Resume"
                            required
                        />

                        <div className="form-group">
                            <label className="form-label">PDF File (Max 5MB)</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                required
                                className="input"
                            />
                        </div>

                        <Button type="submit" variant="primary" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Upload Resume'}
                        </Button>
                    </form>
                </Card>

                <div className="resumes-grid">
                    {resumes.map(resume => (
                        <Card key={resume.id} className="resume-card">
                            <div className="resume-header">
                                <div>
                                    <h3>📄 {resume.title}</h3>
                                    <p className="text-sm text-muted">Uploaded {formatDate(resume.uploaded_at)}</p>
                                </div>
                            </div>

                            <div className="resume-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Applications</span>
                                    <span className="stat-value">{resume.total_applications || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Success Rate</span>
                                    <span className="stat-value">{resume.success_rate || 0}%</span>
                                </div>
                            </div>

                            <div className="resume-actions">
                                <Button variant="danger" onClick={() => handleDelete(resume.id)}>
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {resumes.length === 0 && (
                    <div className="text-center" style={{ marginTop: '3rem' }}>
                        <p className="text-muted">No resumes uploaded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeManager;
