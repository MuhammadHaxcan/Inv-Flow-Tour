import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

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

    // Close dropdown when clicking outside
    useEffect(() => {
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

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
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
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4, // 4px margin
                left: rect.left + window.scrollX,
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

    // Filter options based on search term
    const filteredOptions = options.filter(option => {
        const label = getOptionLabel(option).toLowerCase();
        return label.includes(searchTerm.toLowerCase());
    });

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
        // Blur the input to remove focus
        if (inputRef.current) {
            inputRef.current.blur();
        }
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
                        className={`form-control ${inputSizeClass} ${!value && required ? 'is-invalid' : ''}`}
                        value={displayValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onClick={() => !disabled && setIsOpen(true)}
                        onFocus={() => !disabled && setIsOpen(true)}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={!isOpen}
                        style={{
                            cursor: disabled ? 'not-allowed' : isOpen ? 'text' : 'pointer',
                            paddingRight: value && !disabled && !isOpen ? '2.5rem' : '0.75rem'
                        }}
                        role="combobox"
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                    />
                    {value && !disabled && !isOpen && (
                        <div style={{ 
                            position: 'absolute', 
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'auto'
                        }}>
                            <X 
                                size={14} 
                                className="text-muted"
                                onClick={handleClear}
                                style={{ cursor: 'pointer' }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className="bg-white border rounded shadow-lg"
                    style={{
                        position: 'fixed',
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`,
                        zIndex: 99999,
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}
                >
                    {filteredOptions.length === 0 ? (
                        <div className="p-3 text-center text-muted">
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
                                    className={`p-2 ${isHighlighted ? 'bg-primary text-white' : isSelected ? 'bg-light' : ''}`}
                                    style={{
                                        cursor: 'pointer',
                                        borderBottom: index < filteredOptions.length - 1 ? '1px solid #e9ecef' : 'none'
                                    }}
                                    onClick={() => handleSelect(option)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    {optionLabel}
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

