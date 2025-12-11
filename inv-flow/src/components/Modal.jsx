import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Modal = ({ show, onClose, title, children, size = 'lg' }) => {
    const modalBodyRef = useRef(null);
    const modalRef = useRef(null);
    const previousActiveElementRef = useRef(null);
    const onCloseRef = useRef(onClose);

    // Keep latest onClose without re-triggering focus effect
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Size mapping
    const sizeClass = {
        sm: 'modal-sm',
        md: 'modal-md',
        lg: 'modal-lg',
        xl: 'modal-xl'
    }[size] || 'modal-lg';

    // Auto-focus the first input element when modal opens and trap focus
    useEffect(() => {
        if (show && modalBodyRef.current) {
            // Store the previously active element
            previousActiveElementRef.current = document.activeElement;

            // Small delay to ensure the modal content is rendered
            const timer = setTimeout(() => {
                const bodyElement = modalBodyRef.current;
                if (!bodyElement) return;

                // If user already focused inside the modal, don't steal focus
                if (bodyElement.contains(document.activeElement)) {
                    return;
                }

                const focusableElements = bodyElement.querySelectorAll(
                    'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }, 50);

            // Focus trap - keep focus within modal
            const handleTabKey = (e) => {
                if (e.key !== 'Tab') return;

                const focusableElements = modalBodyRef.current.querySelectorAll(
                    'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );

                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            };

            // Handle Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape' && show) {
                    onCloseRef.current && onCloseRef.current();
                }
            };

            const modalElement = modalRef.current;
            if (modalElement) {
                modalElement.addEventListener('keydown', handleTabKey);
                modalElement.addEventListener('keydown', handleEscape);
            }

            return () => {
                clearTimeout(timer);
                if (modalElement) {
                    modalElement.removeEventListener('keydown', handleTabKey);
                    modalElement.removeEventListener('keydown', handleEscape);
                }
                // Restore focus to previous element when modal closes
                if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
                    previousActiveElementRef.current.focus();
                }
            };
        }
    }, [show]);

    if (!show) return null;

    return (
        <div 
            ref={modalRef}
            className="modal fade show d-block" 
            tabIndex="-1" 
            role="dialog" 
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div className={`modal-dialog modal-dialog-centered ${sizeClass}`} role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        {title && <h5 className="modal-title" id="modal-title">{title}</h5>}
                        <button 
                            type="button" 
                            className="btn-close" 
                            aria-label="Close modal" 
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body" ref={modalBodyRef}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;