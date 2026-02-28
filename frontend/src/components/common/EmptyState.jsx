import React from 'react';
import Button from './Button';

const EmptyState = ({
    icon = '📝',
    title = 'No records found',
    description = 'Get started by creating a new record today.',
    actionText = 'Add New',
    onAction
}) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'var(--color-bg-secondary, #f9fafb)',
            borderRadius: '12px',
            border: '2px dashed var(--color-border, #e5e7eb)',
            margin: '2rem 0',
            width: '100%'
        }}>
            <div style={{
                fontSize: '4rem',
                marginBottom: '1.5rem',
                opacity: 0.8,
                animation: 'bounce 2s infinite'
            }}>
                {icon}
            </div>
            <h3 style={{
                fontSize: '1.5rem',
                color: 'var(--color-text-title, #111827)',
                marginBottom: '0.75rem',
                fontWeight: '600'
            }}>
                {title}
            </h3>
            <p style={{
                fontSize: '1.05rem',
                color: 'var(--color-text-muted, #6b7280)',
                marginBottom: '2rem',
                maxWidth: '400px',
                lineHeight: 1.5
            }}>
                {description}
            </p>
            {onAction && actionText && (
                <Button variant="primary" onClick={onAction} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                    {actionText}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
