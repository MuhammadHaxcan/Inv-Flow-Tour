import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

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

    return (
        <div className="printable-invoice px-0 py-3" id="printable-invoice"> {/* Further reduced padding */}
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="fw-bold text-primary mb-1">Invoice</h2>
                    <p className="mb-0 text-muted small">INV-FLOW TRANSPORT LLC</p>
                    <p className="mb-0 text-muted small">Dubai, UAE</p>
                    <p className="mb-0 text-muted small">info@inv-flow.ae | +971-4-123-4567</p>
                </div>
                <div className="text-end">
                    <h3 className="fw-bold mb-1">{invoice.number}</h3>
                    <p className="mb-0 small">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Customer & Driver Info */}
            <div className="mb-3 border-bottom pb-2">
                <div className="row g-0"> {/* Using row with no gutters to ensure side-by-side display */}
                    <div className="col-6">
                        <h5 className="fw-bold mb-1 small">Bill To:</h5>
                        <p className="mb-1 fw-medium">{invoice.customer}</p>
                        <p className="mb-0 text-muted small">Number of persons: {invoice.persons}</p>
                    </div>
                    <div className="col-6 text-end">
                        <h5 className="fw-bold mb-1 small">Driver:</h5>
                        <p className="mb-1">{invoice.driver || "Not assigned"}</p>
                        {driverContact && (
                            <p className="mb-0 text-muted small">Contact: {driverContact}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Services Table */}
            <div className="mb-3">
                <h5 className="fw-bold mb-2 small">Services</h5>
                <div className="table-responsive px-0">
                    <table className="table table-bordered table-sm">
                        <thead className="table-light">
                            <tr>
                                <th>Description</th>
                                <th className="text-end" style={{width: "30%"}}>Service Charge</th>
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
                        <tfoot>
                            <tr>
                                <th className="text-end">Service Total:</th>
                                <th className="text-end">{formatCurrency(serviceTotal)}</th>
                            </tr>
                            <tr>
                                <th className="text-end">VAT Total:</th>
                                <th className="text-end">{formatCurrency(vatTotal)}</th>
                            </tr>
                            <tr>
                                <th className="text-end">Subtotal:</th>
                                <th className="text-end">{formatCurrency(subtotal)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Payment Info & Signature */}
            <div className="mb-3 mt-4 pt-4 border-top">
                <div className="row g-0">
                    <div className="col-6">
                        <h5 className="fw-bold mb-1 small">Payment Information:</h5>
                        <p className="mb-0 small">Status: <span className="fw-medium">{invoice.status === 'paid' ? 'Paid' : invoice.status === 'partial' ? 'Partially Paid' : 'Unpaid'}</span></p>
                        <p className="mb-0 small">Amount Paid: {formatCurrency(invoice.paid)}</p>
                        <p className="mb-0 small">Balance Due: {formatCurrency(subtotal - invoice.paid)}</p>
                    </div>
                    <div className="col-6 text-end">
                        <div className="mt-4 pt-3">
                            <div className="border-top pt-1 w-75 ms-auto">
                                <p className="mb-0 small">Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-muted small mt-4">
                <p className="mb-0">Thank you for your business!</p>
                <p className="mb-0">This is a computer-generated document and does not require a signature.</p>
            </div>
        </div>
    );
};

export default PrintableInvoice;