/**
 * Kanban Board Page - Drag & drop application management with @dnd-kit/core
 */

import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await applicationsAPI.getAll();
            setApplications(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

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
        return applications.filter(app => app.status === status);
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="kanban-container">
                    <div className="spinner" style={{ margin: '3rem auto' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="kanban-container">
                <h1 className="gradient-text mb-lg">Kanban Board</h1>

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
                            <ApplicationCard application={activeApplication} />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
};

export default KanbanView;
