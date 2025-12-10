import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../assets/SiyyadKhanLogo.png';

// SVG Icons as components for better compatibility
const InstagramIcon = ({ size = 16, color = '#E4405F' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
);

const WhatsAppIcon = ({ size = 16, color = '#25D366' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

const FacebookIcon = ({ size = 16, color = '#1877F2' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const PrintableInvoice = ({ invoice }) => {
    // More robust null checking
    if (!invoice) {
        console.error("No invoice data provided to PrintableInvoice");
        return <div className="p-4">No invoice data available</div>;
    }

    if (!Array.isArray(invoice.services)) {
        console.error("Invoice is missing services array:", invoice);
        return <div className="p-4">Invalid invoice data: missing services</div>;
    }

    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
    };

    // Find driver contact number if available
    let driverContact = '';
    if (invoice.driver && invoice.drivers && Array.isArray(invoice.drivers)) {
        const driverObj = invoice.drivers.find(d => d.name === invoice.driver);
        if (driverObj) driverContact = driverObj.phone;
    }

    // Calculate discounted service charges and VAT for each service
    const serviceRows = invoice.services.map((service, index) => {
        const original = parseFloat(service.rate) || 0;
        const vat = original * 0.05;
        const discounted = original - vat;
        return {
            ...service,
            original,
            vat,
            discounted
        };
    });

    // Service total (sum of discounted charges)
    const serviceTotal = serviceRows.reduce((sum, s) => sum + s.discounted, 0);
    // VAT total (sum of all VATs)
    const vatTotal = serviceRows.reduce((sum, s) => sum + s.vat, 0);
    // Subtotal (service total + VAT total)
    const subtotal = serviceTotal + vatTotal;

    // Calculate expenses total
    const expensesTotal = invoice.expenses?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;

    // Gold color for branding
    const goldColor = '#c9a227';

    // Social media links
    const socialLinks = {
        instagram: 'https://www.instagram.com/sktuae/',
        whatsapp: 'https://api.whatsapp.com/send/?phone=971557523374',
        facebook: 'https://www.facebook.com/sktuae'
    };

    return (
        <div className="printable-invoice px-0 py-3" id="printable-invoice">
            {/* Header Section with Logo */}
            <div className="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom" style={{ borderColor: goldColor }}>
                <div className="d-flex align-items-center gap-3">
                    <img 
                        src={logo} 
                        alt="Siyyad Khan Tourism" 
                        style={{ height: '83px', width: 'auto' }} 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                        <h5 className="fw-bold mb-1" style={{ color: goldColor }}>SIYYAD KHAN TOURISM LLC</h5>
                        <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>1513, 15th floor, Tamani Art Building</p>
                        <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Dubai, UAE | Mob: +971 55 752 3374</p>
                        <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Email: info@skt.ae | Website: www.skt.ae</p>
                        <p className="mb-0 fw-medium" style={{ fontSize: '12px' }}>TRN: 104082040700003</p>
                    </div>
                </div>
                <div className="text-end">
                    <p className="fw-bold text-muted mb-1" style={{ fontSize: '13px' }}>INVOICE</p>
                    <h5 className="fw-bold mb-1" style={{ color: goldColor }}>{invoice.number}</h5>
                    <p className="mb-0" style={{ fontSize: '12px' }}>Date: {new Date(invoice.date).toLocaleDateString()}</p>
                    {/* Social Media Links */}
                    <div className="d-flex justify-content-end gap-2 mt-2">
                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                            <InstagramIcon size={20} />
                        </a>
                        <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                            <WhatsAppIcon size={20} />
                        </a>
                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" title="Facebook">
                            <FacebookIcon size={20} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Customer & Driver Info */}
            <div className="mb-3 pb-2 border-bottom">
                <div className="row g-0">
                    <div className="col-6">
                        <p className="fw-bold mb-1" style={{ fontSize: '13px', color: goldColor }}>ISSUED TO:</p>
                        <p className="mb-1 fw-medium" style={{ fontSize: '14px' }}>{invoice.customer}</p>
                        <p className="mb-1 text-muted" style={{ fontSize: '12px' }}>
                            Guests: <strong>{invoice.adults ?? 0}</strong> adult(s), <strong>{invoice.children ?? 0}</strong> child(ren)
                        </p>
                        {(invoice.tripType || invoice.tripMode) && (
                            <div className="d-flex gap-2 align-items-center">
                                {invoice.tripType && (
                                    <span className="badge" style={{ 
                                        backgroundColor: invoice.tripType === 'Night' ? '#333' : '#FFA500', 
                                        color: invoice.tripType === 'Night' ? '#fff' : '#000',
                                        fontSize: '12px',
                                        padding: '4px 10px'
                                    }}>
                                        {invoice.tripType === 'Night' ? '🌙 Night' : '☀️ Day'}
                                    </span>
                                )}
                                {invoice.tripMode && (
                                    <span className="badge" style={{ 
                                        backgroundColor: invoice.tripMode === 'Private' ? '#007bff' : '#6c757d', 
                                        color: '#fff',
                                        fontSize: '12px',
                                        padding: '4px 10px'
                                    }}>
                                        {invoice.tripMode}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="col-6 text-end">
                        <p className="fw-bold mb-1" style={{ fontSize: '13px', color: goldColor }}>DRIVER:</p>
                        <p className="mb-1" style={{ fontSize: '14px' }}>{invoice.driver || "Not assigned"}</p>
                        {driverContact && (
                            <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>Contact: {driverContact}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Services Table */}
            <div className="mb-3">
                <p className="fw-bold mb-2" style={{ fontSize: '13px', color: goldColor }}>SERVICES</p>
                <div className="table-responsive px-0">
                    <table className="table table-bordered table-sm mb-0" style={{ fontSize: '13px' }}>
                        <thead style={{ backgroundColor: goldColor, color: 'white' }}>
                            <tr>
                                <th>Description</th>
                                <th className="text-end" style={{ width: "30%" }}>Service Charge</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serviceRows.map((service, index) => (
                                <tr key={service.id || index}>
                                    <td>{service.service}</td>
                                    <td className="text-end">{formatCurrency(service.discounted)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="table-light">
                            <tr>
                                <td className="text-end fw-medium">Service Total:</td>
                                <td className="text-end fw-medium">{formatCurrency(serviceTotal)}</td>
                            </tr>
                            <tr>
                                <td className="text-end fw-medium">VAT (5%):</td>
                                <td className="text-end fw-medium">{formatCurrency(vatTotal)}</td>
                            </tr>
                            <tr style={{ backgroundColor: goldColor, color: 'white' }}>
                                <td className="text-end fw-bold">Total:</td>
                                <td className="text-end fw-bold">{formatCurrency(subtotal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Expenses Table (if any) */}
            {invoice.expenses && invoice.expenses.length > 0 && (
                <div className="mb-3">
                    <p className="fw-bold mb-2" style={{ fontSize: '13px', color: goldColor }}>EXPENSES</p>
                    <div className="table-responsive px-0">
                        <table className="table table-bordered table-sm mb-0" style={{ fontSize: '13px' }}>
                            <thead className="table-light">
                                <tr>
                                    <th>Type</th>
                                    <th className="text-center">Pax</th>
                                    <th className="text-end">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.expenses.map((expense, index) => (
                                    <tr key={expense.id || index}>
                                        <td>{expense.type}</td>
                                        <td className="text-center">{expense.pax || '-'}</td>
                                        <td className="text-end">{formatCurrency(expense.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="table-light">
                                <tr>
                                    <td colSpan="2" className="text-end fw-medium">Total Expenses:</td>
                                    <td className="text-end fw-medium">{formatCurrency(expensesTotal)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment Info & Signature */}
            <div className="mb-3 mt-3 pt-3 border-top">
                <div className="row g-0">
                    <div className="col-6">
                        <p className="fw-bold mb-2" style={{ fontSize: '13px', color: goldColor }}>PAYMENT INFORMATION:</p>
                        <p className="mb-0" style={{ fontSize: '12px' }}>
                            Status: <span className="fw-bold">{invoice.status === 'paid' ? 'Paid' : invoice.status === 'partial' ? 'Partially Paid' : 'Unpaid'}</span>
                        </p>
                        <p className="mb-0" style={{ fontSize: '12px' }}>Amount Paid: {formatCurrency(invoice.paid)}</p>
                        <p className="mb-0" style={{ fontSize: '12px' }}>Balance Due: <strong>{formatCurrency(subtotal - invoice.paid)}</strong></p>
                    </div>
                    <div className="col-6 text-end">
                        <div className="mt-3 pt-3">
                            <div className="border-top pt-1 w-75 ms-auto" style={{ borderColor: goldColor }}>
                                <p className="mb-0" style={{ fontSize: '12px' }}>Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Policy Notice */}
            <div className="mt-3 p-2 border rounded" style={{ backgroundColor: '#fff9e6', borderColor: goldColor, fontSize: '11px' }}>
                <div className="row">
                    <div className="col-6">
                        <p className="mb-1 fw-bold" style={{ color: goldColor }}>Cancellation Policy:</p>
                        <p className="mb-0 text-muted">No cancellations. Only rescheduling is allowed to the next available date.</p>
                    </div>
                    <div className="col-6">
                        <p className="mb-1 fw-bold" style={{ color: goldColor }}>Card Payment Notice:</p>
                        <p className="mb-0 text-muted">A 5% Value-Added Charge applies to payments made via card.</p>
                    </div>
                </div>
            </div>

            {/* Footer with Social Icons */}
            <div className="text-center mt-4 pt-2 border-top" style={{ borderColor: goldColor }}>
                <p className="mb-1 fw-bold" style={{ fontSize: '13px', color: goldColor }}>Thank you for choosing Siyyad Khan Tourism!</p>
                <div className="d-flex justify-content-center gap-3 mb-1">
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-1 text-decoration-none" style={{ fontSize: '11px', color: '#E4405F' }}>
                        <InstagramIcon size={15} /> @sktuae
                    </a>
                    <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-1 text-decoration-none" style={{ fontSize: '11px', color: '#25D366' }}>
                        <WhatsAppIcon size={15} /> +971 55 752 3374
                    </a>
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-1 text-decoration-none" style={{ fontSize: '11px', color: '#1877F2' }}>
                        <FacebookIcon size={15} /> /sktuae
                    </a>
                </div>
                <p className="mb-0 text-muted" style={{ fontSize: '10px' }}>This is a computer-generated document.</p>
            </div>
        </div>
    );
};

export default PrintableInvoice;
