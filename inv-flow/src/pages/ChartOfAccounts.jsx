import React, { useState, useEffect, useRef } from 'react';
import { User, Truck, Receipt, CreditCard, Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import CustomerModal from '../components/CustomerModal';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';
import ConfirmationModal from '../components/ConfirmationModal';
import AlertModal from '../components/AlertModal';
import PhoneField from '../components/PhoneField';
import { useInvoice } from '../contexts/InvoiceContext';
import { usePermissions } from '../hooks/usePermissions';
import 'bootstrap/dist/css/bootstrap.min.css';

const ChartOfAccounts = () => {
    const [activeCategory, setActiveCategory] = useState('customer');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Delete confirmation modal state
    const [deleteModal, setDeleteModal] = useState({ show: false, item: null, category: '' });
    
    // Alert modal state
    const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info', title: '' });

    // Use invoice context
    const {
        customers, addCustomer, updateCustomer, deleteCustomer,
        drivers, addDriver, updateDriver, deleteDriver,
        expenses, addExpenseType, updateExpenseType, deleteExpenseType,
        accounts, addAccount, updateAccount, deleteAccount,
        vendors, addVendor, updateVendor, deleteVendor,
        loadCustomers, loadDrivers, loadExpenses, loadAccounts, loadVendors,
        loadingStates
    } = useInvoice();

    // Permissions
    const { 
        canWriteCustomers, canDeleteCustomers,
        canWriteDrivers, canDeleteDrivers,
        canWriteVendors, canDeleteVendors,
        canWriteExpenseTypes, canDeleteExpenseTypes,
        canWriteAccounts, canDeleteAccounts,
        canWriteCategory, canDeleteCategory
    } = usePermissions();

    const showAlert = (message, type = 'info', title = '') => {
        setAlertModal({ show: true, message, type, title });
    };

    const formatCurrency = (amount) => {
        const parsed = parseFloat(amount || 0);
        return `AED ${Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00'}`;
    };

    // Load all data when component mounts
    useEffect(() => {
        loadCustomers();
        loadDrivers();
        loadExpenses();
        loadAccounts();
        loadVendors();
    }, [loadCustomers, loadDrivers, loadExpenses, loadAccounts, loadVendors]);

    // Get write/delete permissions for current category
    const canWrite = canWriteCategory(activeCategory);
    const canDelete = canDeleteCategory(activeCategory);

    // Handle deletion based on active category
    const handleDelete = async () => {
        const { item, category } = deleteModal;
        try {
            if (category === 'customer') {
                await deleteCustomer(item.id);
            } else if (category === 'driver') {
                await deleteDriver(item.id);
            } else if (category === 'expense') {
                await deleteExpenseType(item.id);
            } else if (category === 'bank') {
                await deleteAccount(item.id);
            } else if (category === 'vendor') {
                await deleteVendor(item.id);
            }
            setDeleteModal({ show: false, item: null, category: '' });
        } catch (error) {
            console.error('Error deleting item:', error);
            showAlert('Error deleting item: ' + error.message, 'error');
        }
    };

    const requestDelete = (item) => {
        setDeleteModal({ show: true, item, category: activeCategory });
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
        
    const handleSaveCustomer = async (formData) => {
        try {
            if (editingItem) {
                // Update existing customer
                await updateCustomer({ ...editingItem, ...formData });
            } else {
                // Add new customer - don't add fake id, let backend generate it
                await addCustomer(formData);
            }
            setShowCustomerModal(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Error saving customer:', error);
            showAlert('Error saving customer: ' + error.message, 'error');
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editingItem) {
                // Update existing item
                if (activeCategory === 'driver') {
                    await updateDriver({ ...editingItem, ...formData });
                } else if (activeCategory === 'expense') {
                    const parsedDefaultValue = parseFloat(formData.defaultValue);
                    await updateExpenseType({ 
                        ...editingItem, 
                        ...formData, 
                        defaultValue: formData.defaultValue === '' || Number.isNaN(parsedDefaultValue) ? null : parsedDefaultValue 
                    });
                } else if (activeCategory === 'bank') {
                    await updateAccount({ ...editingItem, ...formData });
                } else if (activeCategory === 'vendor') {
                    await updateVendor({ ...editingItem, ...formData });
                }
            } else {
                // Add new item - don't add fake id, let backend generate it
                if (activeCategory === 'driver') {
                    await addDriver(formData);
                } else if (activeCategory === 'expense') {
                    const parsedDefaultValue = parseFloat(formData.defaultValue);
                    await addExpenseType({ 
                        ...formData, 
                        defaultValue: formData.defaultValue === '' || Number.isNaN(parsedDefaultValue) ? null : parsedDefaultValue 
                    });
                } else if (activeCategory === 'bank') {
                    await addAccount(formData);
                } else if (activeCategory === 'vendor') {
                    await addVendor(formData);
                }
            }
            setShowAddModal(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Error saving item:', error);
            showAlert('Error saving item: ' + error.message, 'error');
        }
    };

    const categories = [
        { id: 'customer', label: 'Customer', icon: User },
        { id: 'driver', label: 'Driver', icon: Truck },
        { id: 'vendor', label: 'Vendor', icon: Building2 },
        { id: 'expense', label: 'Expense', icon: Receipt },
        { id: 'bank', label: 'Bank Account', icon: CreditCard }
    ];

    const loadingKeyMap = {
        customer: 'customers',
        driver: 'drivers',
        vendor: 'vendors',
        expense: 'expenses',
        bank: 'accounts'
    };

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

    const isLoading = loadingStates?.[loadingKeyMap[activeCategory]];

    const getCategoryLabel = (category) => {
        const cat = categories.find(c => c.id === category);
        return cat ? cat.label : category;
    };

    const AddEditModal = () => {
        // Initialize formData with default values for bank accounts
        const getInitialFormData = () => {
            if (editingItem) return editingItem;
            // Set default accountType for new bank accounts
            if (activeCategory === 'bank') {
                return { accountType: 'bank' };
            }
            if (activeCategory === 'expense') {
                return { defaultValue: '', isPaxBased: false };
            }
            return {};
        };
        
        const [formData, setFormData] = useState(getInitialFormData());
        const [phoneError, setPhoneError] = useState('');
        const defaultValueInputRef = useRef(null);

        // Re-initialize formData when modal opens or activeCategory changes
        useEffect(() => {
            if (showAddModal) {
                const initialData = getInitialFormData();
                // Convert defaultValue to string for number inputs
                if (initialData.defaultValue != null && initialData.defaultValue !== '') {
                    initialData.defaultValue = String(initialData.defaultValue);
                }
                setFormData(initialData);
                setPhoneError('');
            }
        }, [showAddModal, activeCategory, editingItem]);

        const handleSubmit = (e) => {
            e.preventDefault();
            if (phoneError) return;
            handleSave(formData);
        };

        return (
            <Modal
                show={showAddModal}
                onClose={() => { setShowAddModal(false); setEditingItem(null); }}
                title={editingItem ? `Edit ${getCategoryLabel(activeCategory)}` : `Add ${getCategoryLabel(activeCategory)}`}
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
                                <PhoneField
                                    label="Phone"
                                    value={formData.phone || ''}
                                    onChange={(val) => {
                                        setFormData({ ...formData, phone: val || '' });
                                        setPhoneError('');
                                    }}
                                    error={phoneError}
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
                                <PhoneField
                                    label="Phone"
                                    value={formData.phone || ''}
                                    onChange={(val) => {
                                        setFormData({ ...formData, phone: val || '' });
                                        setPhoneError('');
                                    }}
                                    error={phoneError}
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
                                    ref={defaultValueInputRef}
                                    type="number"
                                    step="0.01"
                                    value={formData.defaultValue === 0 ? '0' : (formData.defaultValue || '')}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setFormData({ ...formData, defaultValue: value });
                                    }}
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

    if (isLoading) {
        return (
            <div className="content-wrapper">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mb-0">Loading {getCategoryLabel(activeCategory).toLowerCase()}s...</p>
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
                            <h3 className="h5 fw-bold text-primary mb-0">Chart of Accounts</h3>
                            {canWrite && (
                                <button
                                    onClick={handleAddNew}
                                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                >
                                    <Plus size={16} />
                                    Add New
                                </button>
                            )}
                        </div>
                    </div>  
                    {/* Category Tabs */}
                    <div className="border-bottom">
                        <ul className="nav nav-tabs border-0 px-3">
                            {categories.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <li className="nav-item" key={cat.id}>
                                        <button
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`nav-link d-flex align-items-center gap-2 px-4 py-3 border-0 ${
                                                activeCategory === cat.id 
                                                    ? 'active text-primary fw-medium border-bottom border-primary border-2' 
                                                    : 'text-secondary'
                                            }`}
                                            style={{
                                                fontSize: '0.875rem',
                                                background: 'transparent',
                                                marginBottom: '-1px'
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
                                            <th key={i} className={`px-4 py-3 ${col.includes('Value') ? 'text-end' : ''}`}>{col}</th>
                                        ))}
                                        {(canWrite || canDelete) && (
                                            <th className="px-4 py-3 text-center" style={{ width: '120px' }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length === 0 ? (
                                        <tr>
                                            <td colSpan={(canWrite || canDelete) ? columns.length + 1 : columns.length} className="text-center py-5 text-muted">
                                                <p className="mb-1">No {getCategoryLabel(activeCategory).toLowerCase()} records found.</p>
                                                {canWrite && (
                                                    <small>Click "Add New" to create the first record.</small>
                                                )}
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
                                                        <td className="px-4 py-3 text-end">{item.defaultValue == null ? '-' : formatCurrency(item.defaultValue)}</td>
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
                                                {(canWrite || canDelete) && (
                                                    <td className="px-4 py-3">
                                                        <div className="d-flex justify-content-center gap-2">
                                                            {canWrite && (
                                                                <button
                                                                    onClick={() => handleEdit(item)}
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() => requestDelete(item)}
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    title="Delete"
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
            
            <CustomerModal
                show={showCustomerModal}
                onClose={() => { setShowCustomerModal(false); setEditingItem(null); }}
                onSave={handleSaveCustomer}
                initialData={editingItem || {}}
            />
            <AddEditModal />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                show={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, item: null, category: '' })}
                onConfirm={handleDelete}
                title={`Delete ${getCategoryLabel(deleteModal.category)}`}
                message={`Are you sure you want to delete this ${getCategoryLabel(deleteModal.category).toLowerCase()}?`}
                itemName={deleteModal.item?.name}
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

export default ChartOfAccounts;
