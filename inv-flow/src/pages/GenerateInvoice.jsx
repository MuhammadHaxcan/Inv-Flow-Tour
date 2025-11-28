import React, { useState, useEffect } from 'react';
import { Plus, User, DollarSign, Receipt, Truck, Edit2, Trash2, Calendar, X } from 'lucide-react';
import Modal from '../components/Modal';
import CustomerModal from '../components/CustomerModal';
import ServiceForm from '../components/ServiceForm';
import PaymentForm from '../components/PaymentForm';
import ExpenseForm from '../components/ExpenseForm';
import DriverModal from '../components/DriverModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import AlertModal from '../components/AlertModal';
import SearchableSelect from '../components/SearchableSelect';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const GenerateInvoice = () => {
    const navigate = useNavigate();

    // Use data context
    const {
        customers, addCustomer,
        drivers, services, accounts, expenses, vendors,
        nextInvoiceNumber, generateInvoice,
        loadCustomers, loadDrivers, loadServices, loadAccounts, loadExpenses, loadVendors, loadNextInvoiceNumber,
        loadingStates
    } = useData();

    // Load only needed data when component mounts
    useEffect(() => {
        loadCustomers();
        loadDrivers();
        loadServices();
        loadAccounts();
        loadExpenses();
        loadVendors();
        loadNextInvoiceNumber();
    }, [loadCustomers, loadDrivers, loadServices, loadAccounts, loadExpenses, loadVendors, loadNextInvoiceNumber]);

    // Invoice state
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [currentExpense, setCurrentExpense] = useState(null); // Track current expense for editing
    const [showDeleteExpenseModal, setShowDeleteExpenseModal] = useState(false);
    const [expenseToDeleteIndex, setExpenseToDeleteIndex] = useState(null);
    
    // Alert modal state
    const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'info', title: '' });

    const showAlert = (message, type = 'info', title = '') => {
        setAlertModal({ show: true, message, type, title });
    };

    // Get today's date in a consistent format
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; // YYYY-MM-DD format for date inputs
    const displayDate = today.toLocaleString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' });

    // Form state
    const [serviceDate, setServiceDate] = useState(formattedToday);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [assignedDriver, setAssignedDriver] = useState('');
    const [driverNotes, setDriverNotes] = useState('');
    const [accommodation, setAccommodation] = useState('');
    const [invoiceServices, setInvoiceServices] = useState([{ service: '', rate: '' }]);
    const [invoiceExpenses, setInvoiceExpenses] = useState([]);
    const [payments, setPayments] = useState([]);

    // Add this effect to keep currentInvoice updated
    useEffect(() => {
        const invoice = {
            customer: selectedCustomer,
            driver: assignedDriver,
            serviceDate,
            persons: accommodation,
            services: invoiceServices,
            expenses: invoiceExpenses,
            payments: payments,
            paid: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
            total: calculateInvoiceTotal()
        };
        setCurrentInvoice(invoice);
    }, [selectedCustomer, assignedDriver, serviceDate, accommodation, invoiceServices, invoiceExpenses, payments]);

    const expenseTypes = expenses.map(expense => expense.name);

    const addService = () => {
        setInvoiceServices([...invoiceServices, { service: '', rate: '' }]);
    };

    const removeService = (index) => {
        const newServices = invoiceServices.filter((_, i) => i !== index);
        setInvoiceServices(newServices);
    };

    // Updated to use vatIncluded instead of charge
    const updateService = (index, field, value) => {
        const newServices = [...invoiceServices];
        newServices[index][field] = value;

        if (field === 'service') {
            const selectedService = services.find(s => s.name === value);
            if (selectedService) {
                // Use vatIncluded for the rate to include VAT
                newServices[index].rate = selectedService.vatIncluded;
            }
        }

        setInvoiceServices(newServices);
    };

    const addExpense = () => {
        openExpenseModal();
    };

    const removeExpense = (index) => {
        const newExpenses = invoiceExpenses.filter((_, i) => i !== index);
        setInvoiceExpenses(newExpenses);
    };

    const requestDeleteExpense = (index) => {
        setExpenseToDeleteIndex(index);
        setShowDeleteExpenseModal(true);
    };

    const confirmDeleteExpense = () => {
        if (expenseToDeleteIndex !== null) {
            removeExpense(expenseToDeleteIndex);
        }
        setExpenseToDeleteIndex(null);
        setShowDeleteExpenseModal(false);
    };

    // Update the calculation functions
    const calculateSubtotal = () => {
        return invoiceServices.reduce((sum, s) => sum + (parseFloat(s.rate) || 0), 0);
    };

    const calculateExpensesTotal = () => {
        return invoiceExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    };

    const calculateVAT = () => {
        // VAT is already included in the rate, so we're just showing the VAT portion for display
        return invoiceServices.reduce((sum, s) => {
            const rate = parseFloat(s.rate) || 0;
            // Calculate VAT at 5%
            return sum + (rate * 0.05 / 1.05); // Extract VAT from VAT-included price
        }, 0);
    };

    const calculateInvoiceTotal = () => {
        return calculateSubtotal(); // Total already includes VAT
    };

    const calculateNetAmount = () => {
        return calculateInvoiceTotal() - calculateExpensesTotal();
    };

    const handleAddCustomer = async (formData) => {
        try {
            const newCustomer = await addCustomer(formData);
            setSelectedCustomer(newCustomer.name);
            setShowCustomerModal(false);
        } catch (error) {
            showAlert('Error adding customer: ' + error.message, 'error');
        }
    };

    const handleAddOrUpdateExpense = (type, amount, date, description, vendorName, pax) => {
        const expenseData = {
            type,
            amount: parseFloat(amount),
            date,
            description,
            vendorName,
            pax: pax ? parseInt(pax) : null
        };

        if (currentExpense) {
            // Update existing expense
            setInvoiceExpenses(invoiceExpenses.map(exp => 
                exp.id === currentExpense.id 
                    ? { ...exp, ...expenseData }
                    : exp
            ));
        } else {
            // Add new expense
            setInvoiceExpenses([...invoiceExpenses, { id: Date.now(), ...expenseData }]);
        }
        
        setCurrentExpense(null);
        setShowExpenseModal(false);
    };

    const openExpenseModal = (expense) => {
        if (expense) {
            // If an expense is passed, we're editing, so pre-fill the form
            setCurrentExpense(expense);
        } else {
            // Otherwise, it's a new expense
            setCurrentExpense(null);
        }
        setShowExpenseModal(true);
    };

    const handleAddService = (service, rate) => {
        // Find the service to get the VAT included rate
        const serviceInfo = services.find(s => s.name === service);
        const vatIncludedRate = serviceInfo ? serviceInfo.vatIncluded : rate;

        const newService = {
            service,
            rate: vatIncludedRate // Use VAT included rate
        };
        setInvoiceServices([...invoiceServices, newService]);
        setShowServiceModal(false);
    };

    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
    };

    // Updated to handle form submission and save invoice with only service and pax as mandatory
    const handleSaveInvoice = async () => {
        if (!selectedCustomer) {
            showAlert('Please select a customer', 'warning');
            return;
        }

        // Validate that at least one service is fully filled
        const validServices = invoiceServices.filter(s => s.service && s.rate);
        if (validServices.length === 0) {
            showAlert('Please add at least one service', 'warning');
            return;
        }

        // Validate person accommodation
        if (!accommodation) {
            showAlert('Please enter number of persons', 'warning');
            return;
        }

        // Find customer ID
        const customer = customers.find(c => c.name === selectedCustomer);
        if (!customer) {
            showAlert('Customer not found', 'error');
            return;
        }

        // Find driver ID if driver is selected
        const driver = assignedDriver ? drivers.find(d => d.name === assignedDriver) : null;

        // Transform services to API format
        const servicesData = validServices.map(s => {
            const service = services.find(svc => svc.name === s.service);
            return {
                serviceId: service?.id || 0,
                rate: parseFloat(s.rate) || 0
            };
        }).filter(s => s.serviceId > 0);

        // Transform expenses to API format
        const expensesData = invoiceExpenses.map(exp => {
            const expenseType = expenses.find(e => e.name === exp.type);
            const vendor = exp.vendorName ? vendors.find(v => v.name === exp.vendorName) : null;
            return {
                expenseTypeId: expenseType?.id || 0,
                amount: parseFloat(exp.amount) || 0,
                date: exp.date || serviceDate,
                vendorId: vendor?.id || null,
                pax: exp.pax || null
            };
        }).filter(e => e.expenseTypeId > 0);

        // Transform payments to API format
        const paymentsData = payments.map(pay => {
            const account = accounts.find(a => a.name === pay.method);
            return {
                accountId: account?.id || 0,
                amount: parseFloat(pay.amount) || 0,
                date: pay.date || serviceDate,
                reference: pay.reference || '',
                notes: pay.notes || ''
            };
        }).filter(p => p.accountId > 0);

        const invoiceData = {
            date: serviceDate,
            customerId: customer.id,
            driverId: driver?.id || null,
            driverNotes: driverNotes || null,
            persons: parseInt(accommodation) || 1,
            services: servicesData,
            expenses: expensesData,
            payments: paymentsData
        };

        try {
            await generateInvoice(invoiceData);
            navigate('/open-invoices');
        } catch (error) {
            showAlert('Error generating invoice: ' + error.message, 'error');
        }
    };

    // Show loading state if data is being loaded
    const isLoading = loadingStates.customers || loadingStates.drivers || loadingStates.services || 
                     loadingStates.accounts || loadingStates.expenses || loadingStates.vendors || loadingStates.nextInvoiceNumber;

    if (isLoading) {
        return (
            <div className="content-wrapper">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading invoice data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="content-wrapper">
                <div className="card shadow">
                    <div className="card-header bg-light py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h3 className="h5 fw-bold text-primary mb-0">Generate Invoice</h3>
                            <div className="d-flex align-items-center gap-3">
                                <div className="form-group mb-0">
                                    <label className="small text-muted mb-1">Invoice Number</label>
                                    <input
                                        type="text"
                                        value={nextInvoiceNumber}
                                        className="form-control form-control-sm bg-light"
                                        disabled
                                        style={{ minWidth: "150px" }}
                                    />
                                </div>
                                <div className="form-group mb-0">
                                    <label className="small text-muted mb-1">Invoice Date</label>
                                    <input
                                        type="text"
                                        value={displayDate}
                                        className="form-control form-control-sm bg-light"
                                        disabled
                                        style={{ minWidth: "150px" }}
                                    />
                                </div>
                                <div className="form-group mb-0">
                                    <label className="small text-muted mb-1">Created By</label>
                                    <input
                                        type="text"
                                        value="Admin User"
                                        className="form-control form-control-sm bg-light"
                                        disabled
                                        style={{ minWidth: "120px" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-3">
                        <form>
                            {/* First row - Customer and Service Date */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-medium">Customer Information <span className="text-danger">*</span></label>
                                    <div className="d-flex gap-2">
                                        <div className="flex-grow-1">
                                            <SearchableSelect
                                                value={selectedCustomer}
                                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                                options={customers.map(customer => ({ value: customer.name, label: customer.name }))}
                                                placeholder="Select Customer"
                                                className={`${!selectedCustomer && 'is-invalid'}`}
                                                required
                                                size="sm"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowCustomerModal(true)}
                                            className="btn btn-sm btn-dark px-2"
                                            title="Add New Customer"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label small fw-medium">Service Date</label>
                                    <div className="input-group input-group-sm">
                                        <input
                                            type="date"
                                            value={serviceDate}
                                            onChange={(e) => setServiceDate(e.target.value)}
                                            className="form-control"
                                        />
                                        <span className="input-group-text">
                                            <Calendar size={16} className="text-muted" />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Driver and Accommodation */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-medium">Driver (Optional)</label>
                                    <div>
                                        {assignedDriver ? (
                                            <div className="p-2 bg-light border rounded d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-2">
                                                    <User size={16} className="text-secondary" />
                                                    <span className="small">
                                                        {assignedDriver}
                                                    </span>
                                                </div>
                                                <div className="d-flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDriverModal(true)}
                                                        className="btn btn-sm btn-outline-secondary py-0 px-1"
                                                        title="Change Driver"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAssignedDriver('');
                                                            setDriverNotes('');
                                                        }}
                                                        className="btn btn-sm btn-outline-danger py-0 px-1"
                                                        title="Remove Driver"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setShowDriverModal(true)}
                                                className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                                            >
                                                <Truck size={16} />
                                                Assign Driver
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label small fw-medium">Person Accommodation <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={accommodation}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || /^\d+$/.test(val)) {
                                                setAccommodation(val);
                                            }
                                        }}
                                        placeholder="Number of persons"
                                        className="form-control form-control-sm"
                                    />
                                </div>
                            </div>

                            {/* Services Section */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <label className="form-label fw-bold mb-0">Services <span className="text-danger">*</span></label>
                                    <button
                                        type="button"
                                        onClick={addService}
                                        className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                                        disabled={invoiceServices.filter(s => s.service).length >= services.length}
                                        title={invoiceServices.filter(s => s.service).length >= services.length ? "All services have been added" : "Add Service"}
                                    >
                                        <Plus size={16} />
                                        Add Service
                                    </button>
                                </div>

                                <div className="table-responsive border rounded">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="px-3 py-2">Service <span className="text-danger">*</span></th>
                                                <th className="px-3 py-2">Rate (AED with VAT) <span className="text-danger">*</span></th>
                                                <th className="px-3 py-2 text-center" style={{ width: "60px" }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceServices.map((service, index) => {
                                                // Get services already selected in other rows (excluding current row)
                                                const usedServices = invoiceServices
                                                    .filter((s, i) => i !== index && s.service)
                                                    .map(s => s.service);
                                                // Filter available services for this row
                                                const availableServices = services.filter(s => !usedServices.includes(s.name));
                                                
                                                return (
                                                <tr key={index}>
                                                    <td className="px-3 py-2">
                                                        <SearchableSelect
                                                            value={service.service}
                                                            onChange={(e) => updateService(index, 'service', e.target.value)}
                                                            options={availableServices.map(s => ({ value: s.name, label: s.name }))}
                                                            placeholder="Select Service"
                                                            className={`${(!service.service && index === 0) && 'is-invalid'}`}
                                                            required={index === 0}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={service.rate}
                                                            onChange={(e) => updateService(index, 'rate', e.target.value)}
                                                            className={`form-control ${(!service.rate && index === 0) && 'is-invalid'}`}
                                                            placeholder="0"
                                                            required={index === 0}
                                                        />
                                                        {service.rate && (
                                                            <small className="text-muted">
                                                                (Excl. VAT: AED {parseFloat(service.rate / 1.05).toFixed(2)})
                                                            </small>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {invoiceServices.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeService(index)}
                                                                className="btn btn-sm btn-outline-danger"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* New layout: Expenses on left, Total and buttons on right */}
                            <div className="row">
                                {/* Left side: Expenses */}
                                <div className="col-md-6 mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label fw-bold mb-0">Expenses (Optional)</label>
                                        <button
                                            type="button"
                                            onClick={addExpense}
                                            className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                                        >
                                            <Plus size={16} />
                                            Add Expense
                                        </button>
                                    </div>
                                    <div className="table-responsive border rounded">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="px-3 py-2">Type</th>
                                                    <th className="px-3 py-2">Date</th>
                                                    <th className="px-3 py-2 text-center">Pax</th>
                                                    <th className="px-3 py-2 text-end">Amount</th>
                                                    <th className="px-3 py-2 text-center" style={{ width: "80px" }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoiceExpenses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-3 text-muted">
                                                            No expenses added
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    invoiceExpenses.map((expense, index) => (
                                                            <tr key={expense.id}>
                                                                <td className="px-3 py-2">{expense.type}</td>
                                                                <td className="px-3 py-2">{expense.date}</td>
                                                                <td className="px-3 py-2 text-center">
                                                                    {expense.pax ? (
                                                                        <span className="badge bg-info">{expense.pax}</span>
                                                                    ) : (
                                                                        <span className="text-muted">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-end">
                                                                    <strong>{formatCurrency(expense.amount)}</strong>
                                                                </td>
                                                                <td className="px-3 py-2 text-center">
                                                                    <div className="d-flex justify-content-center gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openExpenseModal(expense)}
                                                                            className="btn btn-sm btn-outline-primary"
                                                                        >
                                                                            <Edit2 size={14} />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => requestDeleteExpense(index)}
                                                                            className="btn btn-sm btn-outline-danger"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                    ))
                                                )}
                                            </tbody>
                                            {invoiceExpenses.length > 0 && (
                                                <tfoot className="table-light">
                                                    <tr>
                                                        <td colSpan="3" className="text-end fw-bold">Total Expenses:</td>
                                                        <td colSpan="2" className="text-end fw-bold">{formatCurrency(calculateExpensesTotal())}</td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                </div>

                                {/* Right side: Total and buttons */}
                                <div className="col-md-6 mb-4">
                                    <div className="card bg-light h-100">
                                        <div className="card-body d-flex flex-column">
                                            <div className="mb-4 flex-grow-1">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Subtotal (excl. VAT):</span>
                                                    <span className="fw-medium">{formatCurrency(calculateSubtotal() - calculateVAT())}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">VAT (5%):</span>
                                                    <span className="fw-medium">{formatCurrency(calculateVAT())}</span>
                                                </div>
                                                <div className="d-flex justify-content-between pt-2 border-top mb-3">
                                                    <span className="fw-bold">Invoice Total (incl. VAT):</span>
                                                    <span className="fw-bold">{formatCurrency(calculateInvoiceTotal())}</span>
                                                </div>

                                                {invoiceExpenses.length > 0 && (
                                                    <>
                                                        <div className="d-flex justify-content-between mb-2">
                                                            <span className="text-muted">Total Expenses:</span>
                                                            <span className="fw-medium text-danger">- {formatCurrency(calculateExpensesTotal())}</span>
                                                        </div>
                                                        <div className="d-flex justify-content-between pt-2 border-top">
                                                            <span className="fw-bold">Net Amount:</span>
                                                            <span className="fw-bold">{formatCurrency(calculateNetAmount())}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary flex-grow-1 py-2"
                                                    onClick={handleSaveInvoice}
                                                    disabled={!selectedCustomer || !accommodation || invoiceServices[0].service === '' || invoiceServices[0].rate === ''}
                                                >
                                                    Save Invoice
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary py-2"
                                                    onClick={() => navigate('/')}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Customer Modal */}
            <CustomerModal
                show={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                onSave={handleAddCustomer}
                initialData={{}}
            />

            {/* Driver Modal */}
            <DriverModal
                show={showDriverModal}
                onClose={() => setShowDriverModal(false)}
                onSave={(driver, notes, date) => {
                    setAssignedDriver(driver);
                    setDriverNotes(notes || '');
                    // Update serviceDate if date is provided
                    if (date) {
                        setServiceDate(date);
                    }
                    setShowDriverModal(false);
                }}
                drivers={drivers}
                currentDriver={assignedDriver}
                currentNotes={driverNotes}
                currentDate={serviceDate}
            />

            {/* Service Modal */}
            <Modal show={showServiceModal} onClose={() => setShowServiceModal(false)} title="Add Service">
                <ServiceForm
                    servicesList={services}
                    onSave={(service, rate) => handleAddService(service, rate)}
                    onCancel={() => setShowServiceModal(false)}
                    invoice={currentInvoice}
                />
            </Modal>

            {/* Expense Modal */}
            <Modal 
                show={showExpenseModal} 
                onClose={() => { setShowExpenseModal(false); setCurrentExpense(null); }} 
                title={currentExpense ? "Edit Expense" : "Add Expense"}
            >
                <ExpenseForm
                    expenseTypes={expenseTypes}
                    vendors={vendors}
                    onSave={(type, amount, date, description, _accountName, vendorName, pax) => handleAddOrUpdateExpense(type, amount, date, description, vendorName, pax)}
                    onCancel={() => { setShowExpenseModal(false); setCurrentExpense(null); }}
                    invoice={currentInvoice}
                    expense={currentExpense}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                show={showDeleteExpenseModal}
                onClose={() => { setShowDeleteExpenseModal(false); setExpenseToDeleteIndex(null); }}
                onConfirm={confirmDeleteExpense}
                itemName={expenseToDeleteIndex !== null ? invoiceExpenses[expenseToDeleteIndex]?.type : ''}
                title="Delete Expense"
                message="Are you sure you want to delete this expense?"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
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

export default GenerateInvoice;