import React from 'react';
import Modal from './Modal';
import { AlertTriangle, HelpCircle, Info, CheckCircle, XCircle } from 'lucide-react';

const StatusModal = ({
    show,
    onClose,
    onConfirm,
    title,
    message = "",
    itemName = "",
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
    confirmButtonVariant = "primary",
    type = "confirm", // confirm, success, error, warning, info
    loading = false,
    showCancelButton = true,
    children
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={40} className="text-success" />;
            case 'error':
                return <XCircle size={40} className="text-danger" />;
            case 'warning':
                return <AlertTriangle size={40} className="text-warning" />;
            case 'info':
                return <Info size={40} className="text-info" />;
            case 'confirm':
            default:
                return <HelpCircle size={40} className="text-primary" />;
        }
    };

    const getIconBgClass = () => {
        switch (type) {
            case 'success':
                return 'bg-success bg-opacity-10';
            case 'error':
                return 'bg-danger bg-opacity-10';
            case 'warning':
                return 'bg-warning bg-opacity-10';
            case 'info':
                return 'bg-info bg-opacity-10';
            case 'confirm':
            default:
                return 'bg-primary bg-opacity-10';
        }
    };

    const getButtonVariant = () => {
        if (confirmButtonVariant !== 'primary') return confirmButtonVariant;
        switch (type) {
            case 'success':
                return 'success';
            case 'error':
                return 'danger';
            case 'warning':
                return 'warning';
            default:
                return 'primary';
        }
    };

    const getDefaultTitle = () => {
        if (title) return title;
        switch (type) {
            case 'success':
                return 'Success';
            case 'error':
                return 'Error';
            case 'warning':
                return 'Warning';
            case 'info':
                return 'Information';
            case 'confirm':
            default:
                return 'Confirm Action';
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={getDefaultTitle()}>
            <div className="text-center mb-4">
                <div className="d-flex justify-content-center mb-3">
                    <div className={`${getIconBgClass()} p-3 rounded-circle`}>
                        {getIcon()}
                    </div>
                </div>
                <p className="mb-1">{message}</p>
                {itemName && <p className="fw-bold mb-0">"{itemName}"</p>}
                {type === 'confirm' && (
                    <p className="text-muted mt-2 small">This action cannot be undone.</p>
                )}
                {children}
            </div>
            <div className="d-flex justify-content-center gap-2">
                {showCancelButton && (
                    <button
                        type="button"
                        className="btn btn-outline-secondary px-4"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelButtonText}
                    </button>
                )}
                <button
                    type="button"
                    className={`btn btn-${getButtonVariant()} px-4`}
                    onClick={handleConfirm}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                            Processing...
                        </>
                    ) : confirmButtonText}
                </button>
            </div>
        </Modal>
    );
};

export default StatusModal;
