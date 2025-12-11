import React from 'react';

/**
 * Standardized card component for consistent layouts
 * @param {Object} props - Card properties
 */
const Card = ({
    children,
    title,
    subtitle,
    headerActions,
    footer,
    className = '',
    shadow = true,
    border = true,
    bodyClassName = '',
    ...props
}) => {
    const cardClasses = [
        'card',
        shadow && 'shadow',
        border === false && 'border-0',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={cardClasses} {...props}>
            {(title || subtitle || headerActions) && (
                <div className="card-header bg-light py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            {title && <h5 className="card-title mb-0 fw-bold">{title}</h5>}
                            {subtitle && <p className="card-subtitle mb-0 text-muted small">{subtitle}</p>}
                        </div>
                        {headerActions && (
                            <div className="d-flex gap-2">
                                {headerActions}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={`card-body ${bodyClassName}`}>
                {children}
            </div>

            {footer && (
                <div className="card-footer bg-light">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
