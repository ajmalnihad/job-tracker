/**
 * Register Page - User registration
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrors(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card card">
                <div className="auth-header">
                    <h1 className="gradient-text">Create Account</h1>
                    <p className="text-muted">Start tracking your job applications</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {errors.non_field_errors && (
                        <div className="error-message">
                            {errors.non_field_errors}
                        </div>
                    )}

                    <div className="grid grid-2">
                        <Input
                            label="First Name"
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="John"
                            required
                            error={errors.first_name}
                        />

                        <Input
                            label="Last Name"
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Doe"
                            required
                            error={errors.last_name}
                        />
                    </div>

                    <Input
                        label="Username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="johndoe"
                        required
                        error={errors.username}
                    />

                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        error={errors.email}
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        error={errors.password}
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        error={errors.password2}
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '1rem' }}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </Button>
                </form>

                <div className="auth-footer">
                    <p className="text-muted">
                        Already have an account? <Link to="/login" className="auth-link">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
