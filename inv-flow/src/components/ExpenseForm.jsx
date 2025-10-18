import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ExpenseForm = ({ expenseTypes, onSave, onCancel, invoice }) => {
    const [type, setType] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (invoice) {
            setType('');
            setAmount('');
            setDate(new Date().toISOString().slice(0, 10));
            setDescription('');
        }
    }, [invoice]);

    const handleSubmit = (e) => {
        e.preventDefault(); 
        if (!type || !amount) return;
        onSave(type, amount, date, description);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Expense Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="form-select">
                    <option value="">Select expense type</option>
                    {expenseTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-control" placeholder="Enter amount" />
            </div>
            <div className="mb-3">
                <label className="form-label">Expense Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-control" />
            </div>
            <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" rows="3" placeholder="Describe the expense" />
            </div>
            <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary flex-grow-1">Add Expense</button>
                <button type="button" onClick={onCancel} className="btn btn-outline-secondary">Cancel</button>
            </div>
        </form>
    );
};

export default ExpenseForm;