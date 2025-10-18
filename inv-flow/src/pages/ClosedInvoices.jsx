import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, DollarSign, Receipt } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ClosedInvoices = () => {
    const [expandedInvoice, setExpandedInvoice] = useState(null);

    // Sample data - normally would come from API or context
    const [invoices, setInvoices] = useState([
        {
            id: 1,
            number: 'INV-2024-0150',
            date: '2024-03-10',
            customer: 'Global Trading',
            persons: 2,
            driver: 'Ahmed Khan',
            total: 9500,
            paid: 9500,
            status: 'paid',
            vat: 0,
            services: [
                { id: 1, service: 'Airport Transfer', rate: 4000 },
                { id: 2, service: 'City Tour', rate: 5500 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 300, date: '2024-03-10' },
                { id: 2, type: 'Tolls', amount: 100, date: '2024-03-10' }
            ],
            payments: [
                { id: 1, amount: 5000, date: '2024-03-10', method: 'Cash Account', reference: 'ADV-001' },
                { id: 2, amount: 4500, date: '2024-03-15', method: 'Bank Account - HBL', reference: 'TRX-123' }
            ]
        },
        {
            id: 2,
            number: 'INV-2024-0154',
            date: '2024-03-17',
            customer: 'XYZ Ltd',
            persons: 2,
            driver: 'Ali Raza',
            total: 8000,
            paid: 8000,
            status: 'paid',
            vat: 0,
            services: [
                { id: 1, service: 'Hourly Rental', rate: 3000 },
                { id: 2, service: 'City Tour', rate: 5000 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 400, date: '2024-03-17' }
            ],
            payments: [
                { id: 1, amount: 8000, date: '2024-03-17', method: 'Bank Account - HBL', reference: 'TRX-452' }
            ]
        },
        {
            id: 3,
            number: 'INV-2024-0148',
            date: '2024-03-05',
            customer: 'ABC Company',
            persons: 4,
            driver: 'Mohammad Siddiq',
            total: 15000,
            paid: 15000,
            status: 'paid',
            vat: 0,
            services: [
                { id: 1, service: 'Outstation', rate: 15000 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 800, date: '2024-03-05' },
                { id: 2, type: 'Accommodation', amount: 600, date: '2024-03-06' }
            ],
            payments: [
                { id: 1, amount: 7500, date: '2024-03-05', method: 'Cash Account', reference: 'ADV-005' },
                { id: 2, amount: 7500, date: '2024-03-12', method: 'Bank Account - MCB', reference: 'TRF-789' }
            ]
        }
    ]);

    // Add accounts data to match with payment methods
    const [accounts] = useState([
        { name: 'Cash Account', accountType: 'cash' },
        { name: 'Bank Account - HBL', accountType: 'bank' },
        { name: 'Bank Account - MCB', accountType: 'bank' },
        { name: 'Credit Card', accountType: 'bank' }
    ]);

    const toggleExpand = (id) => {
        setExpandedInvoice(expandedInvoice === id ? null : id);
    };

    // Calculate total expenses for an invoice
    const calculateExpensesTotal = (expenses) => {
        return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    };

    // Calculate VAT for a payment based on its method
    const calculateVAT = (payment) => {
        const account = accounts.find(acc => acc.name === payment.method);
        return account?.accountType === 'cash' ? 0 : payment.amount * 0.05;
    };

    // Calculate total VAT for an invoice
    const calculateInvoiceVAT = (invoice) => {
        return invoice.payments.reduce((sum, payment) => sum + calculateVAT(payment), 0);
    };

    // Calculate net amount (Total + VAT - Expenses)
    const calculateNetAmount = (invoice) => {
        const expensesTotal = calculateExpensesTotal(invoice.expenses);
        return invoice.total + invoice.vat - expensesTotal;
    };

    // Format amount to AED
    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount).toFixed(2)}`;
    };

    // Calculate totals for footer row
    const calculateTotals = () => {
        return invoices.reduce((acc, invoice) => {
            const invoiceVAT = calculateInvoiceVAT(invoice);
            const expensesTotal = calculateExpensesTotal(invoice.expenses);
            
            acc.total += invoice.total;
            acc.vat += invoiceVAT;
            acc.expenses += expensesTotal;
            acc.net += (invoice.total + invoiceVAT - expensesTotal);
            
            return acc;
        }, { total: 0, vat: 0, expenses: 0, net: 0 });
    };

    const totals = calculateTotals();

    return (
        <>
            <div className="content-wrapper py-3 px-4">
                <div className="card shadow">
                    <div className="card-header bg-light py-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Closed Invoices</h3>
                            <p className="text-muted small mb-0">
                                View all completed and paid invoices
                            </p>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Invoice</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-end">Total</th>
                                        <th className="px-4 py-3 text-end">VAT</th>
                                        <th className="px-4 py-3 text-end">Expenses</th>
                                        <th className="px-4 py-3 text-end">Net Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                No closed invoices found
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map(invoice => (
                                            <React.Fragment key={invoice.id}>
                                                <tr
                                                    onClick={() => toggleExpand(invoice.id)}
                                                    className={expandedInvoice === invoice.id ? 'table-active' : ''}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="d-flex align-items-center">
                                                            {expandedInvoice === invoice.id ? 
                                                                <ChevronUp size={18} className="text-secondary me-2" /> :
                                                                <ChevronDown size={18} className="text-secondary me-2" />
                                                            }
                                                            <div>
                                                                <div className="fw-bold">{invoice.number}</div>
                                                                <div className="text-muted small">
                                                                    <span className="badge bg-success text-white">Paid</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="fw-medium">{invoice.customer}</div>
                                                        <div className="text-muted small">{invoice.persons} persons</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {new Date(invoice.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-end fw-medium">
                                                        {formatCurrency(invoice.total)}
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        {formatCurrency(calculateInvoiceVAT(invoice))}
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        {formatCurrency(calculateExpensesTotal(invoice.expenses))}
                                                    </td>
                                                    <td className="px-4 py-3 text-end fw-bold">
                                                        {formatCurrency(calculateNetAmount(invoice))}
                                                    </td>
                                                </tr>
                                                
                                                {expandedInvoice === invoice.id && (
                                                    <tr>
                                                        <td colSpan="7" className="p-0 border-0">
                                                            <div className="card m-3">
                                                                <div className="card-header bg-light py-3">
                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                        <h6 className="card-title mb-0 fw-bold">Invoice Details</h6>
                                                                        <div className="text-muted small">
                                                                            Driver: {invoice.driver || 'Not Assigned'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Services */}
                                                                <div className="card-body border-bottom py-3">
                                                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                                                        <FileText size={16} /> Services
                                                                    </h6>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-sm table-striped">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Service</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.services.map(service => (
                                                                                    <tr key={service.id}>
                                                                                        <td>{service.service}</td>
                                                                                        <td className="text-end">{formatCurrency(service.rate)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                                <tr className="table-light fw-medium">
                                                                                    <td>Subtotal</td>
                                                                                    <td className="text-end">{formatCurrency(invoice.total)}</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Expenses */}
                                                                <div className="card-body border-bottom py-3">
                                                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                                                        <Receipt size={16} /> Expenses
                                                                    </h6>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-sm table-striped">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Type</th>
                                                                                    <th>Date</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.expenses.length === 0 ? (
                                                                                    <tr>
                                                                                        <td colSpan="3" className="text-center text-muted">No expenses recorded</td>
                                                                                    </tr>
                                                                                ) : (
                                                                                    <>
                                                                                        {invoice.expenses.map(expense => (
                                                                                            <tr key={expense.id}>
                                                                                                <td>{expense.type}</td>
                                                                                                <td>{expense.date}</td>
                                                                                                <td className="text-end">{formatCurrency(expense.amount)}</td>
                                                                                            </tr>
                                                                                        ))}
                                                                                        <tr className="table-light fw-medium">
                                                                                            <td colSpan="2">Total Expenses</td>
                                                                                            <td className="text-end">{formatCurrency(calculateExpensesTotal(invoice.expenses))}</td>
                                                                                        </tr>
                                                                                    </>
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Payments */}
                                                                <div className="card-body py-3">
                                                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                                                        <DollarSign size={16} /> Payments
                                                                    </h6>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-sm table-striped">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Date</th>
                                                                                    <th>Method</th>
                                                                                    <th>Reference</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.payments.map(payment => (
                                                                                    <tr key={payment.id}>
                                                                                        <td>{payment.date}</td>
                                                                                        <td>{payment.method}</td>
                                                                                        <td>{payment.reference}</td>
                                                                                        <td className="text-end">{formatCurrency(payment.amount)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                                <tr className="table-success fw-bold">
                                                                                    <td colSpan="3">Total Paid</td>
                                                                                    <td className="text-end">{formatCurrency(invoice.paid)}</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Summary */}
                                                                <div className="card-footer bg-light">
                                                                    <div className="row">
                                                                        <div className="col-md-8 offset-md-4">
                                                                            <div className="d-flex justify-content-between mb-2">
                                                                                <span className="text-muted">Invoice Total:</span>
                                                                                <span className="fw-medium">{formatCurrency(invoice.total)}</span>
                                                                            </div>
                                                                            <div className="d-flex justify-content-between mb-2">
                                                                                <span className="text-muted">VAT:</span>
                                                                                <span>{formatCurrency(invoice.vat)}</span>
                                                                            </div>
                                                                            <div className="d-flex justify-content-between mb-2">
                                                                                <span className="text-muted">Expenses:</span>
                                                                                <span>{formatCurrency(calculateExpensesTotal(invoice.expenses))}</span>
                                                                            </div>
                                                                            <div className="d-flex justify-content-between pt-2 border-top">
                                                                                <span className="fw-bold">Net Amount:</span>
                                                                                <span className="fw-bold">{formatCurrency(calculateNetAmount(invoice))}</span>
                                                                            </div>
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
                                        <td colSpan="3" className="px-4 py-3 text-end">Totals:</td>
                                        <td className="px-4 py-3 text-end">{formatCurrency(totals.total)}</td>
                                        <td className="px-4 py-3 text-end">{formatCurrency(totals.vat)}</td>
                                        <td className="px-4 py-3 text-end">{formatCurrency(totals.expenses)}</td>
                                        <td className="px-4 py-3 text-end">{formatCurrency(totals.net)}</td>
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

export default ClosedInvoices;