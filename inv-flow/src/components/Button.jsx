import React from 'react';

/**
 * Standardized button component for consistent styling and behavior
 * @param {Object} props - Button properties
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    loadingText = 'Loading...',
    type = 'button',
    className = '',
    onClick,
    ...props
}) => {
    const buttonClasses = [
        'btn',
        `btn-${variant}`,
        size === 'sm' && 'btn-sm',
        size === 'lg' && 'btn-lg',
        loading && 'disabled',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={buttonClasses}
            disabled={disabled || loading}
            onClick={loading ? undefined : onClick}
            {...props}
        >
            {loading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {loadingText}
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
