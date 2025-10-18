import React, { useState } from 'react';
import { User, Truck, Receipt, CreditCard, Plus, Edit2, Trash2 } from 'lucide-react';
import CustomerModal from '../components/CustomerModal';
import Modal from '../components/Modal';

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
                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeCategory === 'driver' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {activeCategory === 'expense' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Default Value (AED)</label>
                                <input
                                    type="number"
                                    value={formData.defaultValue || ''}
                                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {activeCategory === 'bank' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input
                                    type="text"
                                    value={formData.accountNumber || ''}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Details</label>
                                <textarea
                                    value={formData.details || ''}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                    rows="3"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 font-medium">
                            {editingItem ? 'Update' : 'Add'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white shadow-sm">
                    {/* Category Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            {categories.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${activeCategory === cat.id
                                            ? 'border-gray-800 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {categories.find(c => c.id === activeCategory)?.label} Accounts
                            </h2>
                            <button
                                onClick={handleAddNew}
                                className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Add New
                            </button>
                        </div>

                        {/* Table */}
                        <div className="border border-gray-200">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {columns.map((col, i) => (
                                            <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                {col}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {data.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                                                No records found. Click "Add New" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                {activeCategory === 'customer' && (
                                                    <>
                                                        <td className="px-4 py-3">{item.name}</td>
                                                        <td className="px-4 py-3">{item.phone}</td>
                                                        <td className="px-4 py-3">{item.email}</td>
                                                        <td className="px-4 py-3">{item.origin}</td>
                                                    </>
                                                )}
                                                {activeCategory === 'driver' && (
                                                    <>
                                                        <td className="px-4 py-3">{item.name}</td>
                                                        <td className="px-4 py-3">{item.phone}</td>
                                                    </>
                                                )}
                                                {activeCategory === 'expense' && (
                                                    <>
                                                        <td className="px-4 py-3">{item.name}</td>
                                                        <td className="px-4 py-3">AED {item.defaultValue}</td>
                                                    </>
                                                )}
                                                {activeCategory === 'bank' && (
                                                    <>
                                                        <td className="px-4 py-3">{item.name}</td>
                                                        <td className="px-4 py-3">{item.accountNumber}</td>
                                                        <td className="px-4 py-3">{item.details}</td>
                                                    </>
                                                )}
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="text-gray-600 hover:text-gray-900"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-gray-600 hover:text-gray-900"
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
        </div>
    );
};

export default ChartOfAccounts;