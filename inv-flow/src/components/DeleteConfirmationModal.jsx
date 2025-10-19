import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmationModal = ({ 
    show, 
    onClose, 
    onConfirm, 
    title = "Confirm Delete", 
    message = "Are you sure you want to delete this item?",
    itemName = "",
    confirmButtonText = "Delete",
    confirmButtonVariant = "danger"
}) => {
    return (
        <Modal show={show} onClose={onClose} title={title}>
            <div className="text-center mb-4">
                <div className="d-flex justify-content-center mb-3">
                    <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                        <AlertTriangle size={40} className="text-warning" />
                    </div>
                </div>
                <p className="mb-1">{message}</p>
                {itemName && <p className="fw-bold mb-0">"{itemName}"</p>}
                <p className="text-muted mt-2 small">This action cannot be undone.</p>
            </div>
            <div className="d-flex justify-content-center gap-2">
                <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button 
                    type="button" 
                    className={`btn btn-${confirmButtonVariant} px-4`}
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                >
                    {confirmButtonText}
                </button>
            </div>
        </Modal>
    );
};

export default DeleteConfirmationModal;