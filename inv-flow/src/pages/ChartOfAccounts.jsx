import React, { useState } from 'react';
import { User, Truck, Receipt, CreditCard, Plus, Edit2, Trash2 } from 'lucide-react';
import CustomerModal from '../components/CustomerModal';
import Modal from '../components/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';

const ChartOfAccounts = () => {
    const [activeCategory, setActiveCategory] = useState('customer');

    // Database state
    const [customers, setCustomers] = useState([
        { id: 1, name: 'ABC Company', phone: '+971501234567', email: 'contact@abc.com', origin: 'Dubai' },
        { id: 2, name: 'XYZ Ltd', phone: '+971507654321', email: 'info@xyz.com', origin: 'Abu Dhabi' }
    ]);

    const [drivers, setDrivers] = useState([
        { id: 1, name: 'Ahmed Khan', phone: '+971501111111' },
        { id: 2, name: 'Ali Raza', phone: '+971502222222' }
    ]);

    const [expenses, setExpenses] = useState([
        { id: 1, name: 'Fuel', defaultValue: 500 },
        { id: 2, name: 'Tolls', defaultValue: 50 },
        { id: 3, name: 'Parking', defaultValue: 30 }
    ]);

    const [bankAccounts, setBankAccounts] = useState([
        { id: 1, name: 'Cash Account', accountNumber: 'N/A', details: 'Cash on hand' },
        { id: 2, name: 'Bank Account - HBL', accountNumber: '1234567890', details: 'Current Account' }
    ]);

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleDelete = (id) => {
        if (activeCategory === 'customer') {
            setCustomers(customers.filter(c => c.id !== id));
        } else if (activeCategory === 'driver') {
            setDrivers(drivers.filter(d => d.id !== id));
        } else if (activeCategory === 'expense') {
            setExpenses(expenses.filter(e => e.id !== id));
        } else if (activeCategory === 'bank') {
            setBankAccounts(bankAccounts.filter(b => b.id !== id));
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);

        if (activeCategory === 'customer') {
            setShowCustomerModal(true);
        } else {
            setShowAddModal(true);
        }
    };

    const handleAddNew = () => {
        setEditingItem(null);

        if (activeCategory === 'customer') {
            setShowCustomerModal(true);
        } else {
            setShowAddModal(true);
        }
    };

    const handleSaveCustomer = (formData) => {
        if (editingItem) {
            // Update existing customer
            setCustomers(customers.map(c => c.id === editingItem.id ? { ...c, ...formData } : c));
        } else {
            // Add new customer
            const newItem = { ...formData, id: Date.now() };
            setCustomers([...customers, newItem]);
        }
        setShowCustomerModal(false);
        setEditingItem(null);
    };

    const handleSave = (formData) => {
        if (editingItem) {
            // Update existing item
            if (activeCategory === 'driver') {
                setDrivers(drivers.map(d => d.id === editingItem.id ? { ...d, ...formData } : d));
            } else if (activeCategory === 'expense') {
                setExpenses(expenses.map(e => e.id === editingItem.id ? { ...e, ...formData } : e));
            } else if (activeCategory === 'bank') {
                setBankAccounts(bankAccounts.map(b => b.id === editingItem.id ? { ...b, ...formData } : b));
            }
        } else {
            // Add new item
            const newItem = { ...formData, id: Date.now() };
            if (activeCategory === 'driver') {
                setDrivers([...drivers, newItem]);
            } else if (activeCategory === 'expense') {
                setExpenses([...expenses, newItem]);
            } else if (activeCategory === 'bank') {
                setBankAccounts([...bankAccounts, newItem]);
            }
        }
        setShowAddModal(false);
        setEditingItem(null);
    };

    const categories = [
        { id: 'customer', label: 'Customer', icon: User },
        { id: 'driver', label: 'Driver', icon: Truck },
        { id: 'expense', label: 'Expense', icon: Receipt },
        { id: 'bank', label: 'Bank Account', icon: CreditCard }
    ];

    let data = [];
    let columns = [];

    if (activeCategory === 'customer') {
        data = customers;
        columns = ['Name', 'Phone', 'Email', 'Origin'];
    } else if (activeCategory === 'driver') {
        data = drivers;
        columns = ['Name', 'Phone'];
    } else if (activeCategory === 'expense') {
        data = expenses;
        columns = ['Name', 'Default Value (AED)'];
    } else if (activeCategory === 'bank') {
        data = bankAccounts;
        columns = ['Name', 'Account Number', 'Details'];
    }

    const AddEditModal = () => {
        const [formData, setFormData] = useState(editingItem || {});

        const handleSubmit = (e) => {
            e.preventDefault();
            handleSave(formData);
        };

        return (
            <Modal
                show={showAddModal}
                onClose={() => { setShowAddModal(false); setEditingItem(null); }}
                title={editingItem ? `Edit ${activeCategory}` : `Add ${activeCategory}`}
            >
                <form onSubmit={handleSubmit}>
                    {activeCategory === 'driver' && (
                        <>
                            <div className="mb-3">
                                <label className="form-label">Driver Name</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="form-control"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {activeCategory === 'expense' && (
                        <>
                            <div className="mb-3">
                                <label className="form-label">Expense Name</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Default Value (AED)</label>
                                <input
                                    type="number"
                                    value={formData.defaultValue || ''}
                                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                                    className="form-control"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {activeCategory === 'bank' && (
                        <>
                            <div className="mb-3">
                                <label className="form-label">Account Name</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Account Number</label>
                                <input
                                    type="text"
                                    value={formData.accountNumber || ''}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Account Details</label>
                                <textarea
                                    value={formData.details || ''}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    className="form-control"
                                    rows="3"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary flex-grow-1">
                            {editingItem ? 'Update' : 'Add'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                            className="btn btn-outline-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        );
    };

    return (
        <>
            <div className="bg-white border-b shadow-sm">
                <div className="container py-4">
                    <h2 className="display-6 fw-bold text-primary">Chart of Accounts</h2>
                    <p className="text-muted mt-2">
                        Manage your customers, drivers, expenses, and bank accounts
                    </p>
                </div>
            </div>

            <div className="container py-5">
                <div className="card shadow">
                    {/* Category Tabs */}
                    <div className="card-header p-0">
                        <ul className="nav nav-tabs card-header-tabs">
                            {categories.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <li className="nav-item" key={cat.id}>
                                        <button
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`nav-link d-flex align-items-center gap-2 px-4 py-3 ${
                                                activeCategory === cat.id ? 'active fw-medium' : 'text-secondary'
                                            }`}
                                        >
                                            <Icon size={20} />
                                            {cat.label}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Content */}
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="h4 mb-0">
                                {categories.find(c => c.id === activeCategory)?.label} Accounts
                            </h3>
                            <button
                                onClick={handleAddNew}
                                className="btn btn-primary d-flex align-items-center gap-2"
                            >
                                <Plus size={18} />
                                Add New
                            </button>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            <table className="table table-hover table-striped">
                                <thead>
                                    <tr>
                                        {columns.map((col, i) => (
                                            <th key={i} scope="col">{col}</th>
                                        ))}
                                        <th scope="col" className="text-center" style={{ width: '100px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length + 1} className="text-center py-4 text-muted">
                                                No records found. Click "Add New" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.map((item) => (
                                            <tr key={item.id}>
                                                {activeCategory === 'customer' && (
                                                    <>
                                                        <td>{item.name}</td>
                                                        <td>{item.phone}</td>
                                                        <td>{item.email}</td>
                                                        <td>{item.origin}</td>
                                                    </>
                                                )}
                                                {activeCategory === 'driver' && (
                                                    <>
                                                        <td>{item.name}</td>
                                                        <td>{item.phone}</td>
                                                    </>
                                                )}
                                                {activeCategory === 'expense' && (
                                                    <>
                                                        <td>{item.name}</td>
                                                        <td>AED {item.defaultValue}</td>
                                                    </>
                                                )}
                                                {activeCategory === 'bank' && (
                                                    <>
                                                        <td>{item.name}</td>
                                                        <td>{item.accountNumber}</td>
                                                        <td>{item.details}</td>
                                                    </>
                                                )}
                                                <td>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Delete"
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
            
            <CustomerModal
                show={showCustomerModal}
                onClose={() => { setShowCustomerModal(false); setEditingItem(null); }}
                onSave={handleSaveCustomer}
                initialData={editingItem || {}}
            />
            <AddEditModal />
        </>
    );
};

export default ChartOfAccounts;