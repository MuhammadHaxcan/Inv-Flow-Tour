import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, DollarSign, Truck, Receipt, Edit2, Printer, Trash2, Mail, Check } from 'lucide-react';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';
import ExpenseForm from '../components/ExpenseForm';
import ServiceForm from '../components/ServiceForm';
import DriverModal from '../components/DriverModal';
import PrintableInvoice from '../components/PrintableInvoice';
import ConfirmationModal from '../components/ConfirmationModal';
import AlertModal from '../components/AlertModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { useData } from '../contexts/DataContext';
import { usePermissions } from '../hooks/usePermissions';
import 'bootstrap/dist/css/bootstrap.min.css';
import defaultLogoImg from '../assets/SiyyadKhanLogo.png';
import { printInvoice, calculateInvoiceVAT } from '../utils/printInvoice';

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
        sendInvoiceEmail,
        loadOpenInvoices, loadDrivers, loadServices, loadAccounts, loadExpenses, loadVendors, loadCompanySettings,
        loadingStates
    } = useData();

    // Permissions
    // Note: Removing services/expenses from invoices requires 'invoices.write', not 'invoices.delete'
    // 'invoices.delete' would be for deleting entire invoices (if such feature exists)
    const { 
        canWriteInvoices, 
        canReadInvoices
    } = usePermissions();

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
    const [driverNotesToAssign, setDriverNotesToAssign] = useState('');
    const [currentExpense, setCurrentExpense] = useState(null);
    const [currentService, setCurrentService] = useState(null);
    const [sendingEmail, setSendingEmail] = useState({}); // Track sending state per invoice
    const printableInvoiceRef = useRef(null);

    // Email confirmation modal
    const [emailConfirmModal, setEmailConfirmModal] = useState({ show: false, invoice: null });
    
    // Alert modal state
    const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info', title: '' });

    const showAlert = (message, type = 'info', title = '') => {
        setAlertModal({ show: true, message, type, title });
    };

    // Show loading state if data is being loaded
    const isLoading = loadingStates.openInvoices || loadingStates.drivers || loadingStates.services || loadingStates.accounts || loadingStates.expenses;

    // Show loading state
    if (isLoading) {
        return (
            <div className="content-wrapper">
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
        setDriverNotesToAssign(invoice.driverNotes || '');
        setShowDriverModal(true);
    };

    const openPrintModal = (invoice, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
        setShowPrintModal(true);
    };

    // Use unified VAT calculation from print utility
    const calculateTotalVAT = calculateInvoiceVAT;

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
            showAlert('Error saving expense: ' + error.message, 'error');
        }

        setCurrentExpense(null);
        setShowExpenseModal(false);
    };

    const requestDeleteExpense = (invoiceId, expense) => {
        setExpenseToDelete({ invoiceId, expenseId: expense.id, type: expense.type });
        setShowDeleteExpenseModal(true);
    };

    const confirmDeleteExpense = async () => {
        try {
            await removeExpense(expenseToDelete.invoiceId, expenseToDelete.expenseId);
        } catch (error) {
            console.error('Error deleting expense:', error);
            showAlert('Error deleting expense: ' + error.message, 'error');
        }
        setShowDeleteExpenseModal(false);
        setExpenseToDelete({ invoiceId: null, expenseId: null, type: '' });
    };

    // Update this function to handle service updates correctly
    const handleAddOrUpdateService = async (service, rate) => {
        if (!currentInvoice) return;

        try {
            // Create service data object
            const serviceData = {
                service,
                rate: parseFloat(rate)
            };

            if (currentService) {
                // For editing existing service, preserve the ID
                await addInvoiceService(currentInvoice.id, {
                    ...serviceData,
                    id: currentService.id // Preserve the original service ID
                });
            } else {
                // For new services
                await addInvoiceService(currentInvoice.id, serviceData);
            }
        } catch (error) {
            console.error('Error saving service:', error);
            showAlert('Error saving service: ' + error.message, 'error');
        }
        
        setCurrentService(null);
        setShowServiceModal(false);
    };

    const requestDeleteService = (invoiceId, service) => {
        // Find the invoice
        const invoice = openInvoices.find(inv => inv.id === invoiceId);
        if (invoice && invoice.services.length <= 1) {
            showAlert("Cannot delete the only service. At least one service must remain.", 'warning');
            return;
        }
        setServiceToDelete({ invoiceId, serviceId: service.id, service: service.service });
        setShowDeleteServiceModal(true);
    };

    const confirmDeleteService = async () => {
        try {
            await removeInvoiceService(serviceToDelete.invoiceId, serviceToDelete.serviceId);
        } catch (error) {
            console.error('Error deleting service:', error);
            showAlert('Error deleting service: ' + error.message, 'error');
        }
        setShowDeleteServiceModal(false);
        setServiceToDelete({ invoiceId: null, serviceId: null, service: '' });
    };

    // Handle print using unified utility
    const handleDirectPrint = (invoice, e) => {
        e && e.stopPropagation();
        
        // Get default logo source
        const defaultLogoSrc = defaultLogoImg.startsWith('http') 
            ? defaultLogoImg 
            : window.location.origin + defaultLogoImg;
        
        printInvoice(invoice, {
            companySettings,
            drivers,
            defaultLogoSrc
        });
    };

    // Handle send email
    const handleSendEmail = (invoice, e) => {
        e && e.stopPropagation();
        
        if (!invoice.customerEmail) {
            showAlert('Customer does not have an email address. Please update customer details first.', 'warning');
            return;
        }

        setEmailConfirmModal({ show: true, invoice });
    };

    const confirmSendEmail = async () => {
        const invoice = emailConfirmModal.invoice;
        setEmailConfirmModal({ show: false, invoice: null });
        
        setSendingEmail(prev => ({ ...prev, [invoice.id]: true }));
        
        try {
            await sendInvoiceEmail(invoice.id);
            showAlert(`Invoice sent successfully to ${invoice.customerEmail}`, 'success');
        } catch (error) {
            console.error('Error sending email:', error);
            showAlert('Failed to send email: ' + (error.message || 'Unknown error'), 'error');
        } finally {
            setSendingEmail(prev => ({ ...prev, [invoice.id]: false }));
        }
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
                    <div className="card-header bg-light py-3">
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
                                        <th className="px-4 py-3 text-center">Email</th>
                                        <th className="px-4 py-3 text-end">Outstanding</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {openInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">
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
                                                                {invoice.driver ? (
                                                                    <div>
                                                                        <div className="fw-medium">{invoice.driver}</div>
                                                                        {invoice.driverNotes && (
                                                                            <div className="text-muted small" style={{ maxWidth: '150px' }} title={invoice.driverNotes}>
                                                                                {invoice.driverNotes.length > 30 
                                                                                    ? invoice.driverNotes.substring(0, 30) + '...' 
                                                                                    : invoice.driverNotes}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-warning">Not assigned</span>
                                                                )}
                                                            </div>
                                                            {canWriteInvoices && (
                                                                <button
                                                                    onClick={(e) => openDriverModal(invoice, e)}
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    title={invoice.driver ? 'Change Driver' : 'Assign Driver'}
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {invoice.emailSentAt ? (
                                                            <div className="d-flex flex-column align-items-center">
                                                                <span className="badge bg-success d-flex align-items-center gap-1">
                                                                    <Check size={12} />
                                                                    Sent
                                                                </span>
                                                                <small className="text-muted" style={{ fontSize: '10px' }}>
                                                                    {new Date(invoice.emailSentAt).toLocaleDateString()}
                                                                </small>
                                                            </div>
                                                        ) : canWriteInvoices ? (
                                                            <button
                                                                onClick={(e) => handleSendEmail(invoice, e)}
                                                                className={`btn btn-sm ${invoice.customerEmail ? 'btn-outline-info' : 'btn-outline-secondary'}`}
                                                                disabled={sendingEmail[invoice.id] || !invoice.customerEmail}
                                                                title={invoice.customerEmail ? `Send to ${invoice.customerEmail}` : 'No email address'}
                                                            >
                                                                {sendingEmail[invoice.id] ? (
                                                                    <span className="spinner-border spinner-border-sm" role="status" />
                                                                ) : (
                                                                    <Mail size={14} />
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        <div className="d-flex flex-column align-items-end">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <span className="fw-bold">
                                                                    {formatCurrency(invoice.total - invoice.paid)}
                                                                </span>
                                                                {canReadInvoices && (
                                                                    <button
                                                                        onClick={e => handleDirectPrint(invoice, e)}
                                                                        className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                                        title="Print Invoice"
                                                                    >
                                                                        <Printer size={14} />
                                                                    </button>
                                                                )}
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
                                                        <td colSpan="5" className="p-0 border-0">
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
                                                                        {canWriteInvoices && (
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
                                                                        )}
                                                                    </div>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-sm table-striped">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Service</th>
                                                                                    <th className="text-end">Amount (incl. VAT)</th>
                                                                                    {canWriteInvoices && (
                                                                                        <th className="text-center" style={{width: "120px"}}>Actions</th>
                                                                                    )}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.services.map(service => (
                                                                                    <tr key={service.id}>
                                                                                        <td>{service.service}</td>
                                                                                        <td className="text-end">{formatCurrency(service.rate)}</td>
                                                                                        {canWriteInvoices && (
                                                                                            <td className="text-center">
                                                                                                <div className="d-flex justify-content-center gap-2">
                                                                                                    {canWriteInvoices && (
                                                                                                        <button
                                                                                                            onClick={e => openServiceModal(invoice, service, e)}
                                                                                                            className="btn btn-sm btn-outline-primary"
                                                                                                            title="Edit Service"
                                                                                                        >
                                                                                                            <Edit2 size={14} />
                                                                                                        </button>
                                                                                                    )}
                                                                                                    {canWriteInvoices && invoice.services.length > 1 && (
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
                                                                                        )}
                                                                                    </tr>
                                                                                ))}
                                                                                {invoice.services.length === 0 && (
                                                                                    <tr>
                                                                                        <td colSpan={canWriteInvoices ? "3" : "2"} className="text-center text-muted">No services added</td>
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
                                                                        {canWriteInvoices && (
                                                                            <div className="d-flex gap-2">
                                                                                <button
                                                                                    onClick={e => openExpenseModal(invoice, null, e)}
                                                                                    className="btn btn-sm btn-dark d-flex align-items-center gap-1"
                                                                                >
                                                                                    <Plus size={14} />
                                                                                    Add Expense
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-sm table-striped">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Type</th>
                                                                                    <th>Date</th>
                                                                                    <th className="text-center">Pax</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                    {canWriteInvoices && (
                                                                                        <th className="text-center">Actions</th>
                                                                                    )}
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
                                                                                            {canWriteInvoices && (
                                                                                                <td className="text-center">
                                                                                                    <div className="d-flex justify-content-center gap-2">
                                                                                                        {canWriteInvoices && (
                                                                                                            <button
                                                                                                                onClick={e => openExpenseModal(invoice, exp, e)}
                                                                                                                className="btn btn-sm btn-outline-primary"
                                                                                                                title="Edit Expense"
                                                                                                            >
                                                                                                                <Edit2 size={14} />
                                                                                                            </button>
                                                                                                        )}
                                                                                                        {canWriteInvoices && (
                                                                                                            <button
                                                                                                                onClick={e => requestDeleteExpense(invoice.id, exp)}
                                                                                                                className="btn btn-sm btn-outline-danger"
                                                                                                                title="Delete Expense"
                                                                                                            >
                                                                                                                <Trash2 size={14} />
                                                                                                            </button>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </td>
                                                                                            )}
                                                                                        </tr>
                                                                                ))}
                                                                                {invoice.expenses.length === 0 && (
                                                                                    <tr>
                                                                                        <td colSpan={canWriteInvoices ? "5" : "4"} className="text-center text-muted">No expenses added</td>
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
                                        <td colSpan="4" className="px-4 py-3 text-end">Total:</td>
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
                onSave={(driver, notes) => {
                    setDriverToAssign(driver);
                    setDriverNotesToAssign(notes || '');
                    assignDriver(currentInvoice.id, driver, notes);
                    setShowDriverModal(false);
                }}
                drivers={drivers}
                currentDriver={driverToAssign}
                currentNotes={driverNotesToAssign}
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

            {/* Delete Expense Confirmation Modal */}
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

            {/* Delete Service Confirmation Modal */}
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

            {/* Email Confirmation Modal */}
            <ConfirmationModal
                show={emailConfirmModal.show}
                onClose={() => setEmailConfirmModal({ show: false, invoice: null })}
                onConfirm={confirmSendEmail}
                title="Send Invoice Email"
                message={`Send invoice ${emailConfirmModal.invoice?.number} to ${emailConfirmModal.invoice?.customerEmail}?`}
                confirmButtonText="Send Email"
                type="confirm"
            />

            {/* Alert Modal */}
            <AlertModal
                show={alertModal.show}
                onClose={() => setAlertModal({ ...alertModal, show: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </>
    );
};

export default OpenInvoices;
