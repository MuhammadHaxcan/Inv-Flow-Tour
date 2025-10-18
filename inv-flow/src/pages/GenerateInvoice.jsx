import React, { useState, useEffect } from 'react';
import { Plus, User, DollarSign, Receipt, Truck, Edit2, Trash2, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import CustomerModal from '../components/CustomerModal';
import ServiceForm from '../components/ServiceForm';
import PaymentForm from '../components/PaymentForm';
import ExpenseForm from '../components/ExpenseForm';
import DriverModal from '../components/DriverModal';
import 'bootstrap/dist/css/bootstrap.min.css';

const GenerateInvoice = () => {
    // Invoice state
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);

    // Get today's date in a consistent format
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; // YYYY-MM-DD format for date inputs

    // Format for display (this is used in the invoice date display)
    const displayDate = today.toLocaleString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    // Update the service date state to use the same date as the invoice
    const [serviceDate, setServiceDate] = useState(formattedToday);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [assignedDriver, setAssignedDriver] = useState('');
    const [accommodation, setAccommodation] = useState('');
    const [services, setServices] = useState([{ service: '', rate: '' }]);
    const [expenses, setExpenses] = useState([]);
    
    // Add this effect to keep currentInvoice updated
    useEffect(() => {
        const invoice = {
            customer: selectedCustomer,
            driver: assignedDriver,
            serviceDate,
            accommodation,
            services,
            expenses,
            total: calculateInvoiceTotal()
        };
        setCurrentInvoice(invoice);
    }, [selectedCustomer, assignedDriver, serviceDate, accommodation, services, expenses]);

    // Data
    const [customers, setCustomers] = useState([
        { id: 1, name: 'ABC Company', phone: '+971501234567', email: 'contact@abc.com', origin: 'Dubai' },
        { id: 2, name: 'XYZ Ltd', phone: '+971507654321', email: 'info@xyz.com', origin: 'Abu Dhabi' }
    ]);

    const drivers = [
        { id: 1, name: 'Ahmed Khan', phone: '+971501111111' },
        { id: 2, name: 'Ali Raza', phone: '+971502222222' }
    ];

    const servicesList = [
        { name: 'Airport Transfer', rate: 5000 },
        { name: 'City Tour', rate: 8000 },
        { name: 'Hourly Rental', rate: 3000 },
        { name: 'Outstation', rate: 12000 }
    ];

    const expenseTypes = ['Fuel', 'Tolls', 'Parking', 'Tickets', 'Maintenance'];

    const addService = () => {
        setServices([...services, { service: '', rate: '' }]);
    };

    const removeService = (index) => {
        const newServices = services.filter((_, i) => i !== index);
        setServices(newServices);
    };

    const updateService = (index, field, value) => {
        const newServices = [...services];
        newServices[index][field] = value;

        if (field === 'service') {
            const selectedService = servicesList.find(s => s.name === value);
            if (selectedService) {
                newServices[index].rate = selectedService.rate;
            }
        }

        setServices(newServices);
    };

    const addExpense = () => {
        openExpenseModal();
    };

    const removeExpense = (index) => {
        const newExpenses = expenses.filter((_, i) => i !== index);
        setExpenses(newExpenses);
    };

    // Update the calculation functions
    const calculateSubtotal = () => {
        return services.reduce((sum, s) => sum + (parseFloat(s.rate) || 0), 0);
    };

    const calculateExpensesTotal = () => {
        return expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    };

    const calculateVAT = () => {
        // In a real implementation, this would calculate VAT based on payment method
        // For now returning 0 as VAT is handled at payment time
        return 0;
    };

    const calculateInvoiceTotal = () => {
        return calculateSubtotal() + calculateVAT();
    };

    const calculateNetAmount = () => {
        return calculateInvoiceTotal() - calculateExpensesTotal();
    };

    const handleAddCustomer = (formData) => {
        const newCustomer = { ...formData, id: Date.now() };
        setCustomers([...customers, newCustomer]);
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
        setExpenses([...expenses, newExpense]);
        setShowExpenseModal(false);
    };

    const openExpenseModal = () => {
        setShowExpenseModal(true);
    };

    const handleAddService = (service, rate) => {
        const newService = { service, rate };
        setServices([...services, newService]);
        setShowServiceModal(false);
    };

    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
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
                                        value="INV-2024-0156" 
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
                                    <label className="form-label small fw-medium">Customer Information</label>
                                    <div className="d-flex gap-2">
                                        <select
                                            value={selectedCustomer}
                                            onChange={(e) => setSelectedCustomer(e.target.value)}
                                            className="form-select form-select-sm flex-grow-1"
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
                                    <div className="position-relative">
                                        <input
                                            type="date"
                                            value={serviceDate}
                                            onChange={(e) => setServiceDate(e.target.value)}
                                            onClick={(e) => e.target.showPicker()} // Add click handler
                                            onKeyDown={(e) => {
                                                if (e.key === ' ') { // Handle spacebar
                                                    e.preventDefault();
                                                    e.target.showPicker();
                                                }
                                            }}
                                            className="form-control form-control-sm date-input"
                                            style={{ 
                                                paddingRight: "2rem",
                                                cursor: "pointer" // Add pointer cursor
                                            }}
                                        />
                                        <Calendar 
                                            size={16} 
                                            className="position-absolute end-0 top-50 translate-middle-y me-2 text-muted pointer-events-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Driver and Accommodation */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-medium">Driver</label>
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
                                    <label className="form-label small fw-medium">Person Accommodation</label>
                                    <input
                                        type="number"
                                        value={accommodation}
                                        onChange={(e) => setAccommodation(e.target.value)}
                                        placeholder="Number of persons"
                                        className="form-control form-control-sm"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Services Section */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <label className="form-label fw-bold mb-0">Services</label>
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
                                                <th className="px-3 py-2">Service</th>
                                                <th className="px-3 py-2">Rate (AED)</th>
                                                <th className="px-3 py-2 text-center" style={{ width: "60px" }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {services.map((service, index) => (
                                                <tr key={index}>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={service.service}
                                                            onChange={(e) => updateService(index, 'service', e.target.value)}
                                                            className="form-select"
                                                        >
                                                            <option value="">Select Service</option>
                                                            {servicesList.map((s, i) => (
                                                                <option key={i} value={s.name}>{s.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={service.rate}
                                                            onChange={(e) => updateService(index, 'rate', e.target.value)}
                                                            className="form-control"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {services.length > 1 && (
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
                                        <label className="form-label fw-bold mb-0">Expenses</label>
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
                                                {expenses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-3 text-muted">
                                                            No expenses added
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    expenses.map((expense, index) => (
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
                                            {expenses.length > 0 && (
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
                                                    <span className="text-muted">Subtotal:</span>
                                                    <span className="fw-medium">{formatCurrency(calculateSubtotal())}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">VAT:</span>
                                                    <span className="fw-medium">{formatCurrency(calculateVAT())}</span>
                                                </div>
                                                <div className="d-flex justify-content-between pt-2 border-top mb-3">
                                                    <span className="fw-bold">Invoice Total:</span>
                                                    <span className="fw-bold">{formatCurrency(calculateInvoiceTotal())}</span>
                                                </div>
                                                
                                                {expenses.length > 0 && (
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
                                                <button type="button" className="btn btn-primary flex-grow-1 py-2">
                                                    Save Invoice
                                                </button>
                                                <button type="button" className="btn btn-outline-secondary py-2">
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
                    servicesList={servicesList}
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