/**
 * Navbar Component - Navigation header
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-brand">
                    <span className="gradient-text">Job Tracker</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/applications" className="nav-link">Applications</Link>
                    <Link to="/kanban" className="nav-link">Kanban</Link>
                    <Link to="/resumes" className="nav-link">Resumes</Link>
                    <Link to="/settings" className="nav-link">Settings</Link>
                </div>

                <div className="navbar-user">
                    <span className="user-name">{user?.first_name || user?.username}</span>
                    <button onClick={handleLogout} className="btn btn-ghost">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
