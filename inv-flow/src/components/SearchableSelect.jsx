import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';

const SearchableSelect = ({
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    className = '',
    required = false,
    getOptionLabel = (option) => option.label || option.name || option,
    getOptionValue = (option) => option.value || option.name || option,
    disabled = false,
    size = 'md' // 'sm' or 'md'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const blurTimeoutRef = useRef(null);
    const justSelectedRef = useRef(false); // Track if we just made a selection

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                // Also check if click is on the portal dropdown
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false);
                    setSearchTerm('');
                    setHighlightedIndex(-1);
                    // Blur the input
                    if (inputRef.current) {
                        inputRef.current.blur();
                    }
                }
            }
        };

        // Use capture phase to catch events earlier
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('touchstart', handleClickOutside, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('touchstart', handleClickOutside, true);
        };
    }, [isOpen]);

    // Cleanup blur timeout on unmount
    useEffect(() => {
        return () => {
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
            }
        };
    }, []);

    // Calculate dropdown position and focus input when dropdown opens
    const updateDropdownPosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Use viewport-relative coordinates directly since we use position: 'fixed'
            // Don't add window.scrollY/scrollX as getBoundingClientRect already gives viewport coords
            setDropdownPosition({
                top: rect.bottom + 4, // 4px margin below the input
                left: rect.left,
                width: rect.width
            });
        }
    };

    // Get selected option label
    const selectedOption = options.find(opt => getOptionValue(opt) === value);
    const selectedLabel = selectedOption ? getOptionLabel(selectedOption) : '';

    useEffect(() => {
        if (isOpen && inputRef.current && containerRef.current) {
            inputRef.current.focus();
            updateDropdownPosition();

            // If there's a selected value and no search term yet, start with it
            if (selectedLabel && searchTerm === '') {
                setSearchTerm(selectedLabel);
                // Select all text so user can start typing
                setTimeout(() => {
                    if (inputRef.current) {
                        inputRef.current.select();
                    }
                }, 0);
            }

            // Update position on scroll and resize
            const handleScroll = () => updateDropdownPosition();
            const handleResize = () => updateDropdownPosition();

            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('scroll', handleScroll, true);
                window.removeEventListener('resize', handleResize);
                // Clear any pending timeouts
                if (blurTimeoutRef.current) {
                    clearTimeout(blurTimeoutRef.current);
                    blurTimeoutRef.current = null;
                }
            };
        }
    }, [isOpen, selectedLabel]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && dropdownRef.current) {
            const highlightedElement = dropdownRef.current.children[highlightedIndex];
            if (highlightedElement) {
                highlightedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    // Memoized filtered options for performance
    const filteredOptions = useMemo(() =>
        options.filter(option => {
            const label = getOptionLabel(option).toLowerCase();
            return label.includes(searchTerm.toLowerCase());
        }), [options, searchTerm, getOptionLabel]
    );

    // Handle option selection
    const handleSelect = (option) => {
        // Clear any pending blur timeout
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
        }
        
        const optionValue = getOptionValue(option);
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        
        // Mark that we just selected - prevents dropdown from reopening on focus
        justSelectedRef.current = true;
        
        // Keep focus on the input but don't reopen dropdown
        if (inputRef.current) {
            inputRef.current.focus();
        }
        
        // Reset the flag after a short delay
        setTimeout(() => {
            justSelectedRef.current = false;
        }, 100);
    };

    // Handle input blur
    const handleBlur = (e) => {
        // Use setTimeout to allow click events on dropdown options to fire first
        blurTimeoutRef.current = setTimeout(() => {
            // Check if the related target (element receiving focus) is not in the dropdown
            const relatedTarget = e.relatedTarget || document.activeElement;
            if (
                dropdownRef.current && 
                relatedTarget && 
                !dropdownRef.current.contains(relatedTarget) &&
                containerRef.current &&
                !containerRef.current.contains(relatedTarget)
            ) {
                setIsOpen(false);
                setSearchTerm('');
                setHighlightedIndex(-1);
            }
        }, 200); // Small delay to allow click events to process
    };

    // Handle keyboard navigation and typing
    const handleKeyDown = (e) => {
        if (!isOpen) {
            // Open dropdown on any key press
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || 
                (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey)) {
                e.preventDefault();
                setIsOpen(true);
                // If it's a character, start searching with it
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    setSearchTerm(e.key);
                }
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                } else if (filteredOptions.length === 1) {
                    // If only one option matches, select it
                    handleSelect(filteredOptions[0]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSearchTerm('');
                setHighlightedIndex(-1);
                break;
            case 'Backspace':
                // Allow backspace to work in the input
                break;
            default:
                // Allow typing to work in the input
                break;
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setHighlightedIndex(-1);
    };

    // Handle clear button
    const handleClear = (e) => {
        e.stopPropagation();
        onChange({ target: { value: '' } });
        setSearchTerm('');
    };

    // Size classes
    const inputSizeClass = size === 'sm' ? 'form-control-sm' : '';

    // Display value: show search term when open and typing, selected label when closed
    const displayValue = isOpen ? searchTerm : (selectedLabel || '');

    return (
        <>
            <div ref={containerRef} className={`position-relative ${className}`}>
                <div style={{ position: 'relative' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={`form-control ${inputSizeClass}`}
                        value={displayValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onClick={() => !disabled && !justSelectedRef.current && setIsOpen(true)}
                        onFocus={() => !disabled && !justSelectedRef.current && setIsOpen(true)}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={!isOpen}
                        style={{
                            cursor: disabled ? 'not-allowed' : isOpen ? 'text' : 'pointer',
                            paddingRight: '1.75rem',
                            backgroundColor: disabled ? '#e9ecef' : '#fff'
                        }}
                        role="combobox"
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                        aria-autocomplete="list"
                        aria-controls={isOpen ? "searchable-select-listbox" : undefined}
                        aria-label={placeholder || "Select an option"}
                        aria-describedby={value ? `selected-option-${getOptionValue(selectedOption)}` : undefined}
                    />
                    <div 
                        style={{ 
                            position: 'absolute', 
                            right: '0.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            pointerEvents: 'auto'
                        }}
                    >
                        {value && !disabled && !isOpen && (
                            <X 
                                size={14} 
                                className="text-muted"
                                onClick={handleClear}
                                style={{ cursor: 'pointer' }}
                                role="button"
                                aria-label="Clear selection"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleClear(e);
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    id="searchable-select-listbox"
                    role="listbox"
                    className="bg-white border rounded shadow-lg"
                    style={{
                        position: 'fixed',
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                        zIndex: 99999,
                        maxHeight: '280px',
                        overflowY: 'auto'
                    }}
                >
                    {filteredOptions.length === 0 ? (
                        <div className="p-3 text-center text-muted small" role="status" aria-live="polite">
                            No options found
                        </div>
                    ) : (
                        filteredOptions.map((option, index) => {
                            const optionValue = getOptionValue(option);
                            const optionLabel = getOptionLabel(option);
                            const isSelected = optionValue === value;
                            const isHighlighted = index === highlightedIndex;

                            return (
                                <div
                                    key={optionValue}
                                    role="option"
                                    aria-selected={isSelected}
                                    id={`option-${optionValue}`}
                                    className={`px-3 py-2 d-flex align-items-center justify-content-between ${
                                        isHighlighted ? 'bg-primary text-white' : 
                                        isSelected ? 'bg-light fw-medium' : ''
                                    }`}
                                    style={{
                                        cursor: 'pointer',
                                        borderBottom: index < filteredOptions.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        fontSize: size === 'sm' ? '0.875rem' : '1rem',
                                        transition: 'background-color 0.15s ease'
                                    }}
                                    onClick={() => handleSelect(option)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    <span>{optionLabel}</span>
                                    {isSelected && (
                                        <Check size={14} className={isHighlighted ? 'text-white' : 'text-primary'} aria-hidden="true" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>,
                document.body
            )}
        </>
    );
};

export default SearchableSelect;

