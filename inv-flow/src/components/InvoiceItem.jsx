import React, { memo } from 'react';
import { ChevronDown, ChevronUp, Plus, DollarSign, Truck, Receipt, Edit2, Printer, Trash2, Mail, Check, Calendar, Users } from 'lucide-react';

const InvoiceItem = ({
    invoice,
    isExpanded,
    onToggleExpand,
    onPaymentClick,
    onExpenseClick,
    onServiceClick,
    onDriverClick,
    onPrintClick,
    onEmailClick,
    canWriteInvoices
}) => {
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

    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
    };

    return (
        <div className="list-group-item border-0 border-bottom">
            {/* Invoice Header */}
            <div
                className="d-flex justify-content-between align-items-center p-3 cursor-pointer"
                onClick={onToggleExpand}
                style={{ cursor: 'pointer' }}
            >
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        <span className="fw-medium text-primary">#{invoice.number}</span>
                    </div>
                    <div className="d-flex flex-column">
                        <span className="fw-medium">{invoice.customer}</span>
                        <small className="text-muted">
                            {new Date(invoice.date).toLocaleDateString()} • {invoice.driver || 'No driver'}
                        </small>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                        <div className="fw-medium">{formatCurrency(invoice.total)}</div>
                        <small className={`badge ${getStatusColor(invoice.status)}`}>
                            {getStatusText(invoice.status)}
                        </small>
                    </div>

                    {canWriteInvoices && (
                        <div className="d-flex gap-1">
                            <button
                                className="btn btn-sm btn-outline-success"
                                onClick={(e) => onPaymentClick(e)}
                                title="Add Payment"
                            >
                                <DollarSign size={14} />
                            </button>
                            <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={(e) => onExpenseClick(e)}
                                title="Add Expense"
                            >
                                <Receipt size={14} />
                            </button>
                            <button
                                className="btn btn-sm btn-outline-info"
                                onClick={(e) => onServiceClick(e)}
                                title="Add Service"
                            >
                                <Plus size={14} />
                            </button>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={(e) => onDriverClick(e)}
                                title="Assign Driver"
                            >
                                <Truck size={14} />
                            </button>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={(e) => onPrintClick(e)}
                                title="Print Invoice"
                            >
                                <Printer size={14} />
                            </button>
                            <button
                                className="btn btn-sm btn-outline-dark"
                                onClick={(e) => onEmailClick(e)}
                                title="Send Email"
                            >
                                <Mail size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-3 pb-3">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <h6 className="fw-bold mb-2">Trip Details</h6>
                            <div className="small">
                                <p className="mb-1"><strong>Driver:</strong> {invoice.driver || 'Not assigned'}</p>
                                {invoice.driverNotes && <p className="mb-1"><strong>Notes:</strong> {invoice.driverNotes}</p>}
                                <p className="mb-1"><strong>Trip Type:</strong> {invoice.tripType || 'Not specified'}</p>
                                <p className="mb-1"><strong>Trip Mode:</strong> {invoice.tripMode || 'Not specified'}</p>
                                <p className="mb-1"><strong>Adults:</strong> {invoice.adults || 0}</p>
                                <p className="mb-1"><strong>Children:</strong> {invoice.children || 0}</p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <h6 className="fw-bold mb-2">Customer Details</h6>
                            <div className="small">
                                <p className="mb-1"><strong>Name:</strong> {invoice.customer}</p>
                                {invoice.customerEmail && <p className="mb-1"><strong>Email:</strong> {invoice.customerEmail}</p>}
                                {invoice.customerPhone && <p className="mb-1"><strong>Phone:</strong> {invoice.customerPhone}</p>}
                            </div>
                        </div>

                        {invoice.services && invoice.services.length > 0 && (
                            <div className="col-12">
                                <h6 className="fw-bold mb-2">Services</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm table-borderless">
                                        <thead>
                                            <tr>
                                                <th className="small">Service</th>
                                                <th className="small text-end">Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice.services.map((service, index) => (
                                                <tr key={index}>
                                                    <td className="small">{service.service}</td>
                                                    <td className="small text-end">{formatCurrency(service.rate)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {invoice.expenses && invoice.expenses.length > 0 && (
                            <div className="col-12">
                                <h6 className="fw-bold mb-2">Expenses</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm table-borderless">
                                        <thead>
                                            <tr>
                                                <th className="small">Type</th>
                                                <th className="small">Vendor</th>
                                                <th className="small text-end">Amount</th>
                                                <th className="small text-center">Paid</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice.expenses.map((expense, index) => (
                                                <tr key={index}>
                                                    <td className="small">{expense.type}</td>
                                                    <td className="small">{expense.vendorName || 'N/A'}</td>
                                                    <td className="small text-end">{formatCurrency(expense.amount)}</td>
                                                    <td className="small text-center">
                                                        {expense.isPaid ? <Check size={14} className="text-success" /> : 'No'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {invoice.payments && invoice.payments.length > 0 && (
                            <div className="col-12">
                                <h6 className="fw-bold mb-2">Payments</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm table-borderless">
                                        <thead>
                                            <tr>
                                                <th className="small">Date</th>
                                                <th className="small">Method</th>
                                                <th className="small">Reference</th>
                                                <th className="small text-end">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice.payments.map((payment, index) => (
                                                <tr key={index}>
                                                    <td className="small">{new Date(payment.date).toLocaleDateString()}</td>
                                                    <td className="small">{payment.method}</td>
                                                    <td className="small">{payment.reference || 'N/A'}</td>
                                                    <td className="small text-end">{formatCurrency(payment.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(InvoiceItem, (prevProps, nextProps) => {
    // Custom comparison function for performance
    return (
        prevProps.invoice.id === nextProps.invoice.id &&
        prevProps.invoice.total === nextProps.invoice.total &&
        prevProps.invoice.paid === nextProps.invoice.paid &&
        prevProps.invoice.status === nextProps.invoice.status &&
        prevProps.isExpanded === nextProps.isExpanded &&
        prevProps.canWriteInvoices === nextProps.canWriteInvoices
    );
});