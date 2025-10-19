import React, { useState, useEffect } from 'react';
import { Plus, User, DollarSign, Receipt, Truck, Edit2, Trash2, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import CustomerModal from '../components/CustomerModal';
import ServiceForm from '../components/ServiceForm';
import PaymentForm from '../components/PaymentForm';
import ExpenseForm from '../components/ExpenseForm';
import DriverModal from '../components/DriverModal';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const GenerateInvoice = () => {
    const navigate = useNavigate();

    // Use data context
    const {
        customers, addCustomer,
        drivers, services, accounts, expenses,
        nextInvoiceNumber, generateInvoice
    } = useData();

    // Invoice state
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);

    // Get today's date in a consistent format
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; // YYYY-MM-DD format for date inputs
    const displayDate = today.toLocaleString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' });

    // Form state
    const [serviceDate, setServiceDate] = useState(formattedToday);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [assignedDriver, setAssignedDriver] = useState('');
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

    const handleAddCustomer = (formData) => {
        const newCustomer = addCustomer(formData);
        setSelectedCustomer(newCustomer.name);
        setShowCustomerModal(false);
    };

    const handleAddExpense = (type, amount, date, description) => {
        const newExpense = {
            id: Date.now(),
            type,
            amount: parseFloat(amount),
            date,
            description
        };
        setInvoiceExpenses([...invoiceExpenses, newExpense]);
        setShowExpenseModal(false);
    };

    const openExpenseModal = () => {
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
    const handleSaveInvoice = () => {
        if (!selectedCustomer) {
            alert('Please select a customer');
            return;
        }

        // Validate that at least one service is fully filled
        const validServices = invoiceServices.filter(s => s.service && s.rate);
        if (validServices.length === 0) {
            alert('Please add at least one service');
            return;
        }

        // Validate person accommodation
        if (!accommodation) {
            alert('Please enter number of persons');
            return;
        }

        const invoiceData = {
            customer: selectedCustomer,
            driver: assignedDriver || '', // Make driver optional
            serviceDate,
            persons: parseInt(accommodation) || 0,
            services: validServices, // Only include valid services
            expenses: invoiceExpenses,
            payments: payments,
            paid: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
            total: calculateInvoiceTotal()
        };

        generateInvoice(invoiceData);
        navigate('/open-invoices');
    };

    return (
        <>
            <div className="content-wrapper">
                <div className="card shadow">
                    <div className="card-header bg-light py-2">
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
                                        <select
                                            value={selectedCustomer}
                                            onChange={(e) => setSelectedCustomer(e.target.value)}
                                            className={`form-select form-select-sm flex-grow-1 ${!selectedCustomer && 'is-invalid'}`}
                                            required
                                        >
                                            <option value="">Select Customer</option>
                                            {customers.map((customer) => (
                                                <option key={customer.id} value={customer.name}>{customer.name}</option>
                                            ))}
                                        </select>
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
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDriverModal(true)}
                                                    className="btn btn-sm btn-outline-secondary py-0 px-1"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
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
                                        type="number"
                                        value={accommodation}
                                        onChange={(e) => setAccommodation(e.target.value)}
                                        placeholder="Number of persons"
                                        className={`form-control form-control-sm ${!accommodation && 'is-invalid'}`}
                                        min="1"
                                        required
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
                                            {invoiceServices.map((service, index) => (
                                                <tr key={index}>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={service.service}
                                                            onChange={(e) => updateService(index, 'service', e.target.value)}
                                                            className={`form-select ${(!service.service && index === 0) && 'is-invalid'}`}
                                                            required={index === 0}
                                                        >
                                                            <option value="">Select Service</option>
                                                            {services.map((s) => (
                                                                <option key={s.id} value={s.name}>{s.name}</option>
                                                            ))}
                                                        </select>
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
                                            ))}
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
                                                    <th className="px-3 py-2">Amount</th>
                                                    <th className="px-3 py-2 text-center" style={{ width: "60px" }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoiceExpenses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-3 text-muted">
                                                            No expenses added
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    invoiceExpenses.map((expense, index) => (
                                                        <tr key={expense.id}>
                                                            <td className="px-3 py-2">{expense.type}</td>
                                                            <td className="px-3 py-2">{expense.date}</td>
                                                            <td className="px-3 py-2">{formatCurrency(expense.amount)}</td>
                                                            <td className="px-3 py-2 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeExpense(index)}
                                                                    className="btn btn-sm btn-outline-danger"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                            {invoiceExpenses.length > 0 && (
                                                <tfoot className="table-light">
                                                    <tr>
                                                        <td colSpan="2" className="text-end fw-bold">Total Expenses:</td>
                                                        <td colSpan="2" className="fw-bold">{formatCurrency(calculateExpensesTotal())}</td>
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
                onSave={(driver, date, notes) => {
                    setAssignedDriver(driver);
                    setShowDriverModal(false);
                }}
                drivers={drivers}
                currentDriver={assignedDriver}
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
            <Modal show={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Add Expense">
                <ExpenseForm
                    expenseTypes={expenseTypes}
                    onSave={(type, amount, date, description) => handleAddExpense(type, amount, date, description)}
                    onCancel={() => setShowExpenseModal(false)}
                    invoice={currentInvoice}
                />
            </Modal>
        </>
    );
};

export default GenerateInvoice;