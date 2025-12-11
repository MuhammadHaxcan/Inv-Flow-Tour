import React from 'react';

const LoadingOverlay = ({ active, message = 'Loading...' }) => {
    if (!active) return null;

    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75"
            style={{ zIndex: 2000 }}
            aria-live="polite"
        >
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status" aria-label={message}>
                    <span className="visually-hidden">{message}</span>
                </div>
                <p className="text-muted mb-0">{message}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;


