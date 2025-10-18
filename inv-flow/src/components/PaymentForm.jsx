import React, { useState, useEffect } from 'react';

const PaymentForm = ({ accounts, onSave, onCancel, invoice }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('');
    const [date, setDate] = useState('');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (invoice) {
            setAmount('');
            setMethod('');
            setDate(new Date().toISOString().slice(0, 10));
            setReference('');
            setNotes('');
        }
    }, [invoice]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || !method) return;
        onSave(amount, method, date, reference, notes);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent" placeholder="Enter amount" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Account</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent">
                    <option value="">Select account</option>
                    {accounts.map((account, i) => (
                        <option key={i} value={account.name}>
                            {account.name} {account.type === 'cash' ? '(No VAT)' : '(5% VAT)'}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent" placeholder="Transaction reference" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent" rows="2" placeholder="Additional notes" />
            </div>
            <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 font-medium">Record Payment</button>
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
            </div>
        </form>
    );
};

export default PaymentForm;