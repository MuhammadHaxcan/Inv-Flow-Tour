import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import 'bootstrap/dist/css/bootstrap.min.css';

const PaymentForm = ({ accounts, onSave, onCancel, invoice }) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('');
    const [date, setDate] = useState('');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const outstanding = Math.max(0, (invoice?.total || 0) - (invoice?.paid || 0));
    const formatCurrency = (value) => `AED ${parseFloat(value || 0).toFixed(2)}`;

    useEffect(() => {
        if (invoice) {
            setAmount('');
            setMethod('');
            setDate(new Date().toISOString().slice(0, 10));
            setReference('');
            setNotes('');
            setError('');
        }
    }, [invoice]);
        
    const handleSubmit = (e) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);

        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Enter a valid payment amount greater than 0.');
            return;
        }

        if (parsedAmount > outstanding) {
            setError(`Amount cannot exceed outstanding balance of ${formatCurrency(outstanding)}.`);
            return;
        }

        if (!method) {
            setError('Select a payment account.');
            return;
        }

        setError('');
        onSave(parsedAmount, method, date, reference, notes);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-2 text-muted small">
                Outstanding balance: <strong>{formatCurrency(outstanding)}</strong>
            </div>
            {error && (
                <div className="alert alert-danger py-2">{error}</div>
            )}
            <div className="mb-3">
                <label className="form-label">Payment Amount</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="form-control"
                    placeholder="Enter amount"
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Payment Account</label>
                <SearchableSelect
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    options={accounts.map((account, i) => ({
                        value: account.name,
                        label: `${account.name} ${account.type === 'cash' ? '(No VAT)' : '(5% VAT)'}` 
                    }))}
                    placeholder="Select account"
                    inModal={true}
                />
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