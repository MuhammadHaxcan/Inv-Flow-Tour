import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, DollarSign, Truck, Receipt, Edit2 } from 'lucide-react';
import Modal from '../components/Modal';
import PaymentForm from '../components/PaymentForm';
import ExpenseForm from '../components/ExpenseForm';
import ServiceForm from '../components/ServiceForm';

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
            case 'paid': return 'bg-green-100 text-green-800';
            case 'partial': return 'bg-yellow-100 text-yellow-800';
            case 'unpaid': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h2 className="text-2xl font-bold text-gray-900">Open Invoices</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your pending invoices, record payments and track expenses
                    </p>
                </div>
            </div>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="bg-white shadow-sm">
                        <div className="overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Invoice Details
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Driver
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Outstanding
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                                                No invoices found
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map(invoice => (
                                            <React.Fragment key={invoice.id}>
                                                <tr
                                                    className={`${expandedInvoice === invoice.id ? 'bg-gray-50' : 'hover:bg-gray-50'} cursor-pointer`}
                                                    onClick={() => toggleExpand(invoice.id)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            {expandedInvoice === invoice.id ?
                                                                <ChevronUp size={18} className="text-gray-400 mr-2" /> :
                                                                <ChevronDown size={18} className="text-gray-400 mr-2" />
                                                            }
                                                            <div>
                                                                <div className="font-medium text-gray-900">{invoice.number}</div>
                                                                <div className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{invoice.customer}</div>
                                                        <div className="text-sm text-gray-500">{invoice.persons} persons</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">
                                                            {invoice.driver || (
                                                                <span className="text-orange-500">Not assigned</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            AED {(invoice.total - invoice.paid).toFixed(2)}
                                                        </div>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                                            {getStatusText(invoice.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                                {expandedInvoice === invoice.id && (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-4 bg-gray-50">
                                                            <div className="border border-gray-200 rounded-md overflow-hidden">
                                                                {/* Invoice summary */}
                                                                <div className="px-4 py-3 bg-gray-100">
                                                                    <div className="flex justify-between items-center">
                                                                        <h3 className="text-sm font-medium text-gray-700">Invoice Details</h3>
                                                                        <div className="text-sm text-gray-500">
                                                                            Total: AED {invoice.total.toFixed(2)} |
                                                                            Paid: AED {invoice.paid.toFixed(2)} |
                                                                            Balance: AED {(invoice.total - invoice.paid).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Services */}
                                                                <div className="px-4 py-3 border-t border-gray-200">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <h4 className="text-sm font-medium text-gray-700">Services</h4>
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={(e) => openServiceModal(invoice, e)}
                                                                                className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded flex items-center gap-1"
                                                                            >
                                                                                <Plus size={14} />
                                                                                Add Service
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => openPaymentModal(invoice, e)}
                                                                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded flex items-center gap-1"
                                                                            >
                                                                                <DollarSign size={14} />
                                                                                Add Payment
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                        <thead className="bg-gray-50">
                                                                            <tr>
                                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                                                                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                            {invoice.services.map(service => (
                                                                                <tr key={service.id}>
                                                                                    <td className="px-3 py-2 text-sm text-gray-900">{service.service}</td>
                                                                                    <td className="px-3 py-2 text-sm text-gray-900 text-right">AED {service.rate.toFixed(2)}</td>
                                                                                </tr>
                                                                            ))}
                                                                            {invoice.services.length === 0 && (
                                                                                <tr>
                                                                                    <td colSpan="2" className="px-3 py-2 text-sm text-gray-500 text-center">No services added</td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                                {/* Expenses */}
                                                                <div className="px-4 py-3 border-t border-gray-200">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <h4 className="text-sm font-medium text-gray-700">Expenses</h4>
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={(e) => openExpenseModal(invoice, e)}
                                                                                className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded flex items-center gap-1"
                                                                            >
                                                                                <Plus size={14} />
                                                                                Add Expense
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => openDriverModal(invoice, e)}
                                                                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded flex items-center gap-1"
                                                                            >
                                                                                <Truck size={14} />
                                                                                Assign Driver
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                        <thead className="bg-gray-50">
                                                                            <tr>
                                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                                                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                            {invoice.expenses.map(exp => (
                                                                                <tr key={exp.id}>
                                                                                    <td className="px-3 py-2 text-sm text-gray-900">{exp.type}</td>
                                                                                    <td className="px-3 py-2 text-sm text-gray-500">{exp.date}</td>
                                                                                    <td className="px-3 py-2 text-sm text-gray-900 text-right">AED {exp.amount.toFixed(2)}</td>
                                                                                </tr>
                                                                            ))}
                                                                            {invoice.expenses.length === 0 && (
                                                                                <tr>
                                                                                    <td colSpan="3" className="px-3 py-2 text-sm text-gray-500 text-center">No expenses added</td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>

                                                                {/* Payments */}
                                                                <div className="px-4 py-3 border-t border-gray-200">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <h4 className="text-sm font-medium text-gray-700">Payments</h4>
                                                                        <div className="text-sm text-gray-500">
                                                                            {invoice.payments.length} payments recorded
                                                                        </div>
                                                                    </div>
                                                                    <table className="min-w-full divide-y divide-gray-200">
                                                                        <thead className="bg-gray-50">
                                                                            <tr>
                                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                                                                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                            {invoice.payments.map(p => (
                                                                                <tr key={p.id}>
                                                                                    <td className="px-3 py-2 text-sm text-gray-900">{p.date}</td>
                                                                                    <td className="px-3 py-2 text-sm text-gray-900">{p.method}</td>
                                                                                    <td className="px-3 py-2 text-sm text-gray-900 text-right">AED {p.amount.toFixed(2)}</td>
                                                                                    <td className="px-3 py-2 text-sm text-gray-500">{p.reference}</td>
                                                                                </tr>
                                                                            ))}
                                                                            {invoice.payments.length === 0 && (
                                                                                <tr>
                                                                                    <td colSpan="4" className="px-3 py-2 text-sm text-gray-500 text-center">No payments recorded</td>
                                                                                </tr>
                                                                            )}
                                                                        </tbody>
                                                                    </table>
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
            <Modal show={showDriverModal} onClose={() => setShowDriverModal(false)} title="Assign Driver">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Driver</label>
                        <select
                            value={assignedDriver}
                            onChange={(e) => setAssignedDriver(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                        >
                            <option value="">Choose a driver</option>
                            {drivers.map((driver) => (
                                <option key={driver.id} value={driver.name}>{driver.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleAssignDriver}
                            className="flex-1 px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                            disabled={!assignedDriver}
                        >
                            Assign Driver
                        </button>
                        <button onClick={() => setShowDriverModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default OpenInvoices;