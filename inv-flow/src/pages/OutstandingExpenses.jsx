import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import SearchableSelect from '../components/SearchableSelect';
import AlertModal from '../components/AlertModal';
import { useInvoice } from '../contexts/InvoiceContext';
import { usePermissions } from '../hooks/usePermissions';
import { invoicesAPI } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const OutstandingExpenses = () => {
    const { accounts, loadAccounts, loadingStates } = useInvoice();
    
    // Permissions
    const { canWriteInvoices } = usePermissions();
    
    const [outstandingExpenses, setOutstandingExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [paymentData, setPaymentData] = useState({
        accountId: '',
        date: new Date().toISOString().split('T')[0],
        reference: ''
    });
    
    // Alert modal state
    const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info', title: '' });

    // Filter state
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const showAlert = (message, type = 'info', title = '') => {
        setAlertModal({ show: true, message, type, title });
    };

    const loadOutstandingExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const data = await invoicesAPI.getOutstandingExpenses();
            setOutstandingExpenses(Array.isArray(data) ? data : []);
            setLoadError('');
        } catch (error) {
            console.error('Error loading outstanding expenses:', error);
            setOutstandingExpenses([]);
            const message = error?.message || 'Failed to load outstanding expenses. Please try again.';
            setLoadError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load accounts and expenses on mount
    useEffect(() => {
        loadAccounts();
        loadOutstandingExpenses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Filter expenses based on search and date criteria
    useEffect(() => {
        let filtered = [...outstandingExpenses];

        // Filter by search term
        const term = searchTerm.trim().toLowerCase();
        if (term) {
            filtered = filtered.filter(expense =>
                expense.type?.toLowerCase().includes(term) ||
                expense.vendorName?.toLowerCase().includes(term) ||
                expense.customer?.toLowerCase().includes(term) ||
                expense.invoiceNumber?.toLowerCase().includes(term)
            );
        }

        // Filter by date range
        if (dateRange.startDate) {
            const startDate = new Date(dateRange.startDate);
            filtered = filtered.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= startDate;
            });
        }

        if (dateRange.endDate) {
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59); // Include the entire end date
            filtered = filtered.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate <= endDate;
            });
        }

        setFilteredExpenses(filtered);
    }, [outstandingExpenses, searchTerm, dateRange]);

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
            showAlert('Please select a payment account', 'warning');
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
            showAlert('Error marking expense as paid: ' + error.message, 'error');
        }
    };

    // Calculate totals
    const totalOutstanding = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

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
                    {loadError && (
                        <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                                <AlertCircle size={18} />
                                <div>
                                    <strong>Error loading outstanding expenses</strong>
                                    <div className="small mt-1">{loadError}</div>
                                </div>
                            </div>
                            <button
                                className="btn btn-sm btn-outline-light text-danger border-danger"
                                onClick={loadOutstandingExpenses}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    <div className="card-header bg-light py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Outstanding Expenses</h3>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-secondary px-3 py-2">
                                    {filteredExpenses.length} expense(s)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    {filteredExpenses.length > 0 && (
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

                    {/* Filters Section */}
                    {outstandingExpenses.length > 0 && (
                        <div className="border-bottom bg-white py-3 px-4">
                            <div className="row align-items-end g-3">
                                <div className="col-md-3">
                                    <label className="form-label small fw-medium mb-1">Search</label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="form-control form-control-sm"
                                        placeholder="Search by type, vendor, customer, invoice #"
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-medium mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={dateRange.startDate}
                                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                        className="form-control form-control-sm"
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label small fw-medium mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={dateRange.endDate}
                                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                        className="form-control form-control-sm"
                                    />
                                </div>
                                <div className="col-md-auto ms-auto">
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setDateRange({ startDate: '', endDate: '' });
                                        }}
                                        className="btn btn-sm btn-outline-secondary"
                                    >
                                        Clear Filters
                                    </button>
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
                                        {canWriteInvoices && (
                                            <th className="px-4 py-3 text-center" style={{ width: '100px' }}>Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.length === 0 ? (
                                        <tr>
                                            <td colSpan={canWriteInvoices ? "8" : "7"} className="text-center py-5 text-muted">
                                                <CheckCircle size={48} className="mb-3 text-success" />
                                                <p className="mb-0 fw-medium">
                                                    {outstandingExpenses.length === 0 ? 'No outstanding expenses' : 'No expenses match your filters'}
                                                </p>
                                                <small>
                                                    {outstandingExpenses.length === 0 ? 'All expenses have been paid!' : 'Try adjusting your search or date filters'}
                                                </small>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredExpenses.map((expense) => (
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
                                                {canWriteInvoices && (
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
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {filteredExpenses.length > 0 && (
                                    <tfoot className="table-light fw-bold">
                                        <tr>
                                            <td colSpan="6" className="px-4 py-3 text-end">Total Outstanding:</td>
                                            <td className="px-4 py-3 text-end text-warning">{formatCurrency(totalOutstanding)}</td>
                                            {canWriteInvoices && <td></td>}
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
                                inModal={true}
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

            {/* Alert Modal */}
            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </>
    );
};

export default OutstandingExpenses;
