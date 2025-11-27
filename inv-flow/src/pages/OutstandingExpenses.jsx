import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, FileText } from 'lucide-react';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';
import { useData } from '../contexts/DataContext';
import { invoicesAPI } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const OutstandingExpenses = () => {
    const { accounts, loadAccounts, loadingStates } = useData();
    
    const [outstandingExpenses, setOutstandingExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [paymentData, setPaymentData] = useState({
        accountId: '',
        date: new Date().toISOString().split('T')[0],
        reference: ''
    });

    // Load accounts and expenses on mount
    useEffect(() => {
        loadAccounts();
        loadOutstandingExpenses();
    }, [loadAccounts]);

    const loadOutstandingExpenses = async () => {
        setLoading(true);
        try {
            const data = await invoicesAPI.getOutstandingExpenses();
            setOutstandingExpenses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading outstanding expenses:', error);
            setOutstandingExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
    };

    const openPayModal = (expense) => {
        setSelectedExpense(expense);
        setPaymentData({
            accountId: '',
            date: new Date().toISOString().split('T')[0],
            reference: ''
        });
        setShowPayModal(true);
    };

    const handleMarkPaid = async () => {
        if (!selectedExpense || !paymentData.accountId) {
            alert('Please select a payment account');
            return;
        }

        try {
            await invoicesAPI.markExpensePaid(selectedExpense.id, {
                accountId: parseInt(paymentData.accountId),
                date: paymentData.date,
                reference: paymentData.reference
            });
            
            // Reload expenses
            await loadOutstandingExpenses();
            setShowPayModal(false);
            setSelectedExpense(null);
        } catch (error) {
            alert('Error marking expense as paid: ' + error.message);
        }
    };

    // Calculate totals
    const totalOutstanding = outstandingExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    if (loading || loadingStates.accounts) {
        return (
            <div className="content-wrapper py-3 px-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading outstanding expenses...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="content-wrapper">
                <div className="card shadow">
                    <div className="card-header bg-light py-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Outstanding Expenses</h3>
                            <div className="d-flex align-items-center gap-3">
                                <span className="badge bg-warning text-dark fs-6">
                                    Total Outstanding: {formatCurrency(totalOutstanding)}
                                </span>
                                <span className="badge bg-secondary fs-6">
                                    {outstandingExpenses.length} expense(s)
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Invoice</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Expense Type</th>
                                        <th className="px-4 py-3">Vendor</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-center">Pax</th>
                                        <th className="px-4 py-3 text-end">Amount</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {outstandingExpenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-5 text-muted">
                                                <CheckCircle size={48} className="mb-3 text-success" />
                                                <p className="mb-0">No outstanding expenses</p>
                                                <small>All expenses have been paid!</small>
                                            </td>
                                        </tr>
                                    ) : (
                                        outstandingExpenses.map((expense) => (
                                            <tr key={expense.id}>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FileText size={16} className="text-muted" />
                                                        <span className="fw-medium">{expense.invoiceNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{expense.customer}</td>
                                                <td className="px-4 py-3">
                                                    <span className="badge bg-secondary">{expense.type}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {expense.vendorName || <span className="text-muted">-</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {expense.pax ? (
                                                        <span className="badge bg-info">{expense.pax}</span>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-end">
                                                    <strong>{formatCurrency(expense.amount)}</strong>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => openPayModal(expense)}
                                                        className="btn btn-sm btn-success d-flex align-items-center gap-1 mx-auto"
                                                        title="Mark as Paid"
                                                    >
                                                        <DollarSign size={14} />
                                                        Pay
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {outstandingExpenses.length > 0 && (
                                    <tfoot className="table-light fw-bold">
                                        <tr>
                                            <td colSpan="6" className="px-4 py-3 text-end">Total Outstanding:</td>
                                            <td className="px-4 py-3 text-end">{formatCurrency(totalOutstanding)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Modal
                show={showPayModal}
                onClose={() => { setShowPayModal(false); setSelectedExpense(null); }}
                title="Mark Expense as Paid"
            >
                {selectedExpense && (
                    <div>
                        <div className="alert alert-info mb-3">
                            <strong>Expense:</strong> {selectedExpense.type}<br />
                            <strong>Invoice:</strong> {selectedExpense.invoiceNumber}<br />
                            <strong>Amount:</strong> {formatCurrency(selectedExpense.amount)}
                            {selectedExpense.vendorName && (
                                <><br /><strong>Vendor:</strong> {selectedExpense.vendorName}</>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Payment Account <span className="text-danger">*</span></label>
                            <SearchableSelect
                                value={paymentData.accountId}
                                onChange={(e) => setPaymentData({ ...paymentData, accountId: e.target.value })}
                                options={accounts.map((account) => ({
                                    value: account.id.toString(),
                                    label: `${account.name} ${account.accountType === 'cash' ? '(Cash)' : '(Bank)'}`
                                }))}
                                placeholder="Select Payment Account"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Payment Date</label>
                            <input
                                type="date"
                                value={paymentData.date}
                                onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                                className="form-control"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Reference (Optional)</label>
                            <input
                                type="text"
                                value={paymentData.reference}
                                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                                className="form-control"
                                placeholder="Transaction reference"
                            />
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                onClick={handleMarkPaid}
                                className="btn btn-success flex-grow-1"
                                disabled={!paymentData.accountId}
                            >
                                <DollarSign size={16} className="me-2" />
                                Mark as Paid
                            </button>
                            <button
                                onClick={() => { setShowPayModal(false); setSelectedExpense(null); }}
                                className="btn btn-outline-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default OutstandingExpenses;

