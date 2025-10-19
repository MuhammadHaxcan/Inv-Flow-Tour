import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, ChevronUp, Plus, DollarSign, Truck, Receipt, Edit2, Printer } from 'lucide-react';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';
import ExpenseForm from '../components/ExpenseForm';
import ServiceForm from '../components/ServiceForm';
import DriverModal from '../components/DriverModal';
import PrintableInvoice from '../components/PrintableInvoice';
import 'bootstrap/dist/css/bootstrap.min.css';

const OpenInvoices = () => {
    const [expandedInvoice, setExpandedInvoice] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);

    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [assignedDriver, setAssignedDriver] = useState('');
    const [invoiceToPrint, setInvoiceToPrint] = useState(null); // <-- Add this state
    const printableInvoiceRef = useRef(null);

    const [invoices, setInvoices] = useState([
        {
            id: 1,
            number: 'INV-2024-0153',
            date: '2024-03-15',
            customer: 'ABC Company',
            persons: 3,
            driver: 'Ahmed Khan',
            total: 12500,
            paid: 5000,
            status: 'partial',
            services: [
                { id: 1, service: 'Airport Transfer', rate: 5000 },
                { id: 2, service: 'City Tour', rate: 7500 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 500, date: '2024-03-15' },
                { id: 2, type: 'Tolls', amount: 100, date: '2024-03-15' }
            ],
            payments: [
                { id: 1, amount: 5000, date: '2024-03-15', method: 'Cash Account', reference: 'ADV-001', vat: 0 }
            ]
        },
        {
            id: 2,
            number: 'INV-2024-0154',
            date: '2024-03-17',
            customer: 'XYZ Holdings',
            persons: 2,
            driver: 'Ali Raza',
            total: 9000,
            paid: 3000,
            status: 'partial',
            services: [
                { id: 1, service: 'Hourly Rental', rate: 3000 },
                { id: 2, service: 'City Tour', rate: 6000 }
            ],
            expenses: [
                { id: 1, type: 'Parking', amount: 200, date: '2024-03-17' }
            ],
            payments: [
                { id: 1, amount: 3000, date: '2024-03-17', method: 'Bank Account - HBL', reference: 'DEP-002', vat: 150 }
            ]
        },
        {
            id: 3,
            number: 'INV-2024-0155',
            date: '2024-03-18',
            customer: 'Global Trading',
            persons: 4,
            driver: '',
            total: 15000,
            paid: 0,
            status: 'unpaid',
            services: [
                { id: 1, service: 'Outstation', rate: 15000 }
            ],
            expenses: [],
            payments: []
        }
    ]);

    const [drivers] = useState([
        { id: 1, name: 'Ahmed Khan', phone: '+971501111111' },
        { id: 2, name: 'Ali Raza', phone: '+971502222222' },
        { id: 3, name: 'Mohammad Siddiq', phone: '+971503333333' }
    ]);

    const accounts = [
        { name: 'Cash Account', accountType: 'cash', type: 'cash' },
        { name: 'Bank Account - HBL', accountType: 'bank', type: 'bank' },
        { name: 'Bank Account - MCB', accountType: 'bank', type: 'bank' },
        { name: 'Credit Card', accountType: 'bank', type: 'bank' }
    ];

    const expenseTypes = ['Fuel', 'Tolls', 'Parking', 'Tickets', 'Maintenance'];

    const servicesList = [
        { name: 'Airport Transfer', rate: 5000 },
        { name: 'City Tour', rate: 8000 },
        { name: 'Hourly Rental', rate: 3000 },
        { name: 'Outstation', rate: 12000 }
    ];

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

    const openExpenseModal = (invoice, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
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
        setAssignedDriver(invoice.driver || '');
        setShowDriverModal(true);
    };

    const openPrintModal = (invoice, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
        setShowPrintModal(true);
    };

    // Calculate VAT based on payment method
    const calculateVAT = (payment, accounts) => {
        const account = accounts.find(acc => acc.name === payment.method);
        // Apply 5% VAT if it's a bank account, 0 if it's cash
        return account?.accountType === 'cash' ? 0 : payment.amount * 0.05;
    };

    // Calculate total VAT for an invoice
    const calculateTotalVAT = (invoice, accounts) => {
        return invoice.payments.reduce((sum, payment) => sum + calculateVAT(payment, accounts), 0);
    };

    // Format amount to AED
    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
    };

    // Update the handleAddPayment function to include VAT calculation
    const handleAddPayment = (amount, method, date, reference, notes) => {
        if (!currentInvoice) return;
        const parsedAmount = parseFloat(amount);
        
        // Find account to determine if VAT applies
        const account = accounts.find(acc => acc.name === method);
        const vatAmount = account?.accountType === 'cash' ? 0 : parsedAmount * 0.05;
        
        const updatedInvoices = invoices.map(inv => {
            if (inv.id === currentInvoice.id) {
                const newPayment = {
                    id: Date.now(),
                    amount: parsedAmount,
                    date,
                    method,
                    reference,
                    notes,
                    vat: vatAmount
                };

                const newPaid = inv.paid + parsedAmount;
                let newStatus = 'unpaid';
                if (newPaid >= inv.total) newStatus = 'paid';
                else if (newPaid > 0) newStatus = 'partial';

                return {
                    ...inv,
                    payments: [...inv.payments, newPayment],
                    paid: newPaid,
                    vat: (inv.vat || 0) + vatAmount,
                    status: newStatus
                };
            }
            return inv;
        });

        // Filter out paid invoices
        const filteredInvoices = updatedInvoices.filter(inv => inv.status !== 'paid');
        
        setInvoices(filteredInvoices);
        setShowPaymentModal(false);
    };

    const handleAddExpense = (type, amount, date, description) => {
        if (!currentInvoice) return;
        const updatedInvoices = invoices.map(inv => {
            if (inv.id === currentInvoice.id) {
                const newExpense = {
                    id: Date.now(),
                    type,
                    amount: parseFloat(amount),
                    date,
                    description
                };

                return {
                    ...inv,
                    expenses: [...inv.expenses, newExpense]
                };
            }
            return inv;
        });

        setInvoices(updatedInvoices);
        setShowExpenseModal(false);
    };

    const handleAddService = (service, rate) => {
        if (!currentInvoice) return;
        const updatedInvoices = invoices.map(inv => {
            if (inv.id === currentInvoice.id) {
                const newService = {
                    id: Date.now(),
                    service,
                    rate: parseFloat(rate)
                };

                const newTotal = inv.total + parseFloat(rate);
                let newStatus = 'unpaid';
                if (inv.paid >= newTotal) newStatus = 'paid';
                else if (inv.paid > 0) newStatus = 'partial';

                return {
                    ...inv,
                    services: [...inv.services, newService],
                    total: newTotal,
                    status: newStatus
                };
            }
            return inv;
        });

        setInvoices(updatedInvoices);
        setShowServiceModal(false);
    };

    const handleAssignDriver = () => {
        if (!currentInvoice) return;
        const updatedInvoices = invoices.map(inv => {
            if (inv.id === currentInvoice.id) {
                return {
                    ...inv,
                    driver: assignedDriver
                };
            }
            return inv;
        });

        setInvoices(updatedInvoices);
        setShowDriverModal(false);
    };

    // Print invoice handler
    const handlePrintInvoice = () => {
        const printContent = document.getElementById('printable-invoice');
        const originalContents = document.body.innerHTML;
        
        document.body.innerHTML = printContent.innerHTML;
        
        window.print();
        
        document.body.innerHTML = originalContents;
        
        // Reload the page to restore all React event listeners
        window.location.reload();
    };
            
    // Replace your current handleDirectPrint function with this version
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
                
                <!-- Improved Bill To and Driver section with normal font size -->
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
                                <th class="text-end" style="width:30%">Service Charge</th>
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
    iframe.onload = function() {
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
            const original = parseFloat(service.rate) || 0;
            const vat = original * 0.05;
            const discounted = original - vat;
            
            return `<tr>
                <td>${service.service}</td>
                <td class="text-end">AED ${discounted.toFixed(2)}</td>
            </tr>`;
        }).join('');
    };
    
    const getInvoiceTotalsHTML = (invoice) => {
        if (!invoice.services || !invoice.services.length) return '';
        
        const serviceRows = invoice.services.map(service => {
            const original = parseFloat(service.rate) || 0;
            const vat = original * 0.05;
            const discounted = original - vat;
            return { original, vat, discounted };
        });
        
        const serviceTotal = serviceRows.reduce((sum, s) => sum + s.discounted, 0);
        const vatTotal = serviceRows.reduce((sum, s) => sum + s.vat, 0);
        const subtotal = serviceTotal + vatTotal;
        
        return `
            <tr>
                <th class="text-end">Service Total:</th>
                <th class="text-end">AED ${serviceTotal.toFixed(2)}</th>
            </tr>
            <tr>
                <th class="text-end">VAT Total:</th>
                <th class="text-end">AED ${vatTotal.toFixed(2)}</th>
            </tr>
            <tr>
                <th class="text-end">Subtotal:</th>
                <th class="text-end">AED ${subtotal.toFixed(2)}</th>
            </tr>
        `;
    };

    // Add totals calculation for the table footer
    const calculateTotals = () => {
        if (!invoices.length) return { outstanding: 0, total: 0 };
        
        return invoices.reduce((acc, invoice) => {
            acc.total += invoice.total;
            acc.outstanding += (invoice.total - invoice.paid);
            return acc;
        }, { outstanding: 0, total: 0 });
    };

    // Add this before the return statement
    const totals = calculateTotals();

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
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">
                                                No invoices found
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map(invoice => (
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
                                                        <div>
                                                            {invoice.driver || (
                                                                <span className="text-warning">Not assigned</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        <div className="d-flex flex-column align-items-end">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className="fw-bold">
                                                                    AED {(invoice.total - invoice.paid).toFixed(2)}
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
                                                                VAT: AED {calculateTotalVAT(invoice, accounts).toFixed(2)}
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
                                                                            Total: AED {invoice.total.toFixed(2)} |
                                                                            Paid: AED {invoice.paid.toFixed(2)} |
                                                                            Balance: AED {(invoice.total - invoice.paid).toFixed(2)}
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
                                                                            {/* Print Voucher button removed */}
                                                                        </div>
                                                                    </div>
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
                                                                                        <td className="text-end">AED {service.rate.toFixed(2)}</td>
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
                                                                                onClick={e => openExpenseModal(invoice, e)}
                                                                                className="btn btn-sm btn-dark d-flex align-items-center gap-1"
                                                                            >
                                                                                <Plus size={14} />
                                                                                Add Expense
                                                                            </button>
                                                                            <button
                                                                                onClick={e => openDriverModal(invoice, e)}
                                                                                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                                            >
                                                                                <Truck size={14} />
                                                                                {invoice.driver ? 'Change Driver' : 'Assign Driver'}
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
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.expenses.map(exp => (
                                                                                    <tr key={exp.id}>
                                                                                        <td>{exp.type}</td>
                                                                                        <td>{exp.date}</td>
                                                                                        <td className="text-end">AED {exp.amount.toFixed(2)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                                {invoice.expenses.length === 0 && (
                                                                                    <tr>
                                                                                        <td colSpan="3" className="text-center text-muted">No expenses added</td>
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
                                                                                            AED {p.amount.toFixed(2)}
                                                                                            {p.vat > 0 && (
                                                                                                <span className="text-muted small d-block">
                                                                                                    VAT: AED {p.vat.toFixed(2)}
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
            <Modal show={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Add Expense">
                <ExpenseForm
                    expenseTypes={expenseTypes}
                    onSave={(type, amount, date, description) => handleAddExpense(type, amount, date, description)}
                    onCancel={() => setShowExpenseModal(false)}
                    invoice={currentInvoice}
                />
            </Modal>

            {/* Service Modal */}
            <Modal show={showServiceModal} onClose={() => setShowServiceModal(false)} title="Add Service">
                <ServiceForm
                    servicesList={servicesList}
                    onSave={(service, rate) => handleAddService(service, rate)}
                    onCancel={() => setShowServiceModal(false)}
                    invoice={currentInvoice}
                />
            </Modal>

            {/* Driver Modal */}
            <DriverModal 
                show={showDriverModal} 
                onClose={() => setShowDriverModal(false)} 
                onSave={(driver) => handleAssignDriver()}
                drivers={drivers}
                currentDriver={assignedDriver}
            />

            {/* Print Modal */}
            <Modal 
                show={showPrintModal} 
                onClose={() => setShowPrintModal(false)} 
                title="Print Invoice Voucher"
                size="lg"
            >
                <div className="mb-3 px-0"> {/* Remove padding if needed */}
                    <PrintableInvoice invoice={currentInvoice} ref={printableInvoiceRef} />
                </div>
                <div className="d-flex justify-content-end">
                    <button 
                        onClick={handlePrintInvoice}
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