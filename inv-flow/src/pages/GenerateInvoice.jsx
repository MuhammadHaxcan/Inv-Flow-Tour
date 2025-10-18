import React, { useState } from 'react';
import { Plus, User, DollarSign, Receipt, Truck, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import CustomerModal from '../components/CustomerModal';
import ServiceForm from '../components/ServiceForm';
import PaymentForm from '../components/PaymentForm';
import ExpenseForm from '../components/ExpenseForm';

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
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h2 className="text-2xl font-bold text-gray-900">Generate Invoice</h2>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-gray-500">Invoice #INV-2024-0156</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-gray-500">Invoice Date: {invoiceDate}</p>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-gray-500">Created by: Admin User</p>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="bg-white shadow-sm">
                        <div className="p-6 space-y-6">

                            {/* Customer Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Information
                                </label>
                                <div className="flex gap-3">
                                    <select
                                        value={selectedCustomer}
                                        onChange={(e) => setSelectedCustomer(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                    >
                                        <option value="">Select Customer</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.name}>{customer.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setShowCustomerModal(true)}
                                        className="px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Add New
                                    </button>
                                </div>

                                {assignedDriver && (
                                    <div className="mt-3 p-3 bg-gray-50 border border-gray-300 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User size={18} className="text-gray-600" />
                                            <span className="text-sm font-medium text-gray-900">
                                                Driver: {assignedDriver}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setShowDriverModal(true)}
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Person Accommodation
                                </label>
                                <input
                                    type="number"
                                    value={accommodation}
                                    onChange={(e) => setAccommodation(e.target.value)}
                                    placeholder="Number of persons"
                                    className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Service Date
                                </label>
                                <input
                                    type="date"
                                    value={serviceDate}
                                    onChange={(e) => setServiceDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Services
                                    </label>
                                    <button
                                        onClick={addService}
                                        className="text-gray-700 hover:text-gray-900 flex items-center gap-1 text-sm font-medium"
                                    >
                                        <Plus size={16} />
                                        Add Service
                                    </button>
                                </div>

                                <div className="border border-gray-200 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate (AED)</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {services.map((service, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3">
                                                        <select
                                                            value={service.service}
                                                            onChange={(e) => updateService(index, 'service', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                                        >
                                                            <option value="">Select Service</option>
                                                            {servicesList.map((s, i) => (
                                                                <option key={i} value={s.name}>{s.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            value={service.rate}
                                                            onChange={(e) => updateService(index, 'rate', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {services.length > 1 && (
                                                            <button
                                                                onClick={() => removeService(index)}
                                                                className="text-gray-500 hover:text-gray-900"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">AED {calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                                    <span>Total Amount:</span>
                                    <span>AED {calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button className="flex-1 px-6 py-3 bg-gray-800 text-white hover:bg-gray-700 font-medium">
                                    Save Invoice
                                </button>
                                <button className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
                                    Cancel
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 border-t">
                                <button
                                    onClick={() => setShowDriverModal(true)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white hover:bg-gray-600 font-medium"
                                >
                                    <Truck size={20} />
                                    Assign Driver
                                </button>
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white hover:bg-gray-600 font-medium"
                                >
                                    <DollarSign size={20} />
                                    Record Payment
                                </button>
                                <button
                                    onClick={() => setShowExpenseModal(true)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white hover:bg-gray-600 font-medium"
                                >
                                    <Receipt size={20} />
                                    Add Expense
                                </button>
                            </div>
                        </div>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Date</label>
                        <input type="date" className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea className="w-full px-3 py-2 border border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-transparent" rows="3" placeholder="Add any special instructions"></textarea>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => assignedDriver && setShowDriverModal(false)}
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