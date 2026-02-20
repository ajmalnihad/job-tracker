/**
 * Input Component - Reusable form input
 */

import React from 'react';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    ...props
}) => {
    return (
        <div className="form-group">
            {label && (
                <label htmlFor={name} className="form-label">
                    {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
                </label>
            )}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`input ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && (
                <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;
