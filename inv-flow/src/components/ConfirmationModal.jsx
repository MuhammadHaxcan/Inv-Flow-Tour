import React from 'react';
import StatusModal from './StatusModal';

// Maintain backward compatibility by mapping old type names to new ones
const typeMapping = {
    danger: 'error',
    confirm: 'confirm'
};

const ConfirmationModal = ({
    show,
    onClose,
    onConfirm,
    title,
    message = "Are you sure you want to proceed?",
    itemName = "",
    confirmButtonText = "Confirm",
    cancelButtonText = "Cancel",
    confirmButtonVariant,
    type = "confirm",
    loading = false,
    children
}) => {
    // Map old type names to new ones for backward compatibility
    const mappedType = typeMapping[type] || type;

    return (
        <StatusModal
            show={show}
            onClose={onClose}
            onConfirm={onConfirm}
            title={title}
            message={message}
            itemName={itemName}
            confirmButtonText={confirmButtonText}
            cancelButtonText={cancelButtonText}
            confirmButtonVariant={confirmButtonVariant}
            type={mappedType}
            loading={loading}
            showCancelButton={true}
        >
            {children}
        </StatusModal>
    );
};

export default ConfirmationModal;

