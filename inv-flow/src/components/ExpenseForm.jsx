import React, { useState, useEffect } from 'react';

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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent">
                    <option value="">Select expense type</option>
                    {expenseTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent" placeholder="Enter amount" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent" rows="3" placeholder="Describe the expense" />
            </div>
            <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 font-medium">Add Expense</button>
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
            </div>
        </form>
    );
};

export default ExpenseForm;