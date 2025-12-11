import React, { useState, useEffect, memo, useMemo } from 'react';
import { ChevronDown, ChevronUp, Plus, DollarSign, Truck, Receipt, Edit2, Printer, Trash2, Mail, Check, FileText } from 'lucide-react';
import InvoiceItem from './InvoiceItem';

const InvoiceList = memo(({
    invoices,
    onToggleExpand,
    expandedInvoice,
    onPaymentClick,
    onExpenseClick,
    onServiceClick,
    onDriverClick,
    onPrintClick,
    onEmailClick,
    canWriteInvoices
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    // Memoized filtered invoices for performance
    const filteredInvoices = useMemo(() => {
        let filtered = [...invoices];

        // Filter by search term
        const term = searchTerm.trim().toLowerCase();
        if (term) {
            filtered = filtered.filter(invoice =>
                invoice.number?.toLowerCase().includes(term) ||
                invoice.customer?.toLowerCase().includes(term) ||
                invoice.driver?.toLowerCase().includes(term) ||
                invoice.email?.toLowerCase().includes(term)
            );
        }

        // Filter by date range
        if (dateRange.startDate) {
            const startDate = new Date(dateRange.startDate);
            filtered = filtered.filter(invoice => {
                const invoiceDate = new Date(invoice.date);
                return invoiceDate >= startDate;
            });
        }

        if (dateRange.endDate) {
            const endDate = new Date(dateRange.endDate);
            endDate.setHours(23, 59, 59); // Include the entire end date
            filtered = filtered.filter(invoice => {
                const invoiceDate = new Date(invoice.date);
                return invoiceDate <= endDate;
            });
        }

        return filtered;
    }, [invoices, searchTerm, dateRange]);

    return (
        <div className="card shadow">
            <div className="card-header bg-light py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <h3 className="h5 fw-bold text-primary mb-0">Open Invoices</h3>
                    <p className="text-muted small mb-0">
                        {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="border-bottom bg-white py-3 px-4">
                <div className="row align-items-end g-3">
                    <div className="col-md-3">
                        <label className="form-label small fw-medium mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control form-control-sm"
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-medium mb-1">From Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="form-control form-control-sm"
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-medium mb-1">To Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="form-control form-control-sm"
                        />
                    </div>
                    <div className="col-md-auto">
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                                setSearchTerm('');
                                setDateRange({ startDate: '', endDate: '' });
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoice List */}
            <div className="card-body p-0">
                {filteredInvoices.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="text-muted">
                            <FileText size={48} className="mb-3 opacity-50" />
                            <p>No open invoices found</p>
                            {searchTerm || dateRange.startDate || dateRange.endDate ? (
                                <small>Try adjusting your search or date filters</small>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="list-group list-group-flush">
                        {filteredInvoices.map(invoice => (
                            <InvoiceItem
                                key={invoice.id}
                                invoice={invoice}
                                isExpanded={expandedInvoice === invoice.id}
                                onToggleExpand={() => onToggleExpand(invoice.id)}
                                onPaymentClick={(e) => onPaymentClick(invoice, e)}
                                onExpenseClick={(e) => onExpenseClick(invoice, e)}
                                onServiceClick={(e) => onServiceClick(invoice, e)}
                                onDriverClick={(e) => onDriverClick(invoice, e)}
                                onPrintClick={(e) => onPrintClick(invoice, e)}
                                onEmailClick={(e) => onEmailClick(invoice, e)}
                                canWriteInvoices={canWriteInvoices}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default InvoiceList;
