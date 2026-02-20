/**
 * Settings Page - User profile management
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../api/auth';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './Settings.css';

const Settings = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await authAPI.updateProfile(formData);
            setMessage('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="settings-container">
                <h1 className="gradient-text mb-lg">Settings</h1>

                <Card className="settings-card">
                    <h3 className="mb-md">Profile Information</h3>

                    {message && (
                        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="settings-form">
                        <div className="grid grid-2">
                            <Input
                                label="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Username"
                            value={user?.username || ''}
                            disabled
                        />

                        <Button type="submit" variant="primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
