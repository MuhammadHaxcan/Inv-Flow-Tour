import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Info, Package } from 'lucide-react';
import ServiceModal from '../components/ServiceModal';
import ConfirmationModal from '../components/ConfirmationModal';
import AlertModal from '../components/AlertModal';
import { useData } from '../contexts/DataContext';
import { usePermissions } from '../hooks/usePermissions';
import 'bootstrap/dist/css/bootstrap.min.css';

const Services = () => {
    // Use data context
    const { services, addService, updateService, deleteService, loadServices, loadingStates } = useData();

    // Permissions
    const { canWriteServices, canDeleteServices } = usePermissions();

    // Load services when component mounts
    useEffect(() => {
        loadServices();
    }, [loadServices]);
    
    // States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    
    // Delete confirmation modal state
    const [deleteModal, setDeleteModal] = useState({ show: false, service: null });
    
    // Alert modal state
    const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info', title: '' });

    const showAlert = (message, type = 'info', title = '') => {
        setAlertModal({ show: true, message, type, title });
    };

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

    // Request service deletion (show confirmation modal)
    const requestDeleteService = (service) => {
        setDeleteModal({ show: true, service });
    };

    // Handle confirmed service deletion
    const handleDeleteService = async () => {
        try {
            await deleteService(deleteModal.service.id);
            setDeleteModal({ show: false, service: null });
        } catch (error) {
            console.error('Error deleting service:', error);
            showAlert('Error deleting service: ' + error.message, 'error');
        }
    };

    // Handle form submission
    const handleSaveService = async (serviceData) => {
        try {
            if (currentService) {
                // Updating existing service
                await updateService({ 
                    ...currentService,
                    name: serviceData.name, 
                    description: serviceData.description, 
                    charge: serviceData.charge,
                    vatIncluded: serviceData.vatIncluded
                });
            } else {
                // Adding new service
                await addService({
                    name: serviceData.name,
                    description: serviceData.description,
                    charge: serviceData.charge,
                    vatIncluded: serviceData.vatIncluded
                });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving service:', error);
            showAlert('Error saving service: ' + error.message, 'error');
        }
    };

    if (loadingStates.services) {
        return (
            <div className="content-wrapper">
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
                    <div className="card-header bg-light py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Services</h3>
                            {canWriteServices && (
                                <button 
                                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                    onClick={handleAddService}
                                >
                                    <Plus size={16} />
                                    Add Service 
                                </button>
                            )}
                        </div>
                    </div>      
                    
                    <div className="border-bottom bg-white py-3 px-4">
                        <div className="alert alert-info mb-0 py-2 d-flex align-items-center gap-2">
                            <Info size={16} />
                            <span className="small">Service prices can be entered with or without VAT. The system will automatically calculate the other amount.</span>
                        </div>
                    </div>
                    
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Service Name</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3 text-end">With VAT</th>
                                        <th className="px-4 py-3 text-end">Without VAT</th>
                                        {(canWriteServices || canDeleteServices) && (
                                            <th className="px-4 py-3 text-center" style={{ width: '120px' }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.length === 0 ? (
                                        <tr>
                                            <td colSpan={(canWriteServices || canDeleteServices) ? "5" : "4"} className="text-center py-5 text-muted">
                                                <Package size={48} className="mb-3 opacity-50" />
                                                <p className="mb-0">No services found</p>
                                                {canWriteServices && (
                                                    <small>Click "Add Service" to create your first service</small>
                                                )}
                                            </td>
                                        </tr>
                                    ) : (
                                        services.map(service => (
                                            <tr key={service.id}>
                                                <td className="px-4 py-3 fw-medium">{service.name}</td>
                                                <td className="px-4 py-3 text-muted">{service.description || '-'}</td>
                                                <td className="px-4 py-3 text-end fw-bold text-primary">{formatCurrency(service.vatIncluded)}</td>
                                                <td className="px-4 py-3 text-end text-muted">{formatCurrency(service.charge)}</td>
                                                {(canWriteServices || canDeleteServices) && (
                                                    <td className="px-4 py-3">
                                                        <div className="d-flex justify-content-center gap-2">
                                                            {canWriteServices && (
                                                                <button 
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => handleEditService(service)}
                                                                    title="Edit Service"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                            )}
                                                            {canDeleteServices && (
                                                                <button 
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => requestDeleteService(service)}
                                                                    title="Delete Service"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
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

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, service: null })}
                onConfirm={handleDeleteService}
                title="Delete Service"
                message="Are you sure you want to delete this service?"
                itemName={deleteModal.service?.name}
                confirmButtonText="Delete"
                type="danger"
            />

            {/* Alert Modal */}
            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </>
    );
};

export default Services;
