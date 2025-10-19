import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import 'bootstrap/dist/css/bootstrap.min.css';

const ServiceModal = ({ isOpen, onClose, onSave, service = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        chargeWithVAT: '',
        chargeWithoutVAT: ''
    });
    
    const [inputMode, setInputMode] = useState('withVAT'); // 'withVAT' or 'withoutVAT'

    // Format amount to AED
    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
    };

    // Calculate amount without VAT (divide by 1.05)
    const calculateWithoutVAT = (amountWithVAT) => {
        return parseFloat(amountWithVAT) / 1.05;
    };

    // Calculate amount with VAT (multiply by 1.05)
    const calculateWithVAT = (amountWithoutVAT) => {
        return parseFloat(amountWithoutVAT) * 1.05;
    };

    // Initialize form data when editing an existing service
    useEffect(() => {
        if (service) {
            setFormData({
                name: service.name || '',
                description: service.description || '',
                chargeWithVAT: service.vatIncluded ? service.vatIncluded.toString() : '',
                chargeWithoutVAT: service.charge ? service.charge.toString() : ''
            });
        } else {
            // Reset form when adding a new service
            setFormData({
                name: '',
                description: '',
                chargeWithVAT: '',
                chargeWithoutVAT: ''
            });
        }
    }, [service, isOpen]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'chargeWithVAT' && inputMode === 'withVAT') {
            const withoutVAT = value ? calculateWithoutVAT(value) : '';
            setFormData({
                ...formData,
                chargeWithVAT: value,
                chargeWithoutVAT: withoutVAT.toString()
            });
        } else if (name === 'chargeWithoutVAT' && inputMode === 'withoutVAT') {
            const withVAT = value ? calculateWithVAT(value) : '';
            setFormData({
                ...formData,
                chargeWithoutVAT: value,
                chargeWithVAT: withVAT.toString()
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    // Toggle input mode
    const toggleInputMode = () => {
        setInputMode(inputMode === 'withVAT' ? 'withoutVAT' : 'withVAT');
    };

    // Handle form submission
    const handleSubmit = () => {
        const chargeWithVAT = parseFloat(formData.chargeWithVAT);
        const chargeWithoutVAT = parseFloat(formData.chargeWithoutVAT);
        
        if (!formData.name || !chargeWithVAT || isNaN(chargeWithVAT)) {
            alert('Please enter a valid service name and charge');
            return;
        }

        const serviceData = {
            ...formData,
            charge: chargeWithoutVAT,
            vatIncluded: chargeWithVAT
        };

        onSave(serviceData);
    };

    return (
        <Modal 
            show={isOpen} 
            onClose={onClose}
            title={service ? "Edit Service" : "Add New Service"}
        >
            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Service Name</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="name" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea 
                        className="form-control" 
                        id="description" 
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                    ></textarea>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label mb-0 fw-medium">Service Charge</label>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="inputModeSwitch"
                            checked={inputMode === 'withoutVAT'}
                            onChange={toggleInputMode}
                        />
                        <label className="form-check-label" htmlFor="inputModeSwitch">
                            {inputMode === 'withVAT' ? 'Enter with VAT' : 'Enter without VAT'}
                        </label>
                    </div>
                </div>
                
                {inputMode === 'withVAT' ? (
                    <>
                        <div className="mb-3">
                            <label htmlFor="chargeWithVAT" className="form-label">Charge (With VAT)</label>
                            <div className="input-group">
                                <span className="input-group-text">AED</span>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    id="chargeWithVAT" 
                                    name="chargeWithVAT"
                                    value={formData.chargeWithVAT}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                />
                            </div>
                        </div>
                        
                        {formData.chargeWithVAT && !isNaN(parseFloat(formData.chargeWithVAT)) && (
                            <div className="alert alert-secondary d-flex justify-content-between align-items-center mb-3">
                                <span>Without 5% VAT:</span>
                                <strong>{formatCurrency(formData.chargeWithoutVAT)}</strong>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="mb-3">
                            <label htmlFor="chargeWithoutVAT" className="form-label">Charge (Without VAT)</label>
                            <div className="input-group">
                                <span className="input-group-text">AED</span>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    id="chargeWithoutVAT" 
                                    name="chargeWithoutVAT"
                                    value={formData.chargeWithoutVAT}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                />
                            </div>
                        </div>
                        
                        {formData.chargeWithoutVAT && !isNaN(parseFloat(formData.chargeWithoutVAT)) && (
                            <div className="alert alert-info d-flex justify-content-between align-items-center mb-3">
                                <span>With 5% VAT:</span>
                                <strong>{formatCurrency(formData.chargeWithVAT)}</strong>
                            </div>
                        )}
                    </>
                )}
                
                <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        {service ? "Update" : "Save"} Service
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ServiceModal;