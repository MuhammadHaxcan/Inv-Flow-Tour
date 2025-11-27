import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, DollarSign, Receipt, Printer } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import defaultLogoImg from '../assets/SiyyadKhanLogo.png';

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
                        <p class="mb-0 text-muted" style="font-size: 10pt">Contact: ${getDriverContact(invoice)}</p>
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
                        <p class="mb-0" style="font-size: 10pt">Status: <strong>Paid</strong></p>
                        <p class="mb-0" style="font-size: 10pt">Amount Paid: AED ${invoice.paid.toFixed(2)}</p>
                        <p class="mb-0" style="font-size: 10pt">Balance Due: <strong>AED 0.00</strong></p>
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
        const vat = calculateVAT(invoice);
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