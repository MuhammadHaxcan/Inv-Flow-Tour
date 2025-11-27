import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, FileText, AlertCircle } from 'lucide-react';
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
            <div className="content-wrapper">
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
                    <div className="card-header bg-light py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Outstanding Expenses</h3>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-secondary px-3 py-2">
                                    {outstandingExpenses.length} expense(s)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    {outstandingExpenses.length > 0 && (
                        <div className="border-bottom bg-white py-3 px-4">
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="card border-0 bg-warning bg-opacity-10">
                                        <div className="card-body py-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <p className="text-muted small mb-1">Total Outstanding</p>
                                                    <h4 className="mb-0 text-warning fw-bold">{formatCurrency(totalOutstanding)}</h4>
                                                </div>
                                                <div className="bg-warning bg-opacity-25 rounded-circle p-2">
                                                    <AlertCircle size={24} className="text-warning" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                        <th className="px-4 py-3 text-center" style={{ width: '100px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {outstandingExpenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-5 text-muted">
                                                <CheckCircle size={48} className="mb-3 text-success" />
                                                <p className="mb-0 fw-medium">No outstanding expenses</p>
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
                                                    <strong className="text-warning">{formatCurrency(expense.amount)}</strong>
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
                                            <td className="px-4 py-3 text-end text-warning">{formatCurrency(totalOutstanding)}</td>
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
                        <div className="alert alert-info mb-3 py-2">
                            <div className="row small">
                                <div className="col-6">
                                    <strong>Expense:</strong> {selectedExpense.type}
                                </div>
                                <div className="col-6">
                                    <strong>Invoice:</strong> {selectedExpense.invoiceNumber}
                                </div>
                                <div className="col-6 mt-1">
                                    <strong>Amount:</strong> {formatCurrency(selectedExpense.amount)}
                                </div>
                                {selectedExpense.vendorName && (
                                    <div className="col-6 mt-1">
                                        <strong>Vendor:</strong> {selectedExpense.vendorName}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-medium">Payment Account <span className="text-danger">*</span></label>
                            <SearchableSelect
                                value={paymentData.accountId}
                                onChange={(e) => setPaymentData({ ...paymentData, accountId: e.target.value })}
                                options={accounts.map((account) => ({
                                    value: account.id.toString(),
                                    label: `${account.name} ${account.accountType === 'cash' ? '(Cash)' : '(Bank)'}`
                                }))}
                                placeholder="Select Payment Account"
                                size="sm"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-medium">Payment Date</label>
                            <input
                                type="date"
                                value={paymentData.date}
                                onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                                className="form-control form-control-sm"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-medium">Reference (Optional)</label>
                            <input
                                type="text"
                                value={paymentData.reference}
                                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                                className="form-control form-control-sm"
                                placeholder="Transaction reference"
                            />
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                onClick={handleMarkPaid}
                                className="btn btn-sm btn-success flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                                disabled={!paymentData.accountId}
                            >
                                <DollarSign size={16} />
                                Mark as Paid
                            </button>
                            <button
                                onClick={() => { setShowPayModal(false); setSelectedExpense(null); }}
                                className="btn btn-sm btn-outline-secondary"
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
