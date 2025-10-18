import React, { useState } from 'react';
import { Plus, User, DollarSign, Receipt, Truck, Edit2, Trash2 } from 'lucide-react';
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
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);

    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [assignedDriver, setAssignedDriver] = useState('');
    const [serviceDate, setServiceDate] = useState('');
    const [accommodation, setAccommodation] = useState('');
    const [services, setServices] = useState([{ service: '', rate: '' }]);

    // Add this effect to keep currentInvoice updated
    React.useEffect(() => {
        const invoice = {
            customer: selectedCustomer,
            driver: assignedDriver,
            serviceDate,
            accommodation,
            services,
            total: calculateTotal()
        };
        setCurrentInvoice(invoice);
    }, [selectedCustomer, assignedDriver, serviceDate, accommodation, services]);

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

    const accounts = [
        { name: 'Cash Account', type: 'cash' },
        { name: 'Bank Account - HBL', type: 'bank' },
        { name: 'Bank Account - MCB', type: 'bank' },
        { name: 'Credit Card', type: 'bank' }
    ];

    const expenseTypes = ['Fuel', 'Tolls', 'Parking', 'Tickets', 'Maintenance'];

    const invoiceDate = new Date().toLocaleString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

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

    const calculateSubtotal = () => {
        return services.reduce((sum, s) => sum + (parseFloat(s.rate) || 0), 0);
    };

    const calculateVAT = () => {
        return 0;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateVAT();
    };

    const handleAddCustomer = (formData) => {
        const newCustomer = { ...formData, id: Date.now() };
        setCustomers([...customers, newCustomer]);
        setSelectedCustomer(newCustomer.name);
        setShowCustomerModal(false);
    };

    const handleAddPayment = (amount, method, date, reference, notes) => {
        console.log('Payment added:', { amount, method, date, reference, notes });
        // Add payment to invoice logic here
        setShowPaymentModal(false);
    };

    const handleAddExpense = (type, amount, date, description) => {
        console.log('Expense added:', { type, amount, date, description });
        // Add expense to invoice logic here                
        setShowExpenseModal(false);
    };

    const handleAddService = (service, rate) => {
        const newService = { service, rate };
        setServices([...services, newService]);
        setShowServiceModal(false);
    };

    return (
        <>
            <div className="bg-white border-b shadow-sm w-100 px-0">
                <div className="container-fluid py-3">
                    <h2 className="display-12 fw-bold text-primary">Generate Invoice</h2>
                    <div className="d-flex flex-wrap gap-3 text-muted mt-1">
                        <p className="mb-0">Invoice #INV-2024-0156</p>
                        <span>•</span>
                        <p className="mb-0">Invoice Date: {invoiceDate}</p>
                        <span>•</span>
                        <p className="mb-0">Created by: Admin User</p>
                    </div>
                </div>
            </div>

            <div className="container-fluid py-3">
                <div className="card shadow">
                    <div className="card-body p-4">
                        <form>
                            {/* Customer Section */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Customer Information</label>
                                <div className="d-flex gap-2">
                                    <select
                                        value={selectedCustomer}
                                        onChange={(e) => setSelectedCustomer(e.target.value)}
                                        className="form-select flex-grow-1"
                                    >
                                        <option value="">Select Customer</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.name}>{customer.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowCustomerModal(true)}
                                        className="btn btn-dark d-flex align-items-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Add New
                                    </button>
                                </div>

                                {assignedDriver && (
                                    <div className="mt-3 p-3 bg-light border rounded d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2">
                                            <User size={18} className="text-secondary" />
                                            <span className="fw-medium">
                                                Driver: {assignedDriver}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowDriverModal(true)}
                                            className="btn btn-sm btn-outline-secondary"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Person Accommodation</label>
                                <input
                                    type="number"
                                    value={accommodation}
                                    onChange={(e) => setAccommodation(e.target.value)}
                                    placeholder="Number of persons"
                                    className="form-control"
                                    min="1"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Service Date</label>
                                <input
                                    type="date"
                                    value={serviceDate}
                                    onChange={(e) => setServiceDate(e.target.value)}
                                    className="form-control"
                                />
                            </div>

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

                            <div className="card bg-light mb-4">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Subtotal:</span>
                                        <span className="fw-medium">AED {calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between pt-2 border-top">
                                        <span className="fw-bold fs-5">Total Amount:</span>
                                        <span className="fw-bold fs-5">AED {calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex gap-2 mb-4">
                                <button type="button" className="btn btn-primary flex-grow-1 py-2">
                                    Save Invoice
                                </button>
                                <button type="button" className="btn btn-outline-secondary py-2">
                                    Cancel
                                </button>
                            </div>

                            <div className="pt-4 border-top">
                                <div className="row g-3">
                                    <div className="col-12 col-md-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowDriverModal(true)}
                                            className="btn btn-dark w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                        >
                                            <Truck size={20} />
                                            Assign Driver
                                        </button>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowPaymentModal(true)}
                                            className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                        >
                                            <DollarSign size={20} />
                                            Record Payment
                                        </button>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowExpenseModal(true)}
                                            className="btn btn-info w-100 d-flex align-items-center justify-content-center gap-2 py-2 text-white"
                                        >
                                            <Receipt size={20} />
                                            Add Expense
                                        </button>
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