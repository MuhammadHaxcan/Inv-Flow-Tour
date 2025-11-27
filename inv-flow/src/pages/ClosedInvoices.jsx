import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, DollarSign, Receipt, Printer } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import defaultLogoImg from '../assets/SiyyadKhanLogo.png';
import { printInvoice, calculateInvoiceVAT } from '../utils/printInvoice';

const ClosedInvoices = () => {
    const [expandedInvoice, setExpandedInvoice] = useState(null);

    // Use data context instead of local state
    const {
        closedInvoices,
        accounts,
        drivers,
        companySettings,
        loadClosedInvoices, loadAccounts, loadDrivers, loadCompanySettings,
        loadingStates
    } = useData();

    // Load only needed data when component mounts
    useEffect(() => {
        loadClosedInvoices(true); // Force reload
        loadAccounts();
        loadDrivers();
        loadCompanySettings(true); // Force reload to get latest logo and signature
    }, [loadClosedInvoices, loadAccounts, loadDrivers, loadCompanySettings]);

    // Debug: Log invoices when they change
    useEffect(() => {
        console.log('ClosedInvoices - Current invoices:', closedInvoices);
        console.log('ClosedInvoices - Count:', closedInvoices?.length || 0);
    }, [closedInvoices]);

    const toggleExpand = (id) => {
        setExpandedInvoice(expandedInvoice === id ? null : id);
    };

    // Calculate total expenses for an invoice
    const calculateExpensesTotal = (expenses) => {
        return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    };

    // Use unified VAT calculation from print utility
    const calculateVAT = calculateInvoiceVAT;

    // Calculate net amount (Total - VAT - Expenses)
    const calculateNetAmount = (invoice) => {
        const expensesTotal = calculateExpensesTotal(invoice.expenses);
        const vatAmount = calculateVAT(invoice);
        return invoice.total - vatAmount - expensesTotal;
    };

    // Format amount to AED
    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
    };

    // Calculate totals for footer row
    const calculateTotals = () => {
        if (!closedInvoices.length) return { total: 0, vat: 0, expenses: 0, net: 0 };

        return closedInvoices.reduce((acc, invoice) => {
            const vatAmount = calculateVAT(invoice);
            const expensesTotal = calculateExpensesTotal(invoice.expenses);
            
            acc.total += invoice.total;
            acc.vat += vatAmount;
            acc.expenses += expensesTotal;
            acc.net += (invoice.total - vatAmount - expensesTotal); // Fixed calculation
            
            return acc;
        }, { total: 0, vat: 0, expenses: 0, net: 0 });
    };

    const totals = calculateTotals();

    // Handle print using unified utility
    const handleDirectPrint = (invoice, e) => {
        e && e.stopPropagation();
        
        // Get default logo source
        const defaultLogoSrc = defaultLogoImg.startsWith('http') 
            ? defaultLogoImg 
            : window.location.origin + defaultLogoImg;
        
        printInvoice(invoice, {
            companySettings,
            drivers,
            defaultLogoSrc
        });
    };

    return (
        <>
            <div className="content-wrapper">
                <div className="card shadow">
                    <div className="card-header bg-light py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Closed Invoices</h3>
                            <p className="text-muted small mb-0">
                                All fully paid and completed invoices
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
                                    {closedInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                No closed invoices found
                                            </td>
                                        </tr>
                                    ) : (
                                        closedInvoices.map(invoice => (
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
                                                        {formatCurrency(calculateVAT(invoice))}
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
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <div className="text-muted small me-3">
                                                                                Driver: {invoice.driver || 'Not Assigned'}
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => handleDirectPrint(invoice, e)}
                                                                                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                                                title="Print Invoice"
                                                                            >
                                                                                <Printer size={14} />
                                                                                Print
                                                                            </button>
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
                                                                                    <th className="text-end">Amount (incl. VAT)</th>
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
                                                                                    <td>Service Total (excl. VAT)</td>
                                                                                    <td className="text-end">{formatCurrency(invoice.total - calculateVAT(invoice))}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>VAT (5%)</td>
                                                                                    <td className="text-end">{formatCurrency(calculateVAT(invoice))}</td>
                                                                                </tr>
                                                                                <tr className="table-light fw-bold">
                                                                                    <td>Total Amount (incl. VAT)</td>
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
                                                                                    <th className="text-center">Pax</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.expenses.length === 0 ? (
                                                                                    <tr>
                                                                                        <td colSpan="4" className="text-center text-muted">No expenses recorded</td>
                                                                                    </tr>
                                                                                ) : (
                                                                                    <>
                                                                                        {invoice.expenses.map(expense => (
                                                                                            <tr key={expense.id}>
                                                                                                <td>{expense.type}</td>
                                                                                                <td>{expense.date}</td>
                                                                                                <td className="text-center">
                                                                                                    {expense.pax ? (
                                                                                                        <span className="badge bg-info">{expense.pax}</span>
                                                                                                    ) : (
                                                                                                        <span className="text-muted">-</span>
                                                                                                    )}
                                                                                                </td>
                                                                                                <td className="text-end">{formatCurrency(expense.amount)}</td>
                                                                                            </tr>
                                                                                        ))}
                                                                                        <tr className="table-light fw-medium">
                                                                                            <td colSpan="3">Total Expenses</td>
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
                                                                                    <th>Type</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                    <th>Reference</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.payments.map(payment => (
                                                                                    <tr key={payment.id}>
                                                                                        <td>{payment.date}</td>
                                                                                        <td>
                                                                                            <span className="badge bg-success">Payment</span>
                                                                                            <span className="ms-1">{payment.method}</span>
                                                                                        </td>
                                                                                        <td className="text-end text-success">
                                                                                            +{formatCurrency(payment.amount)}
                                                                                            {payment.vat > 0 && (
                                                                                                <span className="text-muted small d-block">
                                                                                                    VAT: {formatCurrency(payment.vat)}
                                                                                                </span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td>{payment.reference || '-'}</td>
                                                                                    </tr>
                                                                                ))}
                                                                                {invoice.expenses.filter(e => e.paymentStatus === 'paid').map(exp => (
                                                                                    <tr key={`exp-${exp.id}`}>
                                                                                        <td>{exp.paidDate || exp.date}</td>
                                                                                        <td>
                                                                                            <span className="badge bg-warning text-dark">Expense</span>
                                                                                            <span className="ms-1">{exp.type}</span>
                                                                                        </td>
                                                                                        <td className="text-end text-danger">
                                                                                            -{formatCurrency(exp.amount)}
                                                                                        </td>
                                                                                        <td>{exp.vendorName || '-'}</td>
                                                                                    </tr>
                                                                                ))}
                                                                                <tr className="table-success fw-bold">
                                                                                    <td colSpan="2">Total Paid</td>
                                                                                    <td className="text-end">{formatCurrency(invoice.paid)}</td>
                                                                                    <td></td>
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
                                                                                <span className="text-muted">VAT (5%):</span>
                                                                                <span>{formatCurrency(calculateVAT(invoice))}</span>
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