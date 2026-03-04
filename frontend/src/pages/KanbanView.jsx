/**
 * Kanban Board Page - Drag & drop application management with @dnd-kit/core
 */

import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { applicationsAPI } from '../api/applications';
import Navbar from '../components/common/Navbar';
import KanbanColumn from '../components/kanban/KanbanColumn';
import ApplicationCard from '../components/kanban/ApplicationCard';
import { STATUS_OPTIONS } from '../utils/constants';
import './KanbanView.css';

const KanbanView = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeApplication, setActiveApplication] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [timeFilter, setTimeFilter] = useState('Newest First');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await applicationsAPI.getAll({ page_size: 1000 });
            setApplications(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = useMemo(() => {
        let filtered = [...applications];

        // 1. Text Search filtering
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(app =>
                (app.company_name && app.company_name.toLowerCase().includes(query)) ||
                (app.role && app.role.toLowerCase().includes(query))
            );
        }

        // 2. Time Filter logic
        const now = new Date();
        filtered = filtered.filter(app => {
            if (timeFilter === 'Last 7 Days' || timeFilter === 'Last 30 Days') {
                const date = new Date(app.applied_date || app.created_at || new Date());
                const diffTime = now - date;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (timeFilter === 'Last 7 Days') {
                    return diffDays <= 7;
                } else if (timeFilter === 'Last 30 Days') {
                    return diffDays <= 30;
                }
            }
            return true;
        });

        // 3. Sorting logic
        filtered.sort((a, b) => {
            const dateA = new Date(a.applied_date || a.created_at || 0).getTime();
            const dateB = new Date(b.applied_date || b.created_at || 0).getTime();

            if (timeFilter === 'Oldest First') {
                return dateA - dateB;
            }
            // default to Newest First
            return dateB - dateA;
        });

        return filtered;
    }, [applications, searchQuery, timeFilter]);

    const handleDragStart = (event) => {
        const { active } = event;
        const application = applications.find(app => app.id.toString() === active.id);
        setActiveApplication(application);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        setActiveApplication(null);

        if (!over) return;

        const applicationId = parseInt(active.id);
        const newStatus = over.id;
        const oldStatus = active.data.current.status;

        // Don't update if dropped in same column
        if (oldStatus === newStatus) return;

        // Optimistic update - immediately update UI
        setApplications(prev =>
            prev.map(app =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            )
        );

        // Update backend using standard PATCH endpoint
        try {
            await applicationsAPI.patch(applicationId, { status: newStatus });
        } catch (error) {
            console.error('Failed to update status:', error);

            // Revert on error - restore original status
            setApplications(prev =>
                prev.map(app =>
                    app.id === applicationId ? { ...app, status: oldStatus } : app
                )
            );

            // Optional: Show error notification to user
            alert('Failed to update application status. Please try again.');
        }
    };

    const getApplicationsByStatus = (status) => {
        return filteredApplications.filter(app => app.status === status);
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="kanban-page-container">
                    <div className="spinner" style={{ margin: '3rem auto' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="kanban-page-wrapper">
            <Navbar />
            <div className="kanban-page-container">
                <div className="kanban-header">
                    <h1 className="gradient-text mb-0">Kanban Board</h1>

                    {/* Control Bar */}
                    <div className="kanban-controls">
                        <input
                            type="text"
                            placeholder="Search by company or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="kanban-search"
                        />
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="kanban-filter"
                        >
                            <option value="Newest First">Newest First</option>
                            <option value="Oldest First">Oldest First</option>
                            <option value="Last 7 Days">Last 7 Days</option>
                            <option value="Last 30 Days">Last 30 Days</option>
                        </select>
                    </div>
                </div>

                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="kanban-board">
                        {STATUS_OPTIONS.map(({ value, label, color }) => (
                            <KanbanColumn
                                key={value}
                                status={value}
                                label={label}
                                color={color}
                                applications={getApplicationsByStatus(value)}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeApplication ? (
                            <div className="drag-overlay-card-wrapper">
                                <ApplicationCard application={activeApplication} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
};

export default KanbanView;
