import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Payment Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-control" placeholder="Enter amount" />
            </div>
            <div className="mb-3">
                <label className="form-label">Payment Account</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="form-select">
                    <option value="">Select account</option>
                    {accounts.map((account, i) => (
                        <option key={i} value={account.name}>
                            {account.name} {account.type === 'cash' ? '(No VAT)' : '(5% VAT)'}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Payment Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-control" />
            </div>
            <div className="mb-3">
                <label className="form-label">Reference Number</label>
                <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="form-control" placeholder="Transaction reference" />
            </div>
            <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="form-control" rows="2" placeholder="Additional notes" />
            </div>
            <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary flex-grow-1">Record Payment</button>
                <button type="button" onClick={onCancel} className="btn btn-outline-secondary">Cancel</button>
            </div>
        </form>
    );
};

export default PaymentForm;