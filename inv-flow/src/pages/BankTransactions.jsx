import React, { useState, useEffect } from 'react';
import { Calendar, Filter, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const BankTransactions = () => {
    // States
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [expandedTransaction, setExpandedTransaction] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState('all');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
        endDate: new Date().toISOString().split('T')[0] // Today
    });

    // Sample accounts data
    const accounts = [
        { id: 1, name: 'Cash Account', accountType: 'cash' },
        { id: 2, name: 'Bank Account - HBL', accountType: 'bank' },
        { id: 3, name: 'Bank Account - MCB', accountType: 'bank' },
        { id: 4, name: 'Credit Card', accountType: 'bank' }
    ];

    // Sample transactions data - this would come from API in real app
    const sampleTransactions = [
        {
            id: 1,
            date: '2024-03-10',
            description: 'Global Trading payment',
            invoiceNumber: 'INV-2024-0150',
            account: 'Cash Account',
            credit: 5000,
            debit: 0,
            reference: 'ADV-001',
            invoiceId: 1,
            notes: 'Advance payment'
        },
        {
            id: 2,
            date: '2024-03-15',
            description: 'Global Trading final payment',
            invoiceNumber: 'INV-2024-0150',
            account: 'Bank Account - HBL',
            credit: 4500,
            debit: 0,
            reference: 'TRX-123',
            invoiceId: 1,
            notes: 'Final payment'
        },
        {
            id: 3,
            date: '2024-03-17',
            description: 'XYZ Ltd payment',
            invoiceNumber: 'INV-2024-0154',
            account: 'Bank Account - HBL',
            credit: 8000,
            debit: 0,
            reference: 'TRX-452',
            invoiceId: 2
        },
        {
            id: 4,
            date: '2024-03-05',
            description: 'ABC Company advance',
            invoiceNumber: 'INV-2024-0148',
            account: 'Cash Account',
            credit: 7500,
            debit: 0,
            reference: 'ADV-005',
            invoiceId: 3,
            notes: 'Advance payment'
        },
        {
            id: 5,
            date: '2024-03-12',
            description: 'ABC Company settlement',
            invoiceNumber: 'INV-2024-0148',
            account: 'Bank Account - MCB',
            credit: 7500,
            debit: 0,
            reference: 'TRF-789',
            invoiceId: 3,
            notes: 'Final payment'
        },
        {
            id: 6,
            date: '2024-03-18',
            description: 'Fuel expense',
            invoiceNumber: '',
            account: 'Cash Account',
            credit: 0,
            debit: 800,
            reference: 'EXP-001',
            expenseType: 'Fuel'
        },
        {
            id: 7,
            date: '2024-03-20',
            description: 'Driver salary - Ahmed Khan',
            invoiceNumber: '',
            account: 'Bank Account - HBL',
            credit: 0,
            debit: 5000,
            reference: 'SAL-001',
            expenseType: 'Salary'
        },
        // Additional transactions
        {
            id: 8,
            date: '2024-02-05',
            description: 'Dubai Logistics payment',
            invoiceNumber: 'INV-2024-0135',
            account: 'Bank Account - MCB',
            credit: 12500,
            debit: 0,
            reference: 'TRX-089',
            invoiceId: 4
        },
        {
            id: 9,
            date: '2024-02-15',
            description: 'Office rent payment',
            invoiceNumber: '',
            account: 'Bank Account - HBL',
            credit: 0,
            debit: 8000,
            reference: 'CHQ-1053',
            expenseType: 'Rent'
        },
        {
            id: 10,
            date: '2024-02-25',
            description: 'Al Futtaim Group payment',
            invoiceNumber: 'INV-2024-0142',
            account: 'Credit Card',
            credit: 9800,
            debit: 0,
            reference: 'CC-2345',
            invoiceId: 5
        },
        {
            id: 11,
            date: '2024-01-10',
            description: 'Emirates Holdings payment',
            invoiceNumber: 'INV-2024-0125',
            account: 'Cash Account',
            credit: 6500,
            debit: 0,
            reference: 'CASH-125',
            invoiceId: 6
        },
        {
            id: 12,
            date: '2024-01-18',
            description: 'Vehicle maintenance',
            invoiceNumber: '',
            account: 'Cash Account',
            credit: 0,
            debit: 1200,
            reference: 'EXP-015',
            expenseType: 'Maintenance'
        },
        {
            id: 13,
            date: '2024-01-22',
            description: 'Sharjah Investments payment',
            invoiceNumber: 'INV-2024-0130',
            account: 'Bank Account - HBL',
            credit: 15000,
            debit: 0,
            reference: 'TRX-230',
            invoiceId: 7
        },
        {
            id: 14,
            date: '2024-01-30',
            description: 'Insurance premium',
            invoiceNumber: '',
            account: 'Bank Account - MCB',
            credit: 0,
            debit: 3500,
            reference: 'CHQ-1042',
            expenseType: 'Insurance'
        }
    ];

    // Initialize transactions with running balance
    useEffect(() => {
        // Sort transactions by date
        const sortedTransactions = [...sampleTransactions].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        // Calculate running balance
        let runningBalance = 0;
        const transactionsWithBalance = sortedTransactions.map(transaction => {
            runningBalance = runningBalance + transaction.credit - transaction.debit;
            return { ...transaction, balance: runningBalance };
        });

        setTransactions(transactionsWithBalance);
    }, []);

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
            end.setHours(23, 59, 59); // Include the entire end day
            return txDate >= start && txDate <= end;
        });

        // Recalculate running balances for filtered transactions
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
                            <h3 className="h5 fw-bold text-primary mb-0">Bank Transactions</h3>
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
                                <select
                                    value={selectedAccount}
                                    onChange={(e) => setSelectedAccount(e.target.value)}
                                    className="form-select form-select-sm"
                                >
                                    <option value="all">All Accounts</option>
                                    {accounts.map(account => (
                                        <option key={account.id} value={account.name}>{account.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-4">
                                <label className="form-label small fw-medium">From Date</label>
                                <div className="position-relative">
                                    <input
                                        type="date"
                                        value={dateRange.startDate}
                                        onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                                        className="form-control form-control-sm"
                                        style={{ 
                                            paddingRight: "2rem",
                                            cursor: "pointer"
                                        }}
                                        onClick={(e) => e.target.showPicker()}
                                    />
                                    <Calendar 
                                        size={16} 
                                        className="position-absolute end-0 top-50 translate-middle-y me-2 text-muted pointer-events-none"
                                    />
                                </div>
                            </div>
                            
                            <div className="col-md-4">
                                <label className="form-label small fw-medium">To Date</label>
                                <div className="position-relative">
                                    <input
                                        type="date"
                                        value={dateRange.endDate}
                                        onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                                        className="form-control form-control-sm"
                                        style={{ 
                                            paddingRight: "2rem",
                                            cursor: "pointer"
                                        }}
                                        onClick={(e) => e.target.showPicker()}
                                    />
                                    <Calendar 
                                        size={16} 
                                        className="position-absolute end-0 top-50 translate-middle-y me-2 text-muted pointer-events-none"
                                    />
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

export default BankTransactions;