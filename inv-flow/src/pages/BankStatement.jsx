import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import SearchableSelect from '../components/SearchableSelect';
import 'bootstrap/dist/css/bootstrap.min.css';

const BankStatement = () => {
    const { transactions, accounts, loadTransactions, loadAccounts, loadingStates } = useData();

    // Load only needed data when component mounts
    useEffect(() => {
        loadTransactions();
        loadAccounts();
    }, [loadTransactions, loadAccounts]);

    // States
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [expandedTransaction, setExpandedTransaction] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState('all');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    // Filter transactions when filters change
    useEffect(() => {
        let filtered = [...transactions];

        // Filter by account
        if (selectedAccount !== 'all') {
            filtered = filtered.filter(t => t.account === selectedAccount);
        }

        // Filter by date range
        filtered = filtered.filter(t => {
            const txDate = new Date(t.date);
            const start = new Date(dateRange.startDate);
            const end = new Date(dateRange.endDate);
            end.setHours(23, 59, 59);
            return txDate >= start && txDate <= end;
        });

        // Calculate running balances
        let runningBalance = 0;
        filtered = filtered.map(t => {
            runningBalance = runningBalance + t.credit - t.debit;
            return { ...t, balance: runningBalance };
        });

        setFilteredTransactions(filtered);
    }, [transactions, selectedAccount, dateRange]);

    const toggleExpand = (id) => {
        setExpandedTransaction(expandedTransaction === id ? null : id);
    };

    // Calculate totals for footer row
    const calculateTotals = () => {
        return filteredTransactions.reduce((acc, transaction) => {
            acc.credit += transaction.credit;
            acc.debit += transaction.debit;
            return acc;
        }, { credit: 0, debit: 0 });
    };

    const totals = calculateTotals();
    const netBalance = totals.credit - totals.debit;

    // Format amount to AED
    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
    };

    const handleReset = () => {
        setDateRange({
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
        });
        setSelectedAccount('all');
    };

    const isLoading = loadingStates.transactions || loadingStates.accounts;

    if (isLoading) {
        return (
            <div className="content-wrapper">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading transactions...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-wrapper">
            <div className="card shadow">
                <div className="card-header bg-light py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="h5 fw-bold text-primary mb-0">Bank Statement</h3>
                        <p className="text-muted small mb-0">
                            View all financial transactions
                        </p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="border-bottom bg-white py-3 px-4">
                    <div className="row align-items-end g-3">
                        <div className="col-md-3">
                            <label className="form-label small fw-medium mb-1">Account</label>
                            <SearchableSelect
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                options={[
                                    { value: 'all', label: 'All Accounts' },
                                    ...accounts.map(account => ({ value: account.name, label: account.name }))
                                ]}
                                placeholder="All Accounts"
                                size="sm"
                            />
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small fw-medium mb-1">From Date</label>
                            <div className="input-group input-group-sm">
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                    className="form-control"
                                />
                                <span className="input-group-text">
                                    <Calendar size={14} className="text-muted" />
                                </span>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small fw-medium mb-1">To Date</label>
                            <div className="input-group input-group-sm">
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                    className="form-control"
                                />
                                <span className="input-group-text">
                                    <Calendar size={14} className="text-muted" />
                                </span>
                            </div>
                        </div>

                        <div className="col-md-auto ms-auto">
                            <button
                                onClick={handleReset}
                                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                            >
                                <RefreshCw size={14} />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="row g-3 p-4 border-bottom">
                    <div className="col-md-4">
                        <div className="card border-0 bg-success bg-opacity-10 h-100">
                            <div className="card-body py-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Total Credit</p>
                                        <h4 className="mb-0 text-success fw-bold">{formatCurrency(totals.credit)}</h4>
                                    </div>
                                    <div className="bg-success bg-opacity-25 rounded-circle p-2">
                                        <TrendingUp size={24} className="text-success" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 bg-danger bg-opacity-10 h-100">
                            <div className="card-body py-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Total Debit</p>
                                        <h4 className="mb-0 text-danger fw-bold">{formatCurrency(totals.debit)}</h4>
                                    </div>
                                    <div className="bg-danger bg-opacity-25 rounded-circle p-2">
                                        <TrendingDown size={24} className="text-danger" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 bg-primary bg-opacity-10 h-100">
                            <div className="card-body py-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Net Balance</p>
                                        <h4 className={`mb-0 fw-bold ${netBalance >= 0 ? 'text-primary' : 'text-danger'}`}>
                                            {formatCurrency(netBalance)}
                                        </h4>
                                    </div>
                                    <div className="bg-primary bg-opacity-25 rounded-circle p-2">
                                        <DollarSign size={24} className="text-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Invoice #</th>
                                    <th className="px-4 py-3">Account</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3 text-end">Debit</th>
                                    <th className="px-4 py-3 text-end">Credit</th>
                                    <th className="px-4 py-3 text-end">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">
                                            <DollarSign size={48} className="mb-3 opacity-50" />
                                            <p className="mb-0">No transactions found</p>
                                            <small>Try adjusting your date range or account filter</small>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map(transaction => (
                                        <React.Fragment key={transaction.id}>
                                            <tr
                                                onClick={() => toggleExpand(transaction.id)}
                                                className={expandedTransaction === transaction.id ? 'table-active' : ''}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center">
                                                        {expandedTransaction === transaction.id ?
                                                            <ChevronUp size={18} className="text-secondary me-2" /> :
                                                            <ChevronDown size={18} className="text-secondary me-2" />
                                                        }
                                                        {new Date(transaction.date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="fw-medium">{transaction.invoiceNumber || '-'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="badge bg-secondary">{transaction.account}</span>
                                                </td>
                                                <td className="px-4 py-3 text-truncate" style={{ maxWidth: '200px' }}>
                                                    {transaction.description}
                                                </td>
                                                <td className="px-4 py-3 text-end">
                                                    {transaction.debit > 0 ? (
                                                        <span className="text-danger">{formatCurrency(transaction.debit)}</span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-end">
                                                    {transaction.credit > 0 ? (
                                                        <span className="text-success">{formatCurrency(transaction.credit)}</span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-end fw-bold">
                                                    {formatCurrency(transaction.balance)}
                                                </td>
                                            </tr>

                                            {expandedTransaction === transaction.id && (
                                                <tr>
                                                    <td colSpan="7" className="p-0 border-0">
                                                        <div className="card m-3 border">
                                                            <div className="card-header bg-light py-2">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <h6 className="card-title mb-0 fw-bold small">Transaction Details</h6>
                                                                    <span className="text-muted small">
                                                                        Reference: {transaction.reference || 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="card-body py-3">
                                                                <div className="row">
                                                                    <div className="col-md-6">
                                                                        <p className="mb-1 small"><strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()}</p>
                                                                        {transaction.invoiceNumber && (
                                                                            <p className="mb-1 small"><strong>Invoice:</strong> {transaction.invoiceNumber}</p>
                                                                        )}
                                                                        <p className="mb-1 small"><strong>Account:</strong> {transaction.account}</p>
                                                                        <p className="mb-1 small"><strong>Description:</strong> {transaction.description}</p>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <p className="mb-1 small">
                                                                            <strong>{transaction.credit > 0 ? 'Credit:' : 'Debit:'}</strong>{' '}
                                                                            <span className={transaction.credit > 0 ? 'text-success' : 'text-danger'}>
                                                                                {transaction.credit > 0
                                                                                    ? formatCurrency(transaction.credit)
                                                                                    : formatCurrency(transaction.debit)}
                                                                            </span>
                                                                        </p>
                                                                        <p className="mb-1 small"><strong>Reference:</strong> {transaction.reference || 'N/A'}</p>
                                                                        {transaction.notes && (
                                                                            <p className="mb-1 small"><strong>Notes:</strong> {transaction.notes}</p>
                                                                        )}
                                                                        {transaction.expenseType && (
                                                                            <p className="mb-1 small"><strong>Type:</strong> {transaction.expenseType}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                            {filteredTransactions.length > 0 && (
                                <tfoot className="table-light fw-bold">
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-end">Totals:</td>
                                        <td className="px-4 py-3 text-end text-danger">{formatCurrency(totals.debit)}</td>
                                        <td className="px-4 py-3 text-end text-success">{formatCurrency(totals.credit)}</td>
                                        <td className={`px-4 py-3 text-end ${netBalance >= 0 ? 'text-primary' : 'text-danger'}`}>
                                            {formatCurrency(netBalance)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankStatement;
