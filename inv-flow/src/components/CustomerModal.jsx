import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomerModal = ({ show, onClose, onSave, initialData = {} }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        origin: '',
        ...initialData
    });

    useEffect(() => {
        setFormData({ name: '', phone: '', email: '', origin: '', ...initialData });
    }, [initialData, show]);

    const handleSubmit = (e) => {
        e.preventDefault();                         
        onSave(formData);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} title={initialData.id ? "Edit Customer" : "Add New Customer"}>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Customer Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Origin</label>
                    <input
                        type="text"
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        className="form-control"
                        required
                    />
                </div>
                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary flex-grow-1">
                        {initialData.id ? 'Update' : 'Add'} Customer
                    </button>
                    <button type="button" onClick={onClose} className="btn btn-outline-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CustomerModal;