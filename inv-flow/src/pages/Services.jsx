import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Info } from 'lucide-react';
import ServiceModal from '../components/ServiceModal';
import 'bootstrap/dist/css/bootstrap.min.css';

const Services = () => {
    // States
    const [services, setServices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);

    // Sample data - normally would come from API
    useEffect(() => {
        const sampleServices = [
            { 
                id: 1, 
                name: 'Airport Transfer', 
                description: 'Pickup and drop off service to and from airport',
                charge: 4000,
                vatIncluded: 4200 // 5% VAT included
            },
            { 
                id: 2, 
                name: 'City Tour', 
                description: 'Full day city sightseeing tour',
                charge: 5500,
                vatIncluded: 5775 // 5% VAT included
            },
            { 
                id: 3, 
                name: 'Hourly Rental', 
                description: 'Vehicle rental on hourly basis',
                charge: 3000,
                vatIncluded: 3150 // 5% VAT included
            },
            { 
                id: 4, 
                name: 'Outstation', 
                description: 'Multi-day tour outside the city',
                charge: 15000,
                vatIncluded: 15750 // 5% VAT included
            }
        ];
        setServices(sampleServices);
    }, []);

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
            setServices(services.filter(service => service.id !== id));
        }
    };

    // Handle form submission
    const handleSaveService = (serviceData) => {
        if (currentService) {
            // Updating existing service
            const updatedServices = services.map(service => 
                service.id === currentService.id 
                    ? { 
                        ...service, 
                        name: serviceData.name, 
                        description: serviceData.description, 
                        charge: serviceData.charge,
                        vatIncluded: serviceData.vatIncluded
                    } 
                    : service
            );
            setServices(updatedServices);
        } else {
            // Adding new service
            const newService = {
                id: services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1,
                name: serviceData.name,
                description: serviceData.description,
                charge: serviceData.charge,
                vatIncluded: serviceData.vatIncluded
            };
            setServices([...services, newService]);
        }

        setIsModalOpen(false);
    };

    return (
        <>
            <div className="content-wrapper py-3 px-4">
                <div className="card shadow">
                    <div className="card-header bg-light py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Services</h3>
                            <button 
                                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                                onClick={handleAddService}
                            >
                                <Plus size={16} />
                                Add Service 
                            </button>
                        </div>
                    </div>      
                    
                    <div className="alert alert-info mx-3 mt-3 d-flex align-items-center gap-2">
                        <Info size={18} />
                        <span>You can enter service prices either with or without VAT. The system will automatically calculate the other amount.</span>
                    </div>
                    
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Service Name</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 text-end">Charge (With VAT)</th>
                                        <th className="px-4 py-3 text-end">Charge (Without VAT)</th>
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
                                                <td className="px-4 py-3">{service.description}</td>
                                                <td className="px-4 py-3 text-end fw-medium">{formatCurrency(service.vatIncluded)}</td>
                                                <td className="px-4 py-3 text-end text-muted">{formatCurrency(service.charge)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button 
                                                            className="btn btn-outline-primary btn-sm"
                                                            onClick={() => handleEditService(service)}
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleDeleteService(service.id)}
                                                        >
                                                            <Trash2 size={16} />
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