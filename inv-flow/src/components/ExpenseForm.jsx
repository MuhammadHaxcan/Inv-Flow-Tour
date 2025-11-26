import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import SearchableSelect from './SearchableSelect';

const ExpenseForm = ({ expenseTypes, onSave, onCancel, invoice, expense }) => {
    // Get expense default values from context
    const { expenses } = useData();
    
    // Initialize with existing expense data if provided, otherwise use defaults
    const [formData, setFormData] = useState({
        type: expense?.type || '',
        amount: expense?.amount || '',
        date: expense?.date || new Date().toISOString().split('T')[0],
        description: expense?.description || ''
    });

    // Update form data if expense prop changes
    useEffect(() => {
        if (expense) {
            setFormData({       
                type: expense.type || '',
                amount: expense.amount || '',
                date: expense.date || new Date().toISOString().split('T')[0],
                description: expense.description || ''
            });
        }
    }, [expense]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // If expense type is changed, load default amount if available
        if (name === 'type') {
            const selectedExpense = expenses.find(exp => exp.name === value);
            if (selectedExpense && selectedExpense.defaultValue) {
                setFormData({
                    ...formData,
                    type: value,
                    amount: selectedExpense.defaultValue
                });
            } else {
                setFormData({
                    ...formData,
                    [name]: value
                });
            }
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData.type, formData.amount, formData.date, formData.description);
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
                <label className="form-label">Amount (AED)</label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="0.00"
                    step="0.01"
                    required
                />
            </div>
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