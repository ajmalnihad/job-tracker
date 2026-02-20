/**
 * Main App Component - Routes and layout
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KanbanView from './pages/KanbanView';
import ApplicationsPage from './pages/ApplicationsPage';
import ResumeManager from './pages/ResumeManager';
import Settings from './pages/Settings';
import './styles/index.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/kanban"
                        element={
                            <ProtectedRoute>
                                <KanbanView />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/applications"
                        element={
                            <ProtectedRoute>
                                <ApplicationsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/resumes"
                        element={
                            <ProtectedRoute>
                                <ResumeManager />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* 404 - Redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
