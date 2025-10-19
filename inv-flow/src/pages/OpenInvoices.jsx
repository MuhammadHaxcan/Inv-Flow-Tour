import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, DollarSign, Truck, Receipt, Edit2, Printer, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';
import ExpenseForm from '../components/ExpenseForm';
import ServiceForm from '../components/ServiceForm';
import DriverModal from '../components/DriverModal';
import PrintableInvoice from '../components/PrintableInvoice';
import { useData } from '../contexts/DataContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const OpenInvoices = () => {
    const {
        openInvoices,
        drivers,
        services,
        accounts,
        expenses,
        addPayment,
        addExpense,
        addInvoiceService,
        assignDriver,
        updateExpense,
        removeExpense
    } = useData();

    const [expandedInvoice, setExpandedInvoice] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);

    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [driverToAssign, setDriverToAssign] = useState('');
    const [currentExpense, setCurrentExpense] = useState(null);
    const printableInvoiceRef = useRef(null);

    const toggleExpand = (id) => {
        setExpandedInvoice(expandedInvoice === id ? null : id);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-success text-white';
            case 'partial': return 'bg-warning text-dark';
            case 'unpaid': return 'bg-danger text-white';
            default: return 'bg-secondary text-white';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'paid': return 'Paid';
            case 'partial': return 'Partial';
            case 'unpaid': return 'Unpaid';
            default: return status;
        }
    };

    const openPaymentModal = (invoice, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
        setShowPaymentModal(true);
    };

    const openExpenseModal = (invoice, expense = null, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
        setCurrentExpense(expense);
        setShowExpenseModal(true);
    };

    const openServiceModal = (invoice, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
        setShowServiceModal(true);
    };

    const openDriverModal = (invoice, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
        setDriverToAssign(invoice.driver || '');
        setShowDriverModal(true);
    };

    const openPrintModal = (invoice, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
        setShowPrintModal(true);
    };

    // Calculate total VAT for an invoice
    const calculateTotalVAT = (invoice) => {
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

    // Format amount to AED
    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
    };

    const handleAddPayment = (amount, method, date, reference, notes) => {
        if (!currentInvoice) return;

        const paymentData = {
            amount: parseFloat(amount),
            method,
            date,
            reference,
            notes
        };

        addPayment(currentInvoice.id, paymentData);
        setShowPaymentModal(false);
    };

    const handleAddOrUpdateExpense = (type, amount, date, description) => {
        if (!currentInvoice) return;

        const expenseData = {
            type,
            amount: parseFloat(amount),
            date,
            description
        };

        if (currentExpense) {
            // Update existing expense
            updateExpense(currentInvoice.id, currentExpense.id, {
                ...currentExpense,
                ...expenseData
            });
        } else {
            // Add new expense
            addExpense(currentInvoice.id, expenseData);
        }

        setCurrentExpense(null);
        setShowExpenseModal(false);
    };

    const handleDeleteExpense = (invoiceId, expenseId, e) => {
        e && e.stopPropagation();
        if (confirm("Are you sure you want to delete this expense?")) {
            removeExpense(invoiceId, expenseId);
        }
    };

    const handleAddService = (service, rate) => {
        if (!currentInvoice) return;

        // Find the service to get VAT included rate
        const serviceInfo = services.find(s => s.name === service);
        const vatIncludedRate = serviceInfo ? serviceInfo.vatIncluded : rate;

        const serviceData = {
            service,
            rate: parseFloat(vatIncludedRate)
        };

        addInvoiceService(currentInvoice.id, serviceData);
        setShowServiceModal(false);
    };

    const handleAssignDriver = () => {
        if (!currentInvoice) return;
        assignDriver(currentInvoice.id, driverToAssign);
        setShowDriverModal(false);
    };

    // Handle direct printing
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
                        ${getDriverContact(invoice).replace('small', '')}
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
                        <p class="mb-0">Status: <span class="fw-medium">
                            ${invoice.status === 'paid' ? 'Paid' : invoice.status === 'partial' ? 'Partially Paid' : 'Unpaid'}
                        </span></p>
                        <p class="mb-0">Amount Paid: AED ${invoice.paid.toFixed(2)}</p>
                        <p class="mb-0">Balance Due: AED ${(invoice.total - invoice.paid).toFixed(2)}</p>
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
    const getDriverContact = (invoice) => {
        if (!invoice.driver || !drivers) return '';
        const driver = drivers.find(d => d.name === invoice.driver);
        return driver ? `<p class="mb-0 text-muted">Contact: ${driver.phone}</p>` : '';
    };

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
        const vat = calculateTotalVAT(invoice);
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

    // Calculate totals for the table footer
    const calculateTotals = () => {
        if (!openInvoices.length) return { outstanding: 0, total: 0 };

        return openInvoices.reduce((acc, invoice) => {
            acc.total += invoice.total;
            acc.outstanding += (invoice.total - invoice.paid);
            return acc;
        }, { outstanding: 0, total: 0 });
    };

    const totals = calculateTotals();

    // Get expense types from the expenses context
    const expenseTypes = expenses.map(e => e.name);

    return (
        <>
            <div className="content-wrapper">
                <div className="card shadow">
                    <div className="card-header bg-light py-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Open Invoices</h3>
                            <p className="text-muted small mb-0">
                                Manage your pending invoices, record payments and track expenses
                            </p>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Invoice Details</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Driver</th>
                                        <th className="px-4 py-3 text-end">Outstanding</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {openInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">
                                                No invoices found
                                            </td>
                                        </tr>
                                    ) : (
                                        openInvoices.map(invoice => (
                                            <React.Fragment key={invoice.id}>
                                                <tr
                                                    className={`${expandedInvoice === invoice.id ? 'table-active' : ''} cursor-pointer`}
                                                    onClick={() => toggleExpand(invoice.id)}
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
                                                                <div className="text-muted small">{new Date(invoice.date).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="fw-medium">{invoice.customer}</div>
                                                        <div className="text-muted small">{invoice.persons} persons</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                {invoice.driver || (
                                                                    <span className="text-warning">Not assigned</span>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={(e) => openDriverModal(invoice, e)}
                                                                className="btn btn-sm btn-outline-primary ms-2"
                                                                title={invoice.driver ? 'Change Driver' : 'Assign Driver'}
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        <div className="d-flex flex-column align-items-end">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className="fw-bold">
                                                                    {formatCurrency(invoice.total - invoice.paid)}
                                                                </span>
                                                                <button
                                                                    onClick={e => handleDirectPrint(invoice, e)}
                                                                    className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                                    title="Print Invoice"
                                                                >
                                                                    <Printer size={14} />
                                                                </button>
                                                            </div>
                                                            <span className="text-muted small">
                                                                VAT: {formatCurrency(calculateTotalVAT(invoice))}
                                                            </span>
                                                        </div>
                                                        <span className={`badge ${getStatusColor(invoice.status)} rounded-pill`}>
                                                            {getStatusText(invoice.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                                {expandedInvoice === invoice.id && (
                                                    <tr>
                                                        <td colSpan="4" className="p-0 border-0">
                                                            <div className="card m-3">
                                                                {/* Invoice summary */}
                                                                <div className="card-header bg-light py-3">
                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                        <h5 className="card-title mb-0 fw-bold">Invoice Details</h5>
                                                                        <div className="text-muted">
                                                                            Total: {formatCurrency(invoice.total)} |
                                                                            Paid: {formatCurrency(invoice.paid)} |
                                                                            Balance: {formatCurrency(invoice.total - invoice.paid)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Services */}
                                                                <div className="card-body border-bottom py-3">
                                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                                        <h6 className="fw-bold mb-0">Services</h6>
                                                                        <div className="d-flex gap-2">
                                                                            <button
                                                                                onClick={e => openServiceModal(invoice, e)}
                                                                                className="btn btn-sm btn-dark d-flex align-items-center gap-1"
                                                                            >
                                                                                <Plus size={14} />
                                                                                Add Service
                                                                            </button>
                                                                            <button
                                                                                onClick={e => openPaymentModal(invoice, e)}
                                                                                className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                                                            >
                                                                                <DollarSign size={14} />
                                                                                Add Payment
                                                                            </button>
                                                                        </div>
                                                                    </div>
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
                                                                                {invoice.services.length === 0 && (
                                                                                    <tr>
                                                                                        <td colSpan="2" className="text-center text-muted">No services added</td>
                                                                                    </tr>
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>

                                                                {/* Expenses */}
                                                                <div className="card-body border-bottom py-3">
                                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                                        <h6 className="fw-bold mb-0">Expenses</h6>
                                                                        <div className="d-flex gap-2">
                                                                            <button
                                                                                onClick={e => openExpenseModal(invoice, null, e)}
                                                                                className="btn btn-sm btn-dark d-flex align-items-center gap-1"
                                                                            >
                                                                                <Plus size={14} />
                                                                                Add Expense
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-sm table-striped">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Type</th>
                                                                                    <th>Date</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                    <th className="text-center">Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.expenses.map(exp => (
                                                                                    <tr key={exp.id}>
                                                                                        <td>{exp.type}</td>
                                                                                        <td>{exp.date}</td>
                                                                                        <td className="text-end">{formatCurrency(exp.amount)}</td>
                                                                                        <td className="text-center">
                                                                                            <div className="d-flex justify-content-center gap-2">
                                                                                                <button
                                                                                                    onClick={e => openExpenseModal(invoice, exp, e)}
                                                                                                    className="btn btn-sm btn-outline-primary"
                                                                                                    title="Edit Expense"
                                                                                                >
                                                                                                    <Edit2 size={14} />
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={e => handleDeleteExpense(invoice.id, exp.id, e)}
                                                                                                    className="btn btn-sm btn-outline-danger"
                                                                                                    title="Delete Expense"
                                                                                                >
                                                                                                    <Trash2 size={14} />
                                                                                                </button>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                                {invoice.expenses.length === 0 && (
                                                                                    <tr>
                                                                                        <td colSpan="4" className="text-center text-muted">No expenses added</td>
                                                                                    </tr>
                                                                                )}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>

                                                                {/* Payments */}
                                                                <div className="card-body py-3">
                                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                                        <h6 className="fw-bold mb-0">Payments</h6>
                                                                        <div className="text-muted">
                                                                            {invoice.payments.length} payments recorded
                                                                        </div>
                                                                    </div>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-sm table-striped">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Date</th>
                                                                                    <th>Method</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                    <th>Reference</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.payments.map(p => (
                                                                                    <tr key={p.id}>
                                                                                        <td>{p.date}</td>
                                                                                        <td>{p.method}</td>
                                                                                        <td className="text-end">
                                                                                            {formatCurrency(p.amount)}
                                                                                            {p.vat > 0 && (
                                                                                                <span className="text-muted small d-block">
                                                                                                    VAT: {formatCurrency(p.vat)}
                                                                                                </span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td>{p.reference}</td>
                                                                                    </tr>
                                                                                ))}
                                                                                {invoice.payments.length === 0 && (
                                                                                    <tr>
                                                                                        <td colSpan="4" className="text-center text-muted">No payments recorded</td>
                                                                                    </tr>
                                                                                )}
                                                                            </tbody>
                                                                        </table>
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
                                        <td colSpan="3" className="px-4 py-3 text-end">Total:</td>
                                        <td className="px-4 py-3 text-end">
                                            {formatCurrency(totals.outstanding)} / {formatCurrency(totals.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <Modal show={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment">
                <PaymentForm
                    accounts={accounts}
                    onSave={(amount, method, date, reference, notes) => handleAddPayment(amount, method, date, reference, notes)}
                    onCancel={() => setShowPaymentModal(false)}
                    invoice={currentInvoice}
                />
            </Modal>

            {/* Expense Modal */}
            <Modal show={showExpenseModal} onClose={() => { setShowExpenseModal(false); setCurrentExpense(null); }}
                title={currentExpense ? "Edit Expense" : "Add Expense"}>
                <ExpenseForm
                    expenseTypes={expenseTypes}
                    onSave={(type, amount, date, description) => handleAddOrUpdateExpense(type, amount, date, description)}
                    onCancel={() => { setShowExpenseModal(false); setCurrentExpense(null); }}
                    invoice={currentInvoice}
                    expense={currentExpense}
                />
            </Modal>

            {/* Service Modal */}
            <Modal show={showServiceModal} onClose={() => setShowServiceModal(false)} title="Add Service">
                <ServiceForm
                    servicesList={services}
                    onSave={(service, rate) => handleAddService(service, rate)}
                    onCancel={() => setShowServiceModal(false)}
                    invoice={currentInvoice}
                />
            </Modal>

            {/* Driver Modal */}
            <DriverModal
                show={showDriverModal}
                onClose={() => setShowDriverModal(false)}
                onSave={(driver) => {
                    setDriverToAssign(driver);
                    handleAssignDriver();
                }}
                drivers={drivers}
                currentDriver={driverToAssign}
            />

            {/* Print Modal */}
            <Modal
                show={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                title="Print Invoice Voucher"
                size="lg"
            >
                <div className="mb-3 px-0">
                    <PrintableInvoice invoice={currentInvoice} ref={printableInvoiceRef} />
                </div>
                <div className="d-flex justify-content-end">
                    <button
                        onClick={() => handleDirectPrint(currentInvoice)}
                        className="btn btn-primary me-2"
                    >
                        <Printer size={16} className="me-2" />
                        Print
                    </button>
                    <button
                        onClick={() => setShowPrintModal(false)}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default OpenInvoices;