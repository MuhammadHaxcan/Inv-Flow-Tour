import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Info } from 'lucide-react';
import ServiceModal from '../components/ServiceModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useData } from '../contexts/DataContext';

const Services = () => {
    // Use data context
    const { services, addService, updateService, deleteService, loadServices, loadingStates } = useData();

    // Load services when component mounts
    useEffect(() => {
        loadServices();
    }, [loadServices]);
    
    // States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);

    // Format amount to AED
    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
    };

    // Open modal for adding new service
    const handleAddService = () => {
        setCurrentService(null);
        setIsModalOpen(true);
    };

    // Open modal for editing existing service
    const handleEditService = (service) => {
        setCurrentService(service);
        setIsModalOpen(true);
    };

    // Handle service deletion
    const handleDeleteService = (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            deleteService(id);
        }
    };

    // Handle form submission
    const handleSaveService = (serviceData) => {
        if (currentService) {
            // Updating existing service
            updateService({ 
                ...currentService,
                name: serviceData.name, 
                description: serviceData.description, 
                charge: serviceData.charge,
                vatIncluded: serviceData.vatIncluded
            });
        } else {
            // Adding new service
            addService({
                name: serviceData.name,
                description: serviceData.description,
                charge: serviceData.charge,
                vatIncluded: serviceData.vatIncluded
            });
        }

        setIsModalOpen(false);
    };

    if (loadingStates.services) {
        return (
            <div className="content-wrapper py-3 px-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading services...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="content-wrapper">
                <div className="card shadow">
                    <div className="card-header bg-light py-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Services</h3>
                            <button 
                                className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                                onClick={handleAddService}
                            >
                                <Plus size={16} />
                                Add Service 
                            </button>
                        </div>
                    </div>      
                    
                    <div className="alert alert-info mx-4 mt-3 mb-0 py-2 d-flex align-items-center gap-2">
                        <Info size={16} />
                        <span className="small">Service prices can be entered with or without VAT. The system will automatically calculate the other amount.</span>
                    </div>
                    
                    <div className="card-body p-0 mt-3">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Service Name</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 text-end">With VAT</th>
                                        <th className="px-4 py-3 text-end">Without VAT</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">
                                                No services found
                                            </td>
                                        </tr>
                                    ) : (
                                        services.map(service => (
                                            <tr key={service.id}>
                                                <td className="px-4 py-3 fw-medium">{service.name}</td>
                                                <td className="px-4 py-3 text-muted">{service.description || '-'}</td>
                                                <td className="px-4 py-3 text-end fw-bold">{formatCurrency(service.vatIncluded)}</td>
                                                <td className="px-4 py-3 text-end text-muted">{formatCurrency(service.charge)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button 
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => handleEditService(service)}
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleDeleteService(service.id)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Modal */}
            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveService}
                service={currentService}
            />
        </>
    );
};

export default Services;