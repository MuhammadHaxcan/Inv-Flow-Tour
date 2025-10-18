import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomerModal = ({ show, onClose, onSave, initialData = {} }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        origin: ''
    });

    useEffect(() => {
        if (show) {
            if (initialData && initialData.id) {
                setFormData(initialData);
            } else {
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    origin: ''
                });
            }
        }
    }, [show, initialData]);

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal show={show} onClose={onClose} title={initialData.id ? "Edit Customer" : "Add New Customer"}>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label small fw-medium">Customer Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="form-control form-control-sm"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label small fw-medium">Phone</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="form-control form-control-sm"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label small fw-medium">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="form-control form-control-sm"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label small fw-medium">Origin</label>
                    <input
                        type="text"
                        value={formData.origin}
                        onChange={(e) => handleChange('origin', e.target.value)}
                        className="form-control form-control-sm"
                        required
                    />
                </div>
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-sm btn-primary flex-grow-1">
                        {initialData.id ? 'Update' : 'Add'} Customer
                    </button>
                    <button type="button" onClick={onClose} className="btn btn-sm btn-outline-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CustomerModal;