import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
    const renderSkeleton = () => {
        return (
            <div className="skeleton-card">
                <div className="skeleton-header">
                    <div style={{ flex: 1 }}>
                        <div className="skeleton-title skeleton-glow"></div>
                        <div className="skeleton-text skeleton-glow" style={{ width: '40%' }}></div>
                    </div>
                    <div className="skeleton-badge skeleton-glow"></div>
                </div>

                <div className="skeleton-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div>
                            <div className="skeleton-text skeleton-glow" style={{ width: '50%' }}></div>
                            <div className="skeleton-text skeleton-glow" style={{ width: '80%' }}></div>
                        </div>
                        <div>
                            <div className="skeleton-text skeleton-glow" style={{ width: '50%' }}></div>
                            <div className="skeleton-text skeleton-glow" style={{ width: '80%' }}></div>
                        </div>
                    </div>
                    <div className="skeleton-text skeleton-glow" style={{ height: '40px', borderRadius: '6px' }}></div>
                </div>

                <div className="skeleton-footer">
                    <div className="skeleton-button skeleton-glow"></div>
                    <div className="skeleton-button skeleton-glow" style={{ opacity: 0.5 }}></div>
                </div>
            </div>
        );
    };

    return (
        <div className="skeleton-container" style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            width: '100%'
        }}>
            {Array.from({ length: count }).map((_, idx) => (
                <React.Fragment key={idx}>
                    {renderSkeleton()}
                </React.Fragment>
            ))}
        </div>
    );
};

export default SkeletonLoader;
