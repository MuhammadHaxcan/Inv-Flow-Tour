import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Modal = ({ show, onClose, title, children }) => {
    const modalBodyRef = useRef(null);

    // Auto-focus the first input element when modal opens
    useEffect(() => {
        if (show && modalBodyRef.current) {
            // Small delay to ensure the modal content is rendered
            const timer = setTimeout(() => {
                const focusableElements = modalBodyRef.current.querySelectorAll(
                    'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
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