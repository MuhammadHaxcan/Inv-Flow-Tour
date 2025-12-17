import React, { useState, useEffect } from 'react';
import { Plus, User, Truck, Edit2, Trash2, Calendar, X } from 'lucide-react';
import Modal from '../components/Modal';
import CustomerModal from '../components/CustomerModal';
import ServiceForm from '../components/ServiceForm';
import DriverModal from '../components/DriverModal';
import AlertModal from '../components/AlertModal';
import SearchableSelect from '../components/SearchableSelect';
import { useInvoice } from '../contexts/InvoiceContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const GenerateInvoice = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Use invoice context
    const {
        customers, addCustomer,
        drivers, services, accounts,
        nextInvoiceNumber, generateInvoice,
        loadCustomers, loadDrivers, loadServices, loadAccounts, loadNextInvoiceNumber,
        loadingStates
    } = useInvoice();

    // Load only needed data when component mounts
    useEffect(() => {
        loadCustomers();
        loadDrivers();
        loadServices();
        loadAccounts();
        loadNextInvoiceNumber();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Invoice state
    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);
    
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
    const [adults, setAdults] = useState('');
    const [children, setChildren] = useState('');
    const [tripType, setTripType] = useState('Morning'); // 'Morning' or 'Evening'
    const [tripMode, setTripMode] = useState('Shared'); // 'Shared' or 'Private'
    const [invoiceServices, setInvoiceServices] = useState([{ service: '', rate: '' }]);
    // Expenses removed from this flow
    const [payments, setPayments] = useState([]);

    // Add this effect to keep currentInvoice updated
    useEffect(() => {
        const invoice = {
            customer: selectedCustomer,
            driver: assignedDriver,
            serviceDate,
            adults,
            children,
            services: invoiceServices,
            expenses: [],
            payments: payments,
            paid: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
            total: calculateInvoiceTotal()
        };
        setCurrentInvoice(invoice);
    }, [selectedCustomer, assignedDriver, serviceDate, adults, children, invoiceServices, payments]);

    const addService = () => {
        setInvoiceServices([...invoiceServices, { service: '', rate: '' }]);
    };

    const removeService = (index) => {
        const newServices = invoiceServices.filter((_, i) => i !== index);
        setInvoiceServices(newServices);
    };

    const updateService = (index, field, value) => {
        const newServices = [...invoiceServices];
        newServices[index][field] = value;

        if (field === 'service') {
            const selectedService = services.find(s => s.name === value);
            if (selectedService) {
                // Use service charge (excl. VAT) in the input; VAT derived separately
                newServices[index].rate = selectedService.charge;
            }
        }

        setInvoiceServices(newServices);
    };

    // Update the calculation functions
    const calculateSubtotal = () => {
        // Rates are entered excluding VAT
        return invoiceServices.reduce((sum, s) => sum + (parseFloat(s.rate) || 0), 0);
    };

    const calculateVAT = () => {
        // Preview: 5% VAT will be applied only for bank account payments
        return invoiceServices.reduce((sum, s) => {
            const rate = parseFloat(s.rate) || 0;
            return sum + (rate * 0.05);
        }, 0);
    };

    const calculateInvoiceTotal = () => {
        // Total includes VAT
        return calculateSubtotal() + calculateVAT();
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

    const handleAddService = (service, rate) => {
        // Store rates excluding VAT to avoid double-charging when totals add 5%
        const serviceInfo = services.find(s => s.name === service);
        const exVatRate = serviceInfo ? serviceInfo.charge : rate;

        const newService = {
            service,
            rate: parseFloat(exVatRate || 0)
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

        const adultCount = parseInt(adults || 0, 10) || 0;
        const childCount = parseInt(children || 0, 10) || 0;

        if ((adultCount + childCount) <= 0) {
            showAlert('Please enter at least one guest (adults or children)', 'warning');
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
            const rateEx = parseFloat(s.rate) || 0; // Rate is entered as VAT-exclusive
            return {
                serviceId: service?.id || 0,
                // Send rate excluding VAT - VAT is added only for bank payments
                rate: parseFloat(rateEx.toFixed(2))
            };
        }).filter(s => s.serviceId > 0);

        // Transform expenses to API format
        const expensesData = []; // Expenses removed in this flow

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
            adults: adultCount,
            children: childCount,
            tripType: tripType,
            tripMode: tripMode,
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

    // Show loading state only if critical data is loading and we don't have data yet
    const isLoading = (loadingStates.customers && customers.length === 0) || 
                     (loadingStates.drivers && drivers.length === 0) ||
                     (loadingStates.services && services.length === 0) ||
                     (loadingStates.accounts && accounts.length === 0);

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
                                        value={user ? (user.fullName || user.username || 'Unknown User') : 'Loading...'}
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
                                    <label className="form-label small fw-medium">Tour Date</label>
                                    <input
                                        type="date"
                                        value={serviceDate}
                                        onChange={(e) => setServiceDate(e.target.value)}
                                        className="form-control form-control-sm"
                                    />
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
                                                        aria-label="Change assigned driver"
                                                    >
                                                        <Edit2 size={14} aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAssignedDriver('');
                                                            setDriverNotes('');
                                                        }}
                                                        className="btn btn-sm btn-outline-danger py-0 px-1"
                                                        title="Remove Driver"
                                                        aria-label="Remove assigned driver"
                                                    >
                                                        <X size={14} aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setShowDriverModal(true)}
                                                className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                                                aria-label="Assign driver to invoice"
                                            >
                                                <Truck size={16} aria-hidden="true" />
                                                Assign Driver
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label small fw-medium">Adults <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={adults}
                                        onChange={(e) => setAdults(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
                                        placeholder="0"
                                        className="form-control form-control-sm"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-medium">Children</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={children}
                                        onChange={(e) => setChildren(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0))}
                                        placeholder="0"
                                        className="form-control form-control-sm"
                                    />
                                </div>
                            </div>

                            {/* Trip Type and Mode */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label small fw-medium">Trip Type</label>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="tripType"
                                                id="tripTypeMorning"
                                                value="Morning"
                                                checked={tripType === 'Morning'}
                                                onChange={(e) => setTripType(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="tripTypeMorning">
                                                Morning Trip
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="tripType"
                                                id="tripTypeEvening"
                                                value="Evening"
                                                checked={tripType === 'Evening'}
                                                onChange={(e) => setTripType(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="tripTypeEvening">
                                                Evening Trip
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label small fw-medium">Trip Mode</label>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="tripMode"
                                                id="tripModeShared"
                                                value="Shared"
                                                checked={tripMode === 'Shared'}
                                                onChange={(e) => setTripMode(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="tripModeShared">
                                                Shared
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="tripMode"
                                                id="tripModePrivate"
                                                value="Private"
                                                checked={tripMode === 'Private'}
                                                onChange={(e) => setTripMode(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="tripModePrivate">
                                                Private
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Services Section */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <label className="form-label fw-bold mb-0">Tour Type<span className="text-danger">*</span></label>
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
                                                <th className="px-3 py-2">Rate (AED excl. VAT) <span className="text-danger">*</span></th>
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
                                                                (VAT: 5% added for bank payments only)
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

                            {/* Totals and actions */}
                            <div className="row">
                                <div className="col-12 mb-4">
                                    <div className="card bg-light h-100">
                                        <div className="card-body d-flex flex-column">
                                            <div className="mb-4 flex-grow-1">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Subtotal (excl. VAT):</span>
                                                    <span className="fw-medium">{formatCurrency(calculateSubtotal())}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">VAT (5% for bank payments):</span>
                                                    <span className="fw-medium">{formatCurrency(calculateVAT())}</span>
                                                </div>
                                                <div className="d-flex justify-content-between pt-2 border-top mb-3">
                                                    <span className="fw-bold">Base Total (VAT added during payment):</span>
                                                    <span className="fw-bold">{formatCurrency(calculateSubtotal())}</span>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary flex-grow-1 py-2"
                                                    onClick={handleSaveInvoice}
                                                    disabled={!selectedCustomer || ((parseInt(adults || 0, 10) || 0) + (parseInt(children || 0, 10) || 0) <= 0) || invoiceServices[0].service === '' || invoiceServices[0].rate === ''}
                                                    aria-label="Save invoice"
                                                >
                                                    Save Invoice
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary py-2"
                                                    onClick={() => navigate('/')}
                                                    aria-label="Cancel and return to dashboard"
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