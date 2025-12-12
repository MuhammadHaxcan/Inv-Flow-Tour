import React, { useState, useEffect, useMemo } from 'react';
import SearchableSelect from './SearchableSelect';

const ServiceForm = ({ servicesList, onSave, onCancel, invoice, service, existingServices = [] }) => {
    // Initialize state from props
    const [selectedService, setSelectedService] = useState(service?.service || '');
    const [rate, setRate] = useState(service?.rate || '');
    
    // Update form when service prop changes
    useEffect(() => {
        if (service) {
            // If editing an existing service, load its values
            setSelectedService(service.service || '');
            setRate(service.rate || '');
        }
    }, [service]);

    // Filter out already-used services (except the one being edited)
    const availableServices = useMemo(() => {
        const usedServiceNames = existingServices
            .filter(s => !service || s.id !== service.id) // Exclude the service being edited
            .map(s => s.service);
        
        return servicesList.filter(s => !usedServiceNames.includes(s.name));
    }, [servicesList, existingServices, service]);
    
    // Handle service selection
    const handleServiceChange = (e) => {
        const serviceName = e.target.value;
        setSelectedService(serviceName);
        
        // Only auto-fill rate if this is a new service (not editing)
        if (serviceName && !service) {
            const serviceInfo = servicesList.find(s => s.name === serviceName);
            if (serviceInfo) {
                setRate(serviceInfo.vatIncluded);
            }
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Pass the values back to parent component
        onSave(selectedService, parseFloat(rate));
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Service</label>
                <SearchableSelect
                    value={selectedService}
                    onChange={handleServiceChange}
                    options={availableServices.map(s => ({ value: s.name, label: s.name }))}
                    placeholder="Select Service"
                    required
                    inModal={true}
                />
                {availableServices.length === 0 && !service && (
                    <small className="text-warning d-block mt-1">
                        All services have been added to this invoice.
                    </small>
                )}
            </div>
            <div className="mb-3">
                <label className="form-label">Rate (AED with VAT)</label>
                <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="form-control"
                    placeholder="0.00"
                    step="0.01"
                    required
                />
                {rate && (
                    <small className="text-muted">
                        (Excl. VAT: AED {(parseFloat(rate) / 1.05).toFixed(2)})
                    </small>
                )}
            </div>
            <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    {service ? 'Update Service' : 'Add Service'}
                </button>
            </div>
        </form>
    );
};

export default ServiceForm;