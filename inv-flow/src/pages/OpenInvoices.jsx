import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, DollarSign, Truck, Receipt, Edit2, Printer, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';
import ExpenseForm from '../components/ExpenseForm';
import ServiceForm from '../components/ServiceForm';
import DriverModal from '../components/DriverModal';
import PrintableInvoice from '../components/PrintableInvoice';
import { useData } from '../contexts/DataContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import defaultLogoImg from '../assets/SiyyadKhanLogo.png';

const OpenInvoices = () => {
    const {
        openInvoices,
        drivers,
        services,
        accounts,
        expenses,
        vendors,
        companySettings,
        addPayment,
        addExpense,
        addInvoiceService,
        assignDriver,
        updateExpense,
        removeExpense,
        removeInvoiceService,
        loadOpenInvoices, loadDrivers, loadServices, loadAccounts, loadExpenses, loadVendors, loadCompanySettings,
        loadingStates
    } = useData();

    // Load only needed data when component mounts
    useEffect(() => {
        loadOpenInvoices(true); // Force reload
        loadDrivers();
        loadServices();
        loadAccounts();
        loadExpenses();
        loadVendors();
        loadCompanySettings(true); // Force reload to get latest logo and signature
    }, [loadOpenInvoices, loadDrivers, loadServices, loadAccounts, loadExpenses, loadVendors, loadCompanySettings]);

    // Debug: Log invoices when they change
    useEffect(() => {
        console.log('OpenInvoices - Current invoices:', openInvoices);
        console.log('OpenInvoices - Count:', openInvoices?.length || 0);
    }, [openInvoices]);

    const [expandedInvoice, setExpandedInvoice] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showDeleteServiceAlert, setShowDeleteServiceAlert] = useState(false);
    const [showDeleteExpenseModal, setShowDeleteExpenseModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState({ invoiceId: null, expenseId: null, type: '' });
    const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState({ invoiceId: null, serviceId: null, service: '' });

    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [driverToAssign, setDriverToAssign] = useState('');
    const [currentExpense, setCurrentExpense] = useState(null);
    const [currentService, setCurrentService] = useState(null);
    const printableInvoiceRef = useRef(null);

    // Show loading state if data is being loaded
    const isLoading = loadingStates.openInvoices || loadingStates.drivers || loadingStates.services || loadingStates.accounts || loadingStates.expenses;

    // Show loading state
    if (isLoading) {
        return (
            <div className="content-wrapper py-3 px-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading invoices...</p>
                    </div>
                </div>
            </div>
        );
    }

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

    const openServiceModal = (invoice, service = null, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
        setCurrentService(service);
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

    const handleAddOrUpdateExpense = async (type, amount, date, description, vendorName, pax) => {
        if (!currentInvoice) return;

        const expenseData = {
            type,
            amount: parseFloat(amount),
            date,
            description,
            vendorName,
            pax: pax ? parseInt(pax) : null
        };

        try {
            if (currentExpense) {
                // Update existing expense - pass only the new data, let DataContext handle ID resolution
                await updateExpense(currentInvoice.id, currentExpense.id, expenseData);
            } else {
                // Add new expense
                await addExpense(currentInvoice.id, expenseData);
            }
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Error saving expense: ' + error.message);
        }

        setCurrentExpense(null);
        setShowExpenseModal(false);
    };

    const requestDeleteExpense = (invoiceId, expense) => {
        setExpenseToDelete({ invoiceId, expenseId: expense.id, type: expense.type });
        setShowDeleteExpenseModal(true);
    };

    const confirmDeleteExpense = () => {
        removeExpense(expenseToDelete.invoiceId, expenseToDelete.expenseId);
        setShowDeleteExpenseModal(false);
        setExpenseToDelete({ invoiceId: null, expenseId: null, type: '' });
    };

    // Update this function to handle service updates correctly
    const handleAddOrUpdateService = (service, rate) => {
        if (!currentInvoice) return;

        // Create service data object
        const serviceData = {
            service,
            rate: parseFloat(rate)
        };

        if (currentService) {
            // For editing existing service, preserve the ID
            addInvoiceService(currentInvoice.id, {
                ...serviceData,
                id: currentService.id // Preserve the original service ID
            });
        } else {
            // For new services
            addInvoiceService(currentInvoice.id, serviceData);
        }
        
        setCurrentService(null);
        setShowServiceModal(false);
    };

    const requestDeleteService = (invoiceId, service) => {
        // Find the invoice
        const invoice = openInvoices.find(inv => inv.id === invoiceId);
        if (invoice && invoice.services.length <= 1) {
            alert("Cannot delete the only service. At least one service must remain.");
            return;
        }
        setServiceToDelete({ invoiceId, serviceId: service.id, service: service.service });
        setShowDeleteServiceModal(true);
    };

    const confirmDeleteService = () => {
        removeInvoiceService(serviceToDelete.invoiceId, serviceToDelete.serviceId);
        setShowDeleteServiceModal(false);
        setServiceToDelete({ invoiceId: null, serviceId: null, service: '' });
    };

    // SVG icons for print
    const instagramSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;
    const whatsappSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
    const facebookSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;

    const handleDirectPrint = (invoice, e) => {
        e && e.stopPropagation();

        // Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Get access to the iframe document
        const iframeDoc = iframe.contentWindow.document;

        const goldColor = '#c9a227';

        // Get dynamic logo and signature from company settings
        const logoSrc = companySettings?.logoImageData || (defaultLogoImg.startsWith('http') ? defaultLogoImg : window.location.origin + defaultLogoImg);
        const signatureData = companySettings?.activeSignature?.imageData;
        const companyName = companySettings?.companyName || 'SIYYAD KHAN TOURISM LLC';
        const companyAddress = companySettings?.address || '1513, 15th floor, Tamani Art Building, Dubai, UAE';
        const companyPhone = companySettings?.phone || '+971 55 752 3374';
        const companyEmail = companySettings?.email || 'info@skt.ae';
        const companyWebsite = companySettings?.website || 'www.skt.ae';
        const companyTRN = companySettings?.trn || '104082040700003';

        // Build signature HTML with error handling
        const signatureHTML = signatureData 
            ? `<img src="${signatureData}" alt="Authorized Signature" style="height: 50px; width: auto; margin-bottom: 5px;" onerror="this.style.display='none'" />`
            : '';

        // Write the HTML content to the iframe
        iframeDoc.write(`<!DOCTYPE html>
        <html>
        <head>
            <title>${invoice.number}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <style>
                @media print {
                    body { padding: 15px; font-size: 10pt; }
                    @page { size: A4; margin: 7mm; }
                    .container { padding: 0 !important; max-width: 100%; }
                    .table { margin-bottom: 10px; }
                    .gold { color: ${goldColor}; }
                    .gold-bg { background-color: ${goldColor}; color: white; }
                    a { text-decoration: none !important; }
                }
                .gold { color: ${goldColor}; }
                .gold-bg { background-color: ${goldColor}; color: white; }
                .policy-box { background-color: #fff9e6; border: 1px solid ${goldColor}; border-radius: 4px; padding: 8px; font-size: 9pt; }
                .social-link { display: inline-flex; align-items: center; gap: 4px; text-decoration: none; font-size: 9pt; margin: 0 8px; }
            </style>
        </head>
        <body>
            <div class="container p-2">
                <!-- Header -->
                <div class="d-flex justify-content-between align-items-start mb-3 pb-2 border-bottom" style="border-color: ${goldColor}">
                    <div class="d-flex align-items-start gap-3">
                        <img src="${logoSrc}" alt="Company Logo" style="height: 70px; width: auto;" onerror="this.style.display='none'"/>
                        <div>
                        <h5 class="fw-bold mb-1 gold">${companyName}</h5>
                        <p class="mb-0 text-muted" style="font-size: 10pt">${companyAddress}</p>
                        <p class="mb-0 text-muted" style="font-size: 10pt">Mob: ${companyPhone}</p>
                        <p class="mb-0 text-muted" style="font-size: 10pt">Email: ${companyEmail} | Website: ${companyWebsite}</p>
                        <p class="mb-0 fw-medium" style="font-size: 10pt">TRN: ${companyTRN}</p>
                        </div>
                    </div>
                    <div class="text-end">
                        <p class="fw-bold text-muted mb-1" style="font-size: 10pt">INVOICE</p>
                        <h5 class="fw-bold gold mb-1">${invoice.number}</h5>
                        <p class="mb-0" style="font-size: 10pt">Date: ${new Date(invoice.date).toLocaleDateString()}</p>
                        <div class="mt-2">
                            <a href="https://www.instagram.com/sktuae/" class="social-link" style="color: #E4405F">${instagramSvg}</a>
                            <a href="https://api.whatsapp.com/send/?phone=971557523374" class="social-link" style="color: #25D366">${whatsappSvg}</a>
                            <a href="https://www.facebook.com/sktuae" class="social-link" style="color: #1877F2">${facebookSvg}</a>
                        </div>
                    </div>
                </div>
                
                <!-- Customer & Driver -->
                <div class="row g-0 mb-3 pb-2 border-bottom">
                    <div class="col-6">
                        <p class="fw-bold mb-1 gold" style="font-size: 11pt">ISSUED TO:</p>
                        <p class="mb-1 fw-medium">${invoice.customer}</p>
                        <p class="mb-0 text-muted" style="font-size: 10pt">Pax: <strong>${invoice.persons}</strong> person(s)</p>
                    </div>
                    <div class="col-6 text-end">
                        <p class="fw-bold mb-1 gold" style="font-size: 11pt">DRIVER:</p>
                        <p class="mb-1">${invoice.driver || "Not assigned"}</p>
                        ${getDriverContact(invoice)}
                    </div>
                </div>
                
                <!-- Services -->
                <div class="mb-3">
                    <p class="fw-bold mb-2 gold" style="font-size: 11pt">SERVICES</p>
                    <table class="table table-bordered table-sm" style="font-size: 10pt">
                        <thead class="gold-bg">
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

                <!-- Payment Info -->
                <div class="row g-0 mb-3 pt-2 border-top">
                    <div class="col-6">
                        <p class="fw-bold mb-2 gold" style="font-size: 11pt">PAYMENT INFORMATION:</p>
                        <p class="mb-0" style="font-size: 10pt">Status: <strong>${invoice.status === 'paid' ? 'Paid' : invoice.status === 'partial' ? 'Partially Paid' : 'Unpaid'}</strong></p>
                        <p class="mb-0" style="font-size: 10pt">Amount Paid: AED ${invoice.paid.toFixed(2)}</p>
                        <p class="mb-0" style="font-size: 10pt">Balance Due: <strong>AED ${(invoice.total - invoice.paid).toFixed(2)}</strong></p>
                    </div>
                    <div class="col-6 text-end">
                        <div class="mt-3 pt-3">
                            ${signatureHTML}
                            <div class="border-top pt-1 w-75 ms-auto" style="border-color: ${goldColor}">
                                <p class="mb-0" style="font-size: 10pt">Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Policy Notice -->
                <div class="policy-box mb-3">
                    <div class="row">
                        <div class="col-6">
                            <p class="mb-1 fw-bold gold">Cancellation Policy:</p>
                            <p class="mb-0 text-muted">No cancellations. Only rescheduling is allowed to the next available date.</p>
                        </div>
                        <div class="col-6">
                            <p class="mb-1 fw-bold gold">Card Payment Notice:</p>
                            <p class="mb-0 text-muted">A 5% Value-Added Charge applies to payments made via card.</p>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="text-center pt-2 border-top" style="border-color: ${goldColor}">
                    <p class="mb-1 fw-bold gold">Thank you for choosing ${companyName}!</p>
                    <div class="mb-1">
                        <a href="https://www.instagram.com/sktuae/" class="social-link" style="color: #E4405F">${instagramSvg} @sktuae</a>
                        <a href="https://api.whatsapp.com/send/?phone=971557523374" class="social-link" style="color: #25D366">${whatsappSvg} ${companyPhone}</a>
                        <a href="https://www.facebook.com/sktuae" class="social-link" style="color: #1877F2">${facebookSvg} /sktuae</a>
                    </div>
                    <p class="mb-0 text-muted" style="font-size: 9pt">This is a computer-generated document.</p>
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
        return driver ? `<p class="mb-0 text-muted" style="font-size: 10pt">Contact: ${driver.phone}</p>` : '';
    };

    const getServiceRowsHTML = (invoice) => {
        if (!invoice.services || !invoice.services.length) {
            return '<tr><td colspan="2" class="text-center">No services added</td></tr>';
        }

        return invoice.services.map(service => {
            const rateWithVat = parseFloat(service.rate) || 0;
            const serviceCharge = rateWithVat / 1.05; // Extract base amount

            return `<tr>
                <td>${service.service}</td>
                <td class="text-end">AED ${serviceCharge.toFixed(2)}</td>
            </tr>`;
        }).join('');
    };

    const getInvoiceTotalsHTML = (invoice) => {
        if (!invoice.services || !invoice.services.length) return '';

        const total = invoice.services.reduce((sum, s) => sum + parseFloat(s.rate || 0), 0);
        const vat = calculateTotalVAT(invoice);
        const subtotal = total - vat;

        return `
            <tr class="table-light">
                <td class="text-end fw-medium">Service Total:</td>
                <td class="text-end fw-medium">AED ${subtotal.toFixed(2)}</td>
            </tr>
            <tr class="table-light">
                <td class="text-end fw-medium">VAT (5%):</td>
                <td class="text-end fw-medium">AED ${vat.toFixed(2)}</td>
            </tr>
            <tr class="gold-bg">
                <td class="text-end fw-bold">Total:</td>
                <td class="text-end fw-bold">AED ${total.toFixed(2)}</td>
            </tr>
        `;
    };

    const getExpensesHTML = (invoice) => {
        if (!invoice.expenses || !invoice.expenses.length) return '';

        const expensesTotal = invoice.expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

        return `
            <div class="mb-3">
                <p class="fw-bold mb-2 gold" style="font-size: 11pt">EXPENSES</p>
                <table class="table table-bordered table-sm" style="font-size: 10pt">
                    <thead class="table-light">
                        <tr>
                            <th>Type</th>
                            <th class="text-center">Pax</th>
                            <th class="text-end">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.expenses.map(exp => `
                            <tr>
                                <td>${exp.type}</td>
                                <td class="text-center">${exp.pax || '-'}</td>
                                <td class="text-end">AED ${parseFloat(exp.amount).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot class="table-light">
                        <tr>
                            <td colspan="2" class="text-end fw-medium">Total Expenses:</td>
                            <td class="text-end fw-medium">AED ${expensesTotal.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
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
                                Invoices in progress - unpaid or partially paid invoices
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
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div>
                                                                {invoice.driver || (
                                                                    <span className="text-warning">Not assigned</span>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={(e) => openDriverModal(invoice, e)}
                                                                className="btn btn-sm btn-outline-primary"
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
                                                                                onClick={e => openServiceModal(invoice, null, e)}
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
                                                                                    <th className="text-center" style={{width: "120px"}}>Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.services.map(service => (
                                                                                    <tr key={service.id}>
                                                                                        <td>{service.service}</td>
                                                                                        <td className="text-end">{formatCurrency(service.rate)}</td>
                                                                                        <td className="text-center">
                                                                                            <div className="d-flex justify-content-center gap-2">
                                                                                                <button
                                                                                                    onClick={e => openServiceModal(invoice, service, e)}
                                                                                                    className="btn btn-sm btn-outline-primary"
                                                                                                    title="Edit Service"
                                                                                                >
                                                                                                    <Edit2 size={14} />
                                                                                                </button>
                                                                                                {invoice.services.length > 1 && (
                                                                                                    <button
                                                                                                        onClick={e => requestDeleteService(invoice.id, service)}
                                                                                                        className="btn btn-sm btn-outline-danger"
                                                                                                        title="Delete Service"
                                                                                                    >
                                                                                                        <Trash2 size={14} />
                                                                                                    </button>
                                                                                                )}
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                                {invoice.services.length === 0 && (
                                                                                    <tr>
                                                                                        <td colSpan="3" className="text-center text-muted">No services added</td>
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
                                                                                    <th className="text-center">Pax</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                    <th className="text-center">Actions</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.expenses.map(exp => (
                                                                                        <tr key={exp.id}>
                                                                                            <td>{exp.type}</td>
                                                                                            <td>{exp.date}</td>
                                                                                            <td className="text-center">
                                                                                                {exp.pax ? (
                                                                                                    <span className="badge bg-info">{exp.pax}</span>
                                                                                                ) : (
                                                                                                    <span className="text-muted">-</span>
                                                                                                )}
                                                                                            </td>
                                                                                            <td className="text-end">
                                                                                                <strong>{formatCurrency(exp.amount)}</strong>
                                                                                                {exp.paymentStatus === 'paid' && (
                                                                                                    <span className="badge bg-success ms-2">Paid</span>
                                                                                                )}
                                                                                            </td>
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
                                                                                                        onClick={e => requestDeleteExpense(invoice.id, exp)}
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
                                                                                        <td colSpan="5" className="text-center text-muted">No expenses added</td>
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
                                                                            {invoice.payments.length + invoice.expenses.filter(e => e.paymentStatus === 'paid').length} payment(s) recorded
                                                                        </div>
                                                                    </div>
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
                                                                                {invoice.payments.map(p => (
                                                                                    <tr key={p.id}>
                                                                                        <td>{p.date}</td>
                                                                                        <td>
                                                                                            <span className="badge bg-success">Payment</span>
                                                                                            <span className="ms-1">{p.method}</span>
                                                                                        </td>
                                                                                        <td className="text-end text-success">
                                                                                            +{formatCurrency(p.amount)}
                                                                                            {p.vat > 0 && (
                                                                                                <span className="text-muted small d-block">
                                                                                                    VAT: {formatCurrency(p.vat)}
                                                                                                </span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td>{p.reference || '-'}</td>
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
                                                                                {invoice.payments.length === 0 && invoice.expenses.filter(e => e.paymentStatus === 'paid').length === 0 && (
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
                    vendors={vendors}
                    onSave={(type, amount, date, description, _accountName, vendorName, pax) => handleAddOrUpdateExpense(type, amount, date, description, vendorName, pax)}
                    onCancel={() => { setShowExpenseModal(false); setCurrentExpense(null); }}
                    invoice={currentInvoice}
                    expense={currentExpense}
                />
            </Modal>

            {/* Service Modal */}
            <Modal 
                show={showServiceModal} 
                onClose={() => { setShowServiceModal(false); setCurrentService(null); }} 
                title={currentService ? "Edit Service" : "Add Service"}
            >
                <ServiceForm
                    servicesList={services}
                    onSave={(service, rate) => handleAddOrUpdateService(service, rate)}
                    onCancel={() => { setShowServiceModal(false); setCurrentService(null); }}
                    invoice={currentInvoice}
                    service={currentService}
                    existingServices={currentInvoice?.services || []}
                />
            </Modal>

            {/* Driver Modal */}
            <DriverModal
                show={showDriverModal}
                onClose={() => setShowDriverModal(false)}
                onSave={(driver) => {
                    console.log("Driver selected:", driver);
                    setDriverToAssign(driver);
                    assignDriver(currentInvoice.id, driver); // Call assignDriver directly here
                    setShowDriverModal(false); // Close modal after assignment
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

            <DeleteConfirmationModal
                show={showDeleteExpenseModal}
                onClose={() => setShowDeleteExpenseModal(false)}
                onConfirm={confirmDeleteExpense}
                itemName={expenseToDelete.type}
                title="Delete Expense"
                message="Are you sure you want to delete this expense?"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            />
            <DeleteConfirmationModal
                show={showDeleteServiceModal}
                onClose={() => setShowDeleteServiceModal(false)}
                onConfirm={confirmDeleteService}
                itemName={serviceToDelete.service}
                title="Delete Service"
                message="Are you sure you want to delete this service?"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            />
        </>
    );
};

export default OpenInvoices;