import React from 'react';
import StatusModal from './StatusModal';

const AlertModal = ({
    show,
    onClose,
    title,
    message = "",
    type = "info", // success, error, warning, info
    buttonText = "OK"
}) => {
    return (
        <StatusModal
            show={show}
            onClose={onClose}
            onConfirm={onClose}
            title={title}
            message={message}
            confirmButtonText={buttonText}
            type={type}
            loading={false}
            showCancelButton={false}
        />
    );
};

export default AlertModal;

