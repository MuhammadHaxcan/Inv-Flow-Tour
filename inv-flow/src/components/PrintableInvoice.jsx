import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const PrintableInvoice = ({ invoice }) => {
    if (!invoice) return null;

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
        <div className="printable-invoice p-4" id="printable-invoice">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-primary">Invoice</h2>
                    <p className="mb-0 text-muted">INV-FLOW TRANSPORT LLC</p>
                    <p className="mb-0 text-muted">Dubai, UAE</p>
                    <p className="mb-0 text-muted">info@inv-flow.ae | +971-4-123-4567</p>
                </div>
                <div className="text-end">
                    <h3 className="fw-bold">{invoice.number}</h3>
                    <p className="mb-0">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="row mb-4 border-bottom pb-3">
                <div className="col-md-6">
                    <h5 className="fw-bold">Bill To:</h5>
                    <p className="mb-1 fw-medium">{invoice.customer}</p>
                    <p className="mb-0 text-muted">Number of persons: {invoice.persons}</p>
                </div>
                <div className="col-md-6 text-md-end">
                    <h5 className="fw-bold">Driver:</h5>
                    <p className="mb-0">{invoice.driver || "Not assigned"}</p>
                    {driverContact && (
                        <p className="mb-0 text-muted">Contact: {driverContact}</p>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <h5 className="fw-bold mb-3">Services</h5>
                <table className="table table-bordered">
                    <thead className="table-light">
                        <tr>
                            <th>Description</th>
                            <th className="text-end">Service Charge</th>
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

            <div className="row mb-4 mt-5 pt-5 border-top">
                <div className="col-md-6">
                    <h5 className="fw-bold">Payment Information:</h5>
                    <p className="mb-0">Status: <span className="fw-medium">{invoice.status === 'paid' ? 'Paid' : invoice.status === 'partial' ? 'Partially Paid' : 'Unpaid'}</span></p>
                    <p className="mb-0">Amount Paid: {formatCurrency(invoice.paid)}</p>
                    <p className="mb-0">Balance Due: {formatCurrency(subtotal - invoice.paid)}</p>
                </div>
                <div className="col-md-6 text-md-end">
                    <div className="mt-5 pt-5">
                        <div className="border-top pt-2 w-50 ms-auto">
                            <p className="mb-0">Authorized Signature</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center text-muted small">
                <p className="mb-0">Thank you for your business!</p>
                <p className="mb-0">This is a computer-generated document and does not require a signature.</p>
            </div>
        </div>
    );
};

export default PrintableInvoice;