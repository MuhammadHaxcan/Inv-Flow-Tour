import React, { useState, useEffect } from 'react';
import { User, Truck, Receipt, CreditCard, Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import CustomerModal from '../components/CustomerModal';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';
import { useData } from '../contexts/DataContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const ChartOfAccounts = () => {
    const [activeCategory, setActiveCategory] = useState('customer');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Use data context
    const { 
        customers, addCustomer, updateCustomer, deleteCustomer,
        drivers, addDriver, updateDriver, deleteDriver,
        expenses, addExpenseType, updateExpenseType, deleteExpenseType,
        accounts, addAccount, updateAccount, deleteAccount,
        vendors, addVendor, updateVendor, deleteVendor,
        loadCustomers, loadDrivers, loadExpenses, loadAccounts, loadVendors,
        loadingStates
    } = useData();

    // Load all data when component mounts
    useEffect(() => {
        loadCustomers();
        loadDrivers();
        loadExpenses();
        loadAccounts();
        loadVendors();
    }, [loadCustomers, loadDrivers, loadExpenses, loadAccounts, loadVendors]);

    // Handle deletion based on active category
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            if (activeCategory === 'customer') {
                deleteCustomer(id);
            } else if (activeCategory === 'driver') {
                deleteDriver(id);
            } else if (activeCategory === 'expense') {
                deleteExpenseType(id);
            } else if (activeCategory === 'bank') {
                deleteAccount(id);
            } else if (activeCategory === 'vendor') {
                deleteVendor(id);
            }
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
            updateCustomer({ ...editingItem, ...formData });
        } else {
            // Add new customer
            const newItem = { ...formData, id: Date.now() };
            addCustomer(newItem);
        }
        setShowCustomerModal(false);
        setEditingItem(null);
    };

    const handleSave = (formData) => {
        if (editingItem) {
            // Update existing item
            if (activeCategory === 'driver') {
                updateDriver({ ...editingItem, ...formData });
            } else if (activeCategory === 'expense') {
                updateExpenseType({ ...editingItem, ...formData });
            } else if (activeCategory === 'bank') {
                updateAccount({ ...editingItem, ...formData });
            } else if (activeCategory === 'vendor') {
                updateVendor({ ...editingItem, ...formData });
            }
        } else {
            // Add new item
            const newItem = { ...formData, id: Date.now() };
            if (activeCategory === 'driver') {
                addDriver(newItem);
            } else if (activeCategory === 'expense') {
                addExpenseType(newItem);
            } else if (activeCategory === 'bank') {
                addAccount(newItem);
            } else if (activeCategory === 'vendor') {
                addVendor(newItem);
            }
        }
        setShowAddModal(false);
        setEditingItem(null);
    };

    const categories = [
        { id: 'customer', label: 'Customer', icon: User },
        { id: 'driver', label: 'Driver', icon: Truck },
        { id: 'vendor', label: 'Vendor', icon: Building2 },
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
    } else if (activeCategory === 'vendor') {
        data = vendors;
        columns = ['Name', 'Phone', 'Email', 'Address'];
    } else if (activeCategory === 'expense') {
        data = expenses;
        columns = ['Name', 'Default Value (AED)', 'Pax Based'];
    } else if (activeCategory === 'bank') {
        data = accounts;
        columns = ['Name', 'Account Number', 'Details'];
    }

    const AddEditModal = () => {
        // Initialize formData with default values for bank accounts
        const getInitialFormData = () => {
            if (editingItem) return editingItem;
            // Set default accountType for new bank accounts
            if (activeCategory === 'bank') {
                return { accountType: 'bank' };
            }
            return {};
        };
        
        const [formData, setFormData] = useState(getInitialFormData());

        // Re-initialize formData when modal opens or activeCategory changes
        useEffect(() => {
            setFormData(getInitialFormData());
        }, [showAddModal, activeCategory, editingItem]);

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

                    {activeCategory === 'vendor' && (
                        <>
                            <div className="mb-3">
                                <label className="form-label">Vendor Name</label>
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
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="form-control"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Address</label>
                                <textarea
                                    value={formData.address || ''}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="form-control"
                                    rows="2"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Notes</label>
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="form-control"
                                    rows="2"
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
                            <div className="mb-3 form-check">
                                <input
                                    type="checkbox"
                                    id="isPaxBased"
                                    checked={formData.isPaxBased || false}
                                    onChange={(e) => setFormData({ ...formData, isPaxBased: e.target.checked })}
                                    className="form-check-input"
                                />
                                <label htmlFor="isPaxBased" className="form-check-label">
                                    Pax Based (charged per person)
                                </label>
                                <small className="d-block text-muted">
                                    Enable this for expenses like buggy rides that are charged per person
                                </small>
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
                                <label className="form-label">Account Type</label>
                                <SearchableSelect
                                    value={formData.accountType || 'bank'}
                                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                                    options={[
                                        { value: 'bank', label: 'Bank Account (5% VAT applies)' },
                                        { value: 'cash', label: 'Cash Account (No VAT)' }
                                    ]}
                                    placeholder="Select Account Type"
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
            <div className="content-wrapper">
                <div className="card shadow">
                    <div className="card-header bg-light py-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Chart of Accounts</h3>
                            <button
                                onClick={handleAddNew}
                                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                            >
                                <Plus size={16} />
                                Add New
                            </button>
                        </div>
                    </div>  
                    {/* Category Tabs */}
                    <div className="card-header p-0 border-0">
                        <ul className="nav nav-tabs card-header-tabs">
                            {categories.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <li className="nav-item" key={cat.id}>
                                        <button
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`nav-link d-flex align-items-center gap-2 px-4 py-2 ${
                                                activeCategory === cat.id ? 'active' : 'text-secondary'
                                            }`}
                                            style={{
                                                fontSize: '0.85rem',
                                                fontWeight: activeCategory === cat.id ? '500' : '400',
                                                border: 'none',
                                                background: 'none'
                                            }}
                                        >
                                            <Icon size={16} />
                                            {cat.label}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Table */}
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        {columns.map((col, i) => (
                                            <th key={i} className="px-4 py-3">{col}</th>
                                        ))}
                                        <th className="px-4 py-3 text-center" style={{ width: '100px' }}>Actions</th>
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
                                                        <td className="px-4 py-3 fw-medium">{item.name}</td>
                                                        <td className="px-4 py-3">{item.phone || '-'}</td>
                                                        <td className="px-4 py-3">{item.email || '-'}</td>
                                                        <td className="px-4 py-3">{item.origin || '-'}</td>
                                                    </>
                                                )}
                                                {activeCategory === 'driver' && (
                                                    <>
                                                        <td className="px-4 py-3 fw-medium">{item.name}</td>
                                                        <td className="px-4 py-3">{item.phone || '-'}</td>
                                                    </>
                                                )}
                                                {activeCategory === 'vendor' && (
                                                    <>
                                                        <td className="px-4 py-3 fw-medium">{item.name}</td>
                                                        <td className="px-4 py-3">{item.phone || '-'}</td>
                                                        <td className="px-4 py-3">{item.email || '-'}</td>
                                                        <td className="px-4 py-3">{item.address || '-'}</td>
                                                    </>
                                                )}
                                                {activeCategory === 'expense' && (
                                                    <>
                                                        <td className="px-4 py-3 fw-medium">{item.name}</td>
                                                        <td className="px-4 py-3">AED {item.defaultValue}</td>
                                                        <td className="px-4 py-3">
                                                            {item.isPaxBased ? (
                                                                <span className="badge bg-primary">Yes</span>
                                                            ) : (
                                                                <span className="badge bg-secondary">No</span>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                                {activeCategory === 'bank' && (
                                                    <>
                                                        <td className="px-4 py-3 fw-medium">{item.name}</td>
                                                        <td className="px-4 py-3">{item.accountNumber || '-'}</td>
                                                        <td className="px-4 py-3">{item.details || '-'}</td>
                                                    </>
                                                )}
                                                <td className="px-4 py-3">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="btn btn-sm btn-outline-danger"
                                                            title="Delete"
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