/**
 * ApplicationCard - Draggable card component for Kanban board
 */

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { formatDate } from '../../utils/helpers';
import './ApplicationCard.css';

const ApplicationCard = ({ application }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: application.id.toString(),
        data: {
            application,
            status: application.status
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.6 : 1,
        cursor: isDragging ? 'grabbing' : 'grab'
    };

    const handlePointerDown = (e) => {
        // Stop drag events triggering on the explicit button wrapper
        e.stopPropagation();
    };

    // Safety feature: immediately contract if dragged
    React.useEffect(() => {
        if (isDragging) setIsExpanded(false);
    }, [isDragging]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`application-card ${isDragging ? 'dragging' : ''}`}
            onMouseEnter={() => !isDragging && setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            onClick={() => !isDragging && setIsExpanded(!isExpanded)}
        >
            <div className="card-content">
                <h4 className="company-name" title={application.company_name}>{application.company_name}</h4>
                <p className="role" title={application.role}>{application.role}</p>

                <div className={`card-expanded-details ${isExpanded ? 'open' : ''}`}>
                    <div className="card-footer">
                        <span className="date">{formatDate(application.applied_date)}</span>
                        {application.source_url && (
                            <div onPointerDown={handlePointerDown} className="view-job-container">
                                <a
                                    href={application.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-job-btn"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    View Job
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationCard;
