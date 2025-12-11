import React from 'react';

/**
 * Standardized page layout component for consistent page structure
 * @param {ReactNode} children - Page content
 * @param {Object} options - Layout options
 */
const PageLayout = ({
    children,
    title,
    subtitle,
    actions,
    loading = false,
    error = null,
    className = '',
    headerClassName = '',
    contentClassName = '',
    showBackButton = false,
    onBack
}) => {
    return (
        <div className={`content-wrapper ${className}`}>
            {/* Page Header */}
            {(title || subtitle || actions) && (
                <div className={`card-header bg-light py-3 ${headerClassName}`}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            {showBackButton && onBack && (
                                <button
                                    onClick={onBack}
                                    className="btn btn-outline-secondary btn-sm"
                                >
                                    ← Back
                                </button>
                            )}
                            <div>
                                {title && <h3 className="h5 fw-bold text-primary mb-0">{title}</h3>}
                                {subtitle && <p className="text-muted small mb-0 mt-1">{subtitle}</p>}
                            </div>
                        </div>
                        {actions && (
                            <div className="d-flex gap-2">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="alert alert-danger" role="alert">
                    <h6 className="alert-heading">Error</h6>
                    <p className="mb-0">{error}</p>
                </div>
            )}

            {/* Page Content */}
            {!loading && !error && (
                <div className={contentClassName}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default PageLayout;
