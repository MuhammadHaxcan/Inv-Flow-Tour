import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, DollarSign, Receipt, Printer } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const ClosedInvoices = () => {
    const [expandedInvoice, setExpandedInvoice] = useState(null);

    // Use data context instead of local state
    const {
        closedInvoices,
        accounts,
        drivers,
        loadClosedInvoices, loadAccounts, loadDrivers,
        loadingStates
    } = useData();

    // Load only needed data when component mounts
    useEffect(() => {
        loadClosedInvoices(true); // Force reload
        loadAccounts();
        loadDrivers();
    }, [loadClosedInvoices, loadAccounts, loadDrivers]);

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

    // Calculate VAT as 5% of the invoice total
    const calculateVAT = (invoice) => {
        // Extract 5% VAT from each service
        const serviceVAT = invoice.services.reduce((sum, service) => {
            const rate = parseFloat(service.rate) || 0;
            return sum + (rate * 0.05 / 1.05); // Extract VAT from VAT-included price
        }, 0);

        // Add payment VAT if present
        const paymentVAT = invoice.payments.reduce((sum, payment) => {
            return sum + (payment.vat || 0);
        }, 0);

        return serviceVAT + paymentVAT;
    };

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

    // Get driver contact information
    const getDriverContact = (invoice) => {
        if (!invoice.driver || !drivers) return 'Not assigned';
        const driver = drivers.find(d => d.name === invoice.driver);
        return driver ? driver.phone : 'No contact information';
    };

    const handleDirectPrint = (invoice, e) => {
        e && e.stopPropagation();

        // Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Get access to the iframe document
        const iframeDoc = iframe.contentWindow.document;

        // Write the HTML content to the iframe
        iframeDoc.write(`<!DOCTYPE html>
        <html>
        <head>
            <title>${invoice.number}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <style>
                @media print {
                    body { padding: 15px; font-size: 11pt; }
                    @page { size: A4; margin: 7mm; }
                    .container { padding: 0 !important; max-width: 100%; }
                    .table { margin-bottom: 10px; }
                    h5 { margin-bottom: 5px !important; font-size: 12pt !important; font-weight: bold; }
                    p { margin-bottom: 3px !important; font-size: 11pt !important; }
                    .table td, .table th { font-size: 11pt !important; }
                }
            </style>
        </head>
        <body>
            <div class="container p-1">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h2 class="fw-bold text-primary mb-1">Invoice</h2>
                        <p class="mb-0 text-muted">INV-FLOW TRANSPORT LLC</p>
                        <p class="mb-0 text-muted">Dubai, UAE</p>
                        <p class="mb-0 text-muted">info@inv-flow.ae | +971-4-123-4567</p>
                    </div>
                    <div class="text-end">
                        <h3 class="fw-bold mb-1">${invoice.number}</h3>
                        <p class="mb-0">Date: ${new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <!-- Bill To and Driver section -->
                <div class="row g-0 mb-3 border-bottom pb-2">
                    <div class="col-6">
                        <h5 class="fw-bold mb-1">Bill To:</h5>
                        <p class="mb-1 fw-medium">${invoice.customer}</p>
                        <p class="mb-0 text-muted">Number of persons: ${invoice.persons}</p>
                    </div>
                    <div class="col-6 text-end">
                        <h5 class="fw-bold mb-1">Driver:</h5>
                        <p class="mb-1">${invoice.driver || "Not assigned"}</p>
                        <p class="mb-0 text-muted">Contact: ${getDriverContact(invoice)}</p>
                    </div>
                </div>
                
                <div class="mb-3">
                    <h5 class="fw-bold mb-2">Services</h5>
                    <table class="table table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>Description</th>
                                <th class="text-end" style="width:30%">Service Charge (incl. VAT)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getServiceRowsHTML(invoice)}
                        </tbody>
                        <tfoot>
                            ${getInvoiceTotalsHTML(invoice)}
                        </tfoot>
                    </table>
                </div>
                
                <div class="row g-0 mb-3 mt-4 pt-4 border-top">
                    <div class="col-6">
                        <h5 class="fw-bold mb-2">Payment Information:</h5>
                        <p class="mb-0">Status: <span class="fw-medium">Paid</span></p>
                        <p class="mb-0">Amount Paid: AED ${invoice.paid.toFixed(2)}</p>
                        <p class="mb-0">Balance Due: AED 0.00</p>
                    </div>
                    <div class="col-6 text-end">
                        <div class="mt-3">
                            <div class="border-top pt-2 w-50 ms-auto">
                                <p class="mb-0">Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="text-center text-muted">
                    <p class="mb-0">Thank you for your business!</p>
                    <p class="mb-0">This is a computer-generated document and does not require a signature.</p>
                </div>
            </div>
        </body>
        </html>`);

        iframeDoc.close();

        // Wait for the iframe content to load
        iframe.onload = function () {
            try {
                // Print the iframe content
                iframe.contentWindow.print();

                // Remove the iframe after printing (with a delay to ensure printing completes)
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            } catch (e) {
                console.error('Print failed', e);
                document.body.removeChild(iframe);
            }
        };
    };

    // Helper functions for rendering invoice details in the print window
    const getServiceRowsHTML = (invoice) => {
        if (!invoice.services || !invoice.services.length) {
            return '<tr><td colspan="2" class="text-center">No services added</td></tr>';
        }

        return invoice.services.map(service => {
            const rateWithVat = parseFloat(service.rate) || 0;

            return `<tr>
                <td>${service.service}</td>
                <td class="text-end">AED ${rateWithVat.toFixed(2)}</td>
            </tr>`;
        }).join('');
    };

    const getInvoiceTotalsHTML = (invoice) => {
        if (!invoice.services || !invoice.services.length) return '';

        const total = invoice.services.reduce((sum, s) => sum + parseFloat(s.rate || 0), 0);
        const vat = calculateVAT(invoice);
        const subtotal = total - vat;

        return `
            <tr>
                <th class="text-end">Subtotal (excl. VAT):</th>
                <th class="text-end">AED ${subtotal.toFixed(2)}</th>
            </tr>
            <tr>
                <th class="text-end">VAT (5%):</th>
                <th class="text-end">AED ${vat.toFixed(2)}</th>
            </tr>
            <tr>
                <th class="text-end">Total (incl. VAT):</th>
                <th class="text-end">AED ${total.toFixed(2)}</th>
            </tr>
        `;
    };

    return (
        <>
            <div className="content-wrapper py-3 px-4">
                <div className="card shadow">
                    <div className="card-header bg-light py-2">
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
                                                                                        <td className="text-end">
                                                                                            {formatCurrency(payment.amount)}
                                                                                            {payment.vat > 0 && (
                                                                                                <span className="text-muted small d-block">
                                                                                                    VAT: {formatCurrency(payment.vat)}
                                                                                                </span>
                                                                                            )}
                                                                                        </td>
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