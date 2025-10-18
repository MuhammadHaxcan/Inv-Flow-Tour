import React, { useState, useEffect } from 'react';
import Modal from './Modal';

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
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                    <input
                        type="text"
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                        required
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 font-medium">
                        {initialData.id ? 'Update' : 'Add'} Customer
                    </button>
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CustomerModal;