import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const AlertModal = ({ 
    show, 
    onClose, 
    title,
    message = "",
    type = "info", // success, error, warning, info
    buttonText = "OK"
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={40} className="text-success" />;
            case 'error':
                return <XCircle size={40} className="text-danger" />;
            case 'warning':
                return <AlertTriangle size={40} className="text-warning" />;
            default:
                return <Info size={40} className="text-info" />;
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
            default:
                return 'bg-info bg-opacity-10';
        }
    };

    const getButtonVariant = () => {
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

    const getTitle = () => {
        if (title) return title;
        switch (type) {
            case 'success':
                return 'Success';
            case 'error':
                return 'Error';
            case 'warning':
                return 'Warning';
            default:
                return 'Information';
        }
    };

    return (
        <Modal show={show} onClose={onClose} title={getTitle()}>
            <div className="text-center mb-4">
                <div className="d-flex justify-content-center mb-3">
                    <div className={`${getIconBgClass()} p-3 rounded-circle`}>
                        {getIcon()}
                    </div>
                </div>
                <p className="mb-0">{message}</p>
            </div>
            <div className="d-flex justify-content-center">
                <button 
                    type="button" 
                    className={`btn btn-${getButtonVariant()} px-5`}
                    onClick={onClose}
                >
                    {buttonText}
                </button>
            </div>
        </Modal>
    );
};

export default AlertModal;

