/**
 * Button Component - Reusable button
 */

import React from 'react';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-${variant} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
