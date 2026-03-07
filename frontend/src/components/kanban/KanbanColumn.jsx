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
                className={`column-content flex flex-col flex-1 overflow-y-auto gap-3 ${isOver ? 'dragging-over' : ''}`}
            >
                {applications.map(application => (
                    <div key={application.id} className="shrink-0 flex-shrink-0">
                        <ApplicationCard application={application} />
                    </div>
                ))}

                {applications.length === 0 && (
                    <div className="empty-column shrink-0 flex-shrink-0">
                        <p>No applications</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
