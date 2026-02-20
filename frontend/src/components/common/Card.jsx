/**
 * Card Component - Reusable card with glassmorphism
 */

import React from 'react';
import './Card.css';

const Card = ({ children, className = '', onClick, hover = true }) => {
    return (
        <div
            className={`card ${hover ? 'card-hover' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
