import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, DollarSign, Truck, Receipt, Edit2 } from 'lucide-react';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';
import ExpenseForm from '../components/ExpenseForm';
import ServiceForm from '../components/ServiceForm';
import DriverModal from '../components/DriverModal';
import 'bootstrap/dist/css/bootstrap.min.css';

const OpenInvoices = () => {
    const [expandedInvoice, setExpandedInvoice] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showDriverModal, setShowDriverModal] = useState(false);

    const [currentInvoice, setCurrentInvoice] = useState(null);
    const [assignedDriver, setAssignedDriver] = useState('');

    const [invoices, setInvoices] = useState([
        {
            id: 1,
            number: 'INV-2024-0153',
            date: '2024-03-15',
            customer: 'ABC Company',
            persons: 3,
            driver: 'Ahmed Khan',
            total: 12500,
            paid: 5000,
            status: 'partial',
            services: [
                { id: 1, service: 'Airport Transfer', rate: 5000 },
                { id: 2, service: 'City Tour', rate: 7500 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 500, date: '2024-03-15' },
                { id: 2, type: 'Tolls', amount: 100, date: '2024-03-15' }
            ],
            payments: [
                { id: 1, amount: 5000, date: '2024-03-15', method: 'Cash Account', reference: 'ADV-001' }
            ]
        },
        {
            id: 2,
            number: 'INV-2024-0154',
            date: '2024-03-17',
            customer: 'XYZ Ltd',
            persons: 2,
            driver: 'Ali Raza',
            total: 8000,
            paid: 8000,
            status: 'paid',
            services: [
                { id: 1, service: 'Hourly Rental', rate: 3000 },
                { id: 2, service: 'City Tour', rate: 5000 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 400, date: '2024-03-17' }
            ],
            payments: [
                { id: 1, amount: 8000, date: '2024-03-17', method: 'Bank Account - HBL', reference: 'TRX-452' }
            ]
        },
        {
            id: 3,
            number: 'INV-2024-0155',
            date: '2024-03-18',
            customer: 'Global Trading',
            persons: 4,
            driver: '',
            total: 15000,
            paid: 0,
            status: 'unpaid',
            services: [
                { id: 1, service: 'Outstation', rate: 15000 }
            ],
            expenses: [],
            payments: []
        }
    ]);

    const [drivers] = useState([
        { id: 1, name: 'Ahmed Khan', phone: '+971501111111' },
        { id: 2, name: 'Ali Raza', phone: '+971502222222' },
        { id: 3, name: 'Mohammad Siddiq', phone: '+971503333333' }
    ]);

    const accounts = [
        { name: 'Cash Account', type: 'cash' },
        { name: 'Bank Account - HBL', type: 'bank' },
        { name: 'Bank Account - MCB', type: 'bank' },
        { name: 'Credit Card', type: 'bank' }
    ];

    const expenseTypes = ['Fuel', 'Tolls', 'Parking', 'Tickets', 'Maintenance'];

    const servicesList = [
        { name: 'Airport Transfer', rate: 5000 },
        { name: 'City Tour', rate: 8000 },
        { name: 'Hourly Rental', rate: 3000 },
        { name: 'Outstation', rate: 12000 }
    ];

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

    const openExpenseModal = (invoice, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
        setShowExpenseModal(true);
    };

    const openServiceModal = (invoice, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
        setShowServiceModal(true);
    };

    const openDriverModal = (invoice, e) => {
        e && e.stopPropagation();
        setCurrentInvoice(invoice);
        setAssignedDriver(invoice.driver || '');
        setShowDriverModal(true);
    };

    const handleAddPayment = (amount, method, date, reference, notes) => {
        if (!currentInvoice) return;
        const updatedInvoices = invoices.map(inv => {
            if (inv.id === currentInvoice.id) {
                const newPayment = {
                    id: Date.now(),
                    amount: parseFloat(amount),
                    date,
                    method,
                    reference,
                    notes
                };

                const newPaid = inv.paid + parseFloat(amount);
                let newStatus = 'unpaid';
                if (newPaid >= inv.total) newStatus = 'paid';
                else if (newPaid > 0) newStatus = 'partial';

                return {
                    ...inv,
                    payments: [...inv.payments, newPayment],
                    paid: newPaid,
                    status: newStatus
                };
            }
            return inv;
        });

        setInvoices(updatedInvoices);
        setShowPaymentModal(false);
    };

    const handleAddExpense = (type, amount, date, description) => {
        if (!currentInvoice) return;
        const updatedInvoices = invoices.map(inv => {
            if (inv.id === currentInvoice.id) {
                const newExpense = {
                    id: Date.now(),
                    type,
                    amount: parseFloat(amount),
                    date,
                    description
                };

                return {
                    ...inv,
                    expenses: [...inv.expenses, newExpense]
                };
            }
            return inv;
        });

        setInvoices(updatedInvoices);
        setShowExpenseModal(false);
    };

    const handleAddService = (service, rate) => {
        if (!currentInvoice) return;
        const updatedInvoices = invoices.map(inv => {
            if (inv.id === currentInvoice.id) {
                const newService = {
                    id: Date.now(),
                    service,
                    rate: parseFloat(rate)
                };

                const newTotal = inv.total + parseFloat(rate);
                let newStatus = 'unpaid';
                if (inv.paid >= newTotal) newStatus = 'paid';
                else if (inv.paid > 0) newStatus = 'partial';

                return {
                    ...inv,
                    services: [...inv.services, newService],
                    total: newTotal,
                    status: newStatus
                };
            }
            return inv;
        });

        setInvoices(updatedInvoices);
        setShowServiceModal(false);
    };

    const handleAssignDriver = () => {
        if (!currentInvoice) return;
        const updatedInvoices = invoices.map(inv => {
            if (inv.id === currentInvoice.id) {
                return {
                    ...inv,
                    driver: assignedDriver
                };
            }
            return inv;
        });

        setInvoices(updatedInvoices);
        setShowDriverModal(false);
    };

    return (
        <>
            <div className="bg-white border-b shadow-sm w-100 px-0">
                <div className="container-fluid py-3">
                    <h2 className="display-12 fw-bold text-primary">Open Invoices</h2>
                    <p className="text-muted mt-1 mb-0">
                        Manage your pending invoices, record payments and track expenses
                    </p>
                </div>
            </div>

            <div className="container-fluid py-3">
                <div className="card shadow">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Invoice Details</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Driver</th>
                                        <th className="px-4 py-3 text-end">Outstanding</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted">
                                                No invoices found
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map(invoice => (
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
                                                        <div>
                                                            {invoice.driver || (
                                                                <span className="text-warning">Not assigned</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        <div className="fw-bold">
                                                            AED {(invoice.total - invoice.paid).toFixed(2)}
                                                        </div>
                                                        <span className={`badge ${getStatusColor(invoice.status)} rounded-pill`}>
                                                            {getStatusText(invoice.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                                {expandedInvoice === invoice.id && (
                                                    <tr>
                                                        <td colSpan="4" className="p-0 border-0">
                                                            <div className="card m-3">
                                                                {/* Invoice summary */}
                                                                <div className="card-header bg-light py-3">
                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                        <h5 className="card-title mb-0 fw-bold">Invoice Details</h5>
                                                                        <div className="text-muted">
                                                                            Total: AED {invoice.total.toFixed(2)} |
                                                                            Paid: AED {invoice.paid.toFixed(2)} |
                                                                            Balance: AED {(invoice.total - invoice.paid).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Services */}
                                                                <div className="card-body border-bottom py-3">
                                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                                        <h6 className="fw-bold mb-0">Services</h6>
                                                                        <div className="d-flex gap-2">
                                                                            <button
                                                                                onClick={(e) => openServiceModal(invoice, e)}
                                                                                className="btn btn-sm btn-dark d-flex align-items-center gap-1"
                                                                            >
                                                                                <Plus size={14} />
                                                                                Add Service
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => openPaymentModal(invoice, e)}
                                                                                className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                                                            >
                                                                                <DollarSign size={14} />
                                                                                Add Payment
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-sm table-striped">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Service</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.services.map(service => (
                                                                                    <tr key={service.id}>
                                                                                        <td>{service.service}</td>
                                                                                        <td className="text-end">AED {service.rate.toFixed(2)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                                {invoice.services.length === 0 && (
                                                                                    <tr>
                                                                                        <td colSpan="2" className="text-center text-muted">No services added</td>
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
                                                                        <div className="d-flex gap-2">
                                                                            <button
                                                                                onClick={(e) => openExpenseModal(invoice, e)}
                                                                                className="btn btn-sm btn-dark d-flex align-items-center gap-1"
                                                                            >
                                                                                <Plus size={14} />
                                                                                Add Expense
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => openDriverModal(invoice, e)}
                                                                                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                                            >
                                                                                <Truck size={14} />
                                                                                Assign Driver
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-sm table-striped">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Type</th>
                                                                                    <th>Date</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.expenses.map(exp => (
                                                                                    <tr key={exp.id}>
                                                                                        <td>{exp.type}</td>
                                                                                        <td>{exp.date}</td>
                                                                                        <td className="text-end">AED {exp.amount.toFixed(2)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                                {invoice.expenses.length === 0 && (
                                                                                    <tr>
                                                                                        <td colSpan="3" className="text-center text-muted">No expenses added</td>
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
                                                                            {invoice.payments.length} payments recorded
                                                                        </div>
                                                                    </div>
                                                                    <div className="table-responsive">
                                                                        <table className="table table-sm table-striped">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Date</th>
                                                                                    <th>Method</th>
                                                                                    <th className="text-end">Amount</th>
                                                                                    <th>Reference</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {invoice.payments.map(p => (
                                                                                    <tr key={p.id}>
                                                                                        <td>{p.date}</td>
                                                                                        <td>{p.method}</td>
                                                                                        <td className="text-end">AED {p.amount.toFixed(2)}</td>
                                                                                        <td>{p.reference}</td>
                                                                                    </tr>
                                                                                ))}
                                                                                {invoice.payments.length === 0 && (
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
            <Modal show={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Add Expense">
                <ExpenseForm
                    expenseTypes={expenseTypes}
                    onSave={(type, amount, date, description) => handleAddExpense(type, amount, date, description)}
                    onCancel={() => setShowExpenseModal(false)}
                    invoice={currentInvoice}
                />
            </Modal>

            {/* Service Modal */}
            <Modal show={showServiceModal} onClose={() => setShowServiceModal(false)} title="Add Service">
                <ServiceForm
                    servicesList={servicesList}
                    onSave={(service, rate) => handleAddService(service, rate)}
                    onCancel={() => setShowServiceModal(false)}
                    invoice={currentInvoice}
                />
            </Modal>

            {/* Driver Modal */}
            <DriverModal 
                show={showDriverModal} 
                onClose={() => setShowDriverModal(false)} 
                onSave={(driver) => handleAssignDriver()}
                drivers={drivers}
                currentDriver={assignedDriver}
            />
        </>
    );
};

export default OpenInvoices;