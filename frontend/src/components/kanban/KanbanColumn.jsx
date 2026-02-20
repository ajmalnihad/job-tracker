/**
 * KanbanColumn - Droppable column component for Kanban board
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import ApplicationCard from './ApplicationCard';
import './KanbanColumn.css';

const KanbanColumn = ({ status, label, color, applications }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status
    });

    return (
        <div className="kanban-column">
            <div className="column-header" style={{ borderLeftColor: color }}>
                <h3>{label}</h3>
                <span className="column-count">{applications.length}</span>
            </div>

            <div
                ref={setNodeRef}
                className={`column-content ${isOver ? 'dragging-over' : ''}`}
            >
                {applications.map(application => (
                    <ApplicationCard key={application.id} application={application} />
                ))}

                {applications.length === 0 && (
                    <div className="empty-column">
                        <p>No applications</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
