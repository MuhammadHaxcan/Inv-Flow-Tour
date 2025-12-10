import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import SearchableSelect from './SearchableSelect';

const ExpenseForm = ({ expenseTypes, vendors = [], onSave, onCancel, invoice, expense }) => {
    // Get expense default values from context
    const { expenses } = useData();
    
    // Initialize with existing expense data if provided, otherwise use defaults
    const [formData, setFormData] = useState({
        type: expense?.type || '',
        unitPrice: expense?.pax ? (expense.amount / expense.pax) : (expense?.amount || ''),
        date: expense?.date || new Date().toISOString().split('T')[0],
        description: expense?.description || '',
        vendorName: expense?.vendorName || '',
        pax: expense?.pax || ''
    });

    // Guest count helper (adults + children)
    const guestCount = (invoice?.adults ?? 0) + (invoice?.children ?? 0);

    // Check if selected expense type is pax-based
    const selectedExpenseType = expenses.find(exp => exp.name === formData.type);
    const isPaxBased = selectedExpenseType?.isPaxBased || false;

    // Calculate total amount for pax-based expenses
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const paxCount = parseInt(formData.pax) || 0;
    const totalAmount = isPaxBased ? (unitPrice * paxCount) : unitPrice;

    // Format currency
    const formatCurrency = (amount) => `AED ${parseFloat(amount || 0).toFixed(2)}`;

    // Update form data if expense prop changes
    useEffect(() => {
        if (expense) {
            // For pax-based expenses, calculate unit price from total and pax
            const expType = expenses.find(exp => exp.name === expense.type);
            const isExpPaxBased = expType?.isPaxBased || false;
            const calculatedUnitPrice = isExpPaxBased && expense.pax 
                ? (expense.amount / expense.pax) 
                : expense.amount;
            
            setFormData({       
                type: expense.type || '',
                unitPrice: calculatedUnitPrice || '',
                date: expense.date || new Date().toISOString().split('T')[0],
                description: expense.description || '',
                vendorName: expense.vendorName || '',
                pax: expense.pax || ''
            });
        }
    }, [expense, expenses]);

    // When expense type changes and is pax-based, auto-populate pax from invoice
    useEffect(() => {
        if (isPaxBased && guestCount > 0 && !formData.pax) {
            setFormData(prev => ({
                ...prev,
                pax: guestCount
            }));
        }
    }, [isPaxBased, guestCount, formData.pax]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // If expense type is changed, load default amount if available
        if (name === 'type') {
            const selectedExpense = expenses.find(exp => exp.name === value);
            const newFormData = {
                ...formData,
                type: value,
                unitPrice: selectedExpense?.defaultValue || formData.unitPrice
            };
            
            // If the new expense type is pax-based, auto-populate pax from invoice
            if (selectedExpense?.isPaxBased && guestCount > 0) {
                newFormData.pax = guestCount;
            } else if (!selectedExpense?.isPaxBased) {
                // Clear pax if expense type is not pax-based
                newFormData.pax = '';
            }
            
            setFormData(newFormData);
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // For pax-based expenses, save the total amount (unit × pax)
        const finalAmount = isPaxBased ? totalAmount : formData.unitPrice;
        const paxValue = isPaxBased ? formData.pax : null;
        onSave(formData.type, finalAmount, formData.date, formData.description, null, formData.vendorName, paxValue);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Expense Type</label>
                <SearchableSelect
                    value={formData.type}
                    onChange={(e) => handleChange({ target: { name: 'type', value: e.target.value } })}
                    options={expenseTypes.map((type, index) => ({ value: type, label: type }))}
                    placeholder="Select Expense Type"
                    required
                />
            </div>
            
            <div className="mb-3">
                <label className="form-label">
                    {isPaxBased ? 'Unit Price per Person (AED)' : 'Amount (AED)'}
                </label>
                <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="0.00"
                    step="0.01"
                    required
                />
                {isPaxBased && (
                    <small className="text-muted">Price charged per person</small>
                )}
            </div>
            
            {isPaxBased && (
                <>
                    <div className="mb-3">
                        <label className="form-label">Guests (Adults + Children)</label>
                        <input
                            type="number"
                            name="pax"
                            value={formData.pax}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Total guests"
                            min="1"
                            required
                        />
                    </div>
                    
                    {/* Total Calculation Display */}
                    {unitPrice > 0 && paxCount > 0 && (
                        <div className="alert alert-info mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{formData.type}</strong>
                                    <div className="text-muted small">
                                        {formatCurrency(unitPrice)} × {paxCount} person{paxCount > 1 ? 's' : ''}
                                    </div>
                                </div>
                                <div className="text-end">
                                    <div className="h5 mb-0 text-primary">{formatCurrency(totalAmount)}</div>
                                    <small className="text-muted">Total</small>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
            
            <div className="mb-3">
                <label className="form-label">Date</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="form-control"
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Vendor (Optional)</label>
                <SearchableSelect
                    value={formData.vendorName}
                    onChange={(e) => handleChange({ target: { name: 'vendorName', value: e.target.value } })}
                    options={vendors.map((vendor) => ({
                        value: vendor.name,
                        label: vendor.name
                    }))}
                    placeholder="Select Vendor (e.g., Camp, Restaurant)"
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Description (Optional)</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-control"
                    rows="2"
                />
            </div>
            <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    {expense ? 'Update Expense' : 'Add Expense'}
                </button>
            </div>
        </form>
    );
};

export default ExpenseForm;