import React, { useState, useEffect } from 'react';
import { Calendar, Filter, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
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

    return (
        <>
            <div className="content-wrapper py-3 px-4">
                <div className="card shadow">
                    <div className="card-header bg-light py-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Bank Statement</h3>
                            <p className="text-muted small mb-0">
                                View all financial transactions
                            </p>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="card-body border-bottom bg-light py-3">
                        <div className="row align-items-end">
                            <div className="col-md-4">
                                <label className="form-label small fw-medium">Account</label>
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

                            <div className="col-md-4">
                                <label className="form-label small fw-medium">From Date</label>
                                <div className="input-group input-group-sm">
                                    <input
                                        type="date"
                                        value={dateRange.startDate}
                                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                        className="form-control"
                                    />
                                    <span className="input-group-text">
                                        <Calendar size={16} className="text-muted" />
                                    </span>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label small fw-medium">To Date</label>
                                <div className="input-group input-group-sm">
                                    <input
                                        type="date"
                                        value={dateRange.endDate}
                                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                        className="form-control"
                                    />
                                    <span className="input-group-text">
                                        <Calendar size={16} className="text-muted" />
                                    </span>
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
                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                No transactions found in the selected date range
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
                                                        {transaction.invoiceNumber || '-'}
                                                    </td>
                                                    <td className="px-4 py-3">{transaction.account}</td>
                                                    <td className="px-4 py-3">{transaction.description}</td>
                                                    <td className="px-4 py-3 text-end">
                                                        {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-end fw-bold">
                                                        {formatCurrency(transaction.balance)}
                                                    </td>
                                                </tr>

                                                {expandedTransaction === transaction.id && (
                                                    <tr>
                                                        <td colSpan="7" className="p-0 border-0">
                                                            <div className="card m-3">
                                                                <div className="card-header bg-light py-3">
                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                        <h6 className="card-title mb-0 fw-bold">Transaction Details</h6>
                                                                        <div className="text-muted small">
                                                                            Reference: {transaction.reference || 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="card-body py-3">
                                                                    <div className="row">
                                                                        <div className="col-md-6">
                                                                            <p className="mb-1"><strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()}</p>
                                                                            {transaction.invoiceNumber && (
                                                                                <p className="mb-1"><strong>Invoice:</strong> {transaction.invoiceNumber}</p>
                                                                            )}
                                                                            <p className="mb-1"><strong>Account:</strong> {transaction.account}</p>
                                                                            <p className="mb-1"><strong>Description:</strong> {transaction.description}</p>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <p className="mb-1">
                                                                                <strong>{transaction.credit > 0 ? 'Credit:' : 'Debit:'}</strong>
                                                                                {transaction.credit > 0
                                                                                    ? formatCurrency(transaction.credit)
                                                                                    : formatCurrency(transaction.debit)}
                                                                            </p>
                                                                            <p className="mb-1"><strong>Reference:</strong> {transaction.reference || 'N/A'}</p>
                                                                            {transaction.notes && (
                                                                                <p className="mb-1"><strong>Notes:</strong> {transaction.notes}</p>
                                                                            )}
                                                                            {transaction.expenseType && (
                                                                                <p className="mb-1"><strong>Type:</strong> {transaction.expenseType}</p>
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
                                <tfoot className="table-light fw-bold">
                                    <tr>
                                        <td colSpan="4" className="px-4 py-3 text-end">Totals:</td>
                                        <td className="px-4 py-3 text-end">{formatCurrency(totals.debit)}</td>
                                        <td className="px-4 py-3 text-end">{formatCurrency(totals.credit)}</td>
                                        <td className="px-4 py-3 text-end">{formatCurrency(netBalance)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BankStatement;