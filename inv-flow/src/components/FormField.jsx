import React from 'react';

/**
 * Standardized form field component for consistent form styling and validation
 * @param {Object} props - Form field properties
 */
const FormField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    required = false,
    placeholder = '',
    disabled = false,
    className = '',
    children,
    helpText = '',
    size = 'md', // 'sm', 'md', 'lg'
    ...props
}) => {
    const inputId = `field-${name}`;

    const inputClasses = [
        'form-control',
        size === 'sm' && 'form-control-sm',
        size === 'lg' && 'form-control-lg',
        error && 'is-invalid',
        className
    ].filter(Boolean).join(' ');

    const labelClasses = [
        'form-label',
        required && 'required'
    ].filter(Boolean).join(' ');

    return (
        <div className="mb-3">
            {label && (
                <label htmlFor={inputId} className={labelClasses}>
                    {label}
                    {required && <span className="text-danger ms-1">*</span>}
                </label>
            )}

            {children ? (
                <div className={error ? 'is-invalid' : ''}>
                    {React.cloneElement(children, {
                        id: inputId,
                        name,
                        value,
                        onChange,
                        onBlur,
                        disabled,
                        className: inputClasses,
                        'aria-describedby': error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined,
                        ...props
                    })}
                </div>
            ) : (
                <input
                    id={inputId}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={inputClasses}
                    aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
                    {...props}
                />
            )}

            {error && (
                <div id={`${inputId}-error`} className="invalid-feedback d-block">
                    {error}
                </div>
            )}

            {helpText && !error && (
                <div id={`${inputId}-help`} className="form-text">
                    {helpText}
                </div>
            )}
        </div>
    );
};

export default FormField;
