/**
 * ApplicationCard - Draggable card component for Kanban board
 */

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { formatDate } from '../../utils/helpers';
import './ApplicationCard.css';

const ApplicationCard = ({ application }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: application.id.toString(),
        data: {
            application,
            status: application.status
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`application-card ${isDragging ? 'dragging' : ''}`}
        >
            <h4>{application.company_name}</h4>
            <p className="role">{application.role}</p>
            <div className="card-footer">
                <span className="date">Applied: {formatDate(application.applied_date)}</span>
            </div>
        </div>
    );
};

export default ApplicationCard;
