import React, { memo } from 'react';

/**
 * Standardized status badge component for consistent status display across the app
 * @param {string} status - The status value
 * @param {Object} options - Configuration options
 * @param {Object} options.statusConfig - Custom status configurations
 * @param {string} options.size - Size variant ('sm', 'md', 'lg')
 * @param {string} options.variant - Bootstrap variant or custom class
 */
const StatusBadge = memo(({
    status,
    statusConfig = {},
    size = 'md',
    variant = 'badge',
    className = ''
}) => {
    // Default status configurations
    const defaultConfig = {
        paid: { text: 'Paid', className: 'bg-success text-white' },
        partial: { text: 'Partial', className: 'bg-warning text-dark' },
        unpaid: { text: 'Unpaid', className: 'bg-danger text-white' },
        active: { text: 'Active', className: 'bg-success text-white' },
        inactive: { text: 'Inactive', className: 'bg-secondary text-white' },
        pending: { text: 'Pending', className: 'bg-warning text-dark' },
        completed: { text: 'Completed', className: 'bg-success text-white' },
        cancelled: { text: 'Cancelled', className: 'bg-danger text-white' },
        draft: { text: 'Draft', className: 'bg-info text-white' },
        sent: { text: 'Sent', className: 'bg-primary text-white' },
        ...statusConfig
    };

    const config = defaultConfig[status] || {
        text: status || 'Unknown',
        className: 'bg-secondary text-white'
    };

    // Size classes
    const sizeClasses = {
        sm: 'badge-sm px-2 py-1',
        md: 'px-2 py-1',
        lg: 'badge-lg px-3 py-2'
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;

    return (
        <span
            className={`${variant} ${config.className} ${sizeClass} ${className}`.trim()}
        >
            {config.text}
        </span>
    );
};

});

export default StatusBadge;
