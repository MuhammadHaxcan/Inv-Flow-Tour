import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';

const Services = () => {
    // States
    const [services, setServices] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        charge: ''
    });

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

    // Calculate VAT included amount (5% VAT)
    const calculateVatIncluded = (amount) => {
        const vat = parseFloat(amount) * 0.05;
        return parseFloat(amount) + vat;
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Open modal for adding new service
    const handleAddService = () => {
        setCurrentService(null);
        setFormData({
            name: '',
            description: '',
            charge: ''
        });
        setIsModalOpen(true);
    };

    // Open modal for editing existing service
    const handleEditService = (service) => {
        setCurrentService(service);
        setFormData({
            name: service.name,
            description: service.description,
            charge: service.charge.toString()
        });
        setIsModalOpen(true);
    };

    // Handle service deletion
    const handleDeleteService = (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            setServices(services.filter(service => service.id !== id));
        }
    };

    // Handle form submission
    const handleSubmit = () => {
        const charge = parseFloat(formData.charge);
        
        if (!formData.name || !charge || isNaN(charge)) {
            alert('Please enter a valid service name and charge');
            return;
        }

        if (currentService) {
            // Updating existing service
            const updatedServices = services.map(service => 
                service.id === currentService.id 
                    ? { 
                        ...service, 
                        name: formData.name, 
                        description: formData.description, 
                        charge: charge,
                        vatIncluded: calculateVatIncluded(charge)
                    } 
                    : service
            );
            setServices(updatedServices);
        } else {
            // Adding new service
            const newService = {
                id: services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1,
                name: formData.name,
                description: formData.description,
                charge: charge,
                vatIncluded: calculateVatIncluded(charge)
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
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Service Name</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 text-end">Charge (Without VAT)</th>
                                        <th className="px-4 py-3 text-end">Charge (With VAT)</th>
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
                                                <td className="px-4 py-3 text-end">{formatCurrency(service.charge)}</td>
                                                <td className="px-4 py-3 text-end">{formatCurrency(service.vatIncluded)}</td>
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
            {isModalOpen && (
                <Modal 
                    title={currentService ? "Edit Service" : "Add New Service"}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSubmit}
                >
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
                    <div className="mb-3">
                        <label htmlFor="charge" className="form-label">Service Charge (Without VAT)</label>
                        <div className="input-group">
                            <span className="input-group-text">AED</span>
                            <input 
                                type="number" 
                                className="form-control" 
                                id="charge" 
                                name="charge"
                                value={formData.charge}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    {formData.charge && !isNaN(parseFloat(formData.charge)) && (
                        <div className="alert alert-info d-flex justify-content-between align-items-center">
                            <span>With 5% VAT:</span>
                            <strong>{formatCurrency(calculateVatIncluded(formData.charge))}</strong>
                        </div>
                    )}
                </Modal>
            )}
        </>
    );
};

export default Services;