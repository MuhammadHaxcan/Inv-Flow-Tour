import React, { useState, useEffect } from 'react';

const ExpenseForm = ({ expenseTypes, onSave, onCancel, invoice, expense }) => {
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
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData.type, formData.amount, formData.date, formData.description);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Expense Type</label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="form-select"
                    required
                >
                    <option value="">Select Expense Type</option>
                    {expenseTypes.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                    ))}
                </select>
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