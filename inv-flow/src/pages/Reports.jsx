import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, TrendingUp, DollarSign, Users, Package, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { reportsAPI } from '../services/api';
import SearchableSelect from '../components/SearchableSelect';
import 'bootstrap/dist/css/bootstrap.min.css';

const Reports = () => {
    const { services, customers, drivers, loadServices, loadCustomers, loadDrivers, loadingStates } = useData();
    const [activeTab, setActiveTab] = useState('service');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [selectedService, setSelectedService] = useState('all');
    const [selectedCustomer, setSelectedCustomer] = useState('all');
    const [selectedDriver, setSelectedDriver] = useState('all');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadServices();
        loadCustomers();
        loadDrivers();
    }, [loadServices, loadCustomers, loadDrivers]);

    useEffect(() => {
        loadReportData();
    }, [activeTab, dateRange.startDate, dateRange.endDate, selectedService, selectedCustomer, selectedDriver]);

    const loadReportData = async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            const filters = {};
            
            if (dateRange.startDate) {
                filters.startDate = dateRange.startDate;
            }
            if (dateRange.endDate) {
                filters.endDate = dateRange.endDate;
            }
            if (selectedService && selectedService !== 'all') {
                const serviceId = parseInt(selectedService);
                if (!isNaN(serviceId)) {
                    filters.serviceId = serviceId;
                }
            }
            if (selectedCustomer && selectedCustomer !== 'all') {
                const customerId = parseInt(selectedCustomer);
                if (!isNaN(customerId)) {
                    filters.customerId = customerId;
                }
            }
            if (selectedDriver && selectedDriver !== 'all') {
                const driverId = parseInt(selectedDriver);
                if (!isNaN(driverId)) {
                    filters.driverId = driverId;
                }
            }

            switch (activeTab) {
                case 'service':
                    data = await reportsAPI.getServiceReport(filters);
                    break;
                case 'customer':
                    data = await reportsAPI.getCustomerReport(filters);
                    break;
                case 'driver':
                    data = await reportsAPI.getDriverReport(filters);
                    break;
                case 'summary':
                    data = await reportsAPI.getSummaryReport(filters);
                    break;
                default:
                    data = null;
            }
            setReportData(data);
        } catch (err) {
            console.error('Error loading report:', err);
            const errorMessage = err.message || 'Failed to load report data';
            setError(errorMessage);
            if (err.response || err.data) {
                console.error('Full error details:', err.response || err.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return `AED ${parseFloat(amount || 0).toFixed(2)}`;
    };

    const tabs = [
        { id: 'service', label: 'Service Report', icon: Package },
        { id: 'customer', label: 'Customer Report', icon: Users },
        { id: 'driver', label: 'Driver Report', icon: Users },
        { id: 'summary', label: 'Summary Report', icon: BarChart3 }
    ];

    const isLoading = loadingStates.services || loadingStates.customers || loadingStates.drivers || loading;

    if (isLoading && !reportData) {
        return (
            <div className="content-wrapper py-3 px-4">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading reports...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="content-wrapper">
            <div className="card shadow">
                <div className="card-header bg-light py-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="h5 fw-bold text-primary mb-0">Master Reports</h3>
                        <p className="text-muted small mb-0">
                            Comprehensive reporting and analytics
                        </p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="card-body border-bottom bg-light py-3">
                    <div className="row align-items-end g-3">
                        <div className="col-md-2">
                            <label className="form-label small fw-medium">From Date</label>
                            <div className="input-group input-group-sm">
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                    className="form-control"
                                />
                                <span className="input-group-text">
                                    <Calendar size={14} className="text-muted" />
                                </span>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small fw-medium">To Date</label>
                            <div className="input-group input-group-sm">
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                    className="form-control"
                                />
                                <span className="input-group-text">
                                    <Calendar size={14} className="text-muted" />
                                </span>
                            </div>
                        </div>

                        {activeTab === 'service' && (
                            <div className="col-md-3">
                                <label className="form-label small fw-medium">Service</label>
                                <SearchableSelect
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'All Services' },
                                        ...services.map(service => ({ value: service.id.toString(), label: service.name }))
                                    ]}
                                    placeholder="All Services"
                                    size="sm"
                                />
                            </div>
                        )}

                        {activeTab === 'customer' && (
                            <div className="col-md-3">
                                <label className="form-label small fw-medium">Customer</label>
                                <SearchableSelect
                                    value={selectedCustomer}
                                    onChange={(e) => setSelectedCustomer(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'All Customers' },
                                        ...customers.map(customer => ({ value: customer.id.toString(), label: customer.name }))
                                    ]}
                                    placeholder="All Customers"
                                    size="sm"
                                />
                            </div>
                        )}

                        {activeTab === 'driver' && (
                            <div className="col-md-3">
                                <label className="form-label small fw-medium">Driver</label>
                                <SearchableSelect
                                    value={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'All Drivers' },
                                        ...drivers.map(driver => ({ value: driver.id.toString(), label: driver.name }))
                                    ]}
                                    placeholder="All Drivers"
                                    size="sm"
                                />
                            </div>
                        )}

                        <div className="col-md-3 d-flex gap-2">
                            <button
                                onClick={loadReportData}
                                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                disabled={loading}
                            >
                                <Filter size={14} />
                                {loading ? 'Loading...' : 'Apply'}
                            </button>
                            <button
                                onClick={() => {
                                    setDateRange({
                                        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                                        endDate: new Date().toISOString().split('T')[0]
                                    });
                                    setSelectedService('all');
                                    setSelectedCustomer('all');
                                    setSelectedDriver('all');
                                }}
                                className="btn btn-sm btn-outline-secondary"
                                disabled={loading}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="card-header p-0 border-0">
                    <ul className="nav nav-tabs card-header-tabs">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <li className="nav-item" key={tab.id}>
                                    <button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`nav-link d-flex align-items-center gap-2 px-4 py-2 ${
                                            activeTab === tab.id ? 'active' : 'text-secondary'
                                        }`}
                                        style={{
                                            fontSize: '0.85rem',
                                            fontWeight: activeTab === tab.id ? '500' : '400',
                                            border: 'none',
                                            background: 'none'
                                        }}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Report Content */}
                <div className="card-body p-0">
                    {error && (
                        <div className="alert alert-danger m-4" role="alert">
                            {error}
                        </div>
                    )}

                    {!error && reportData && (
                        <>
                            {activeTab === 'service' && (
                                <ServiceReport 
                                    data={reportData} 
                                    formatCurrency={formatCurrency}
                                />
                            )}
                            {activeTab === 'customer' && (
                                <CustomerReport 
                                    data={reportData} 
                                    formatCurrency={formatCurrency}
                                />
                            )}
                            {activeTab === 'driver' && (
                                <DriverReport 
                                    data={reportData} 
                                    formatCurrency={formatCurrency}
                                />
                            )}
                            {activeTab === 'summary' && (
                                <SummaryReport 
                                    data={reportData} 
                                    formatCurrency={formatCurrency}
                                />
                            )}
                        </>
                    )}

                    {!error && !reportData && !loading && (
                        <div className="text-center py-5 text-muted">
                            <BarChart3 size={48} className="mb-3 opacity-50" />
                            <p>No data available for the selected filters</p>
                            <p className="small">Try adjusting your date range or filter criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Service Report Component
const ServiceReport = ({ data, formatCurrency }) => {
    if (!data || !data.services) return null;

    const totalRevenue = data.services.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
    const totalInvoices = data.services.reduce((sum, s) => sum + (s.invoiceCount || 0), 0);
    const totalQuantity = data.services.reduce((sum, s) => sum + (s.quantity || 0), 0);

    return (
        <>
            {/* Summary Cards */}
            <div className="row g-3 p-4 pb-3">
                <div className="col-md-4">
                    <div className="card border-0 bg-primary bg-opacity-10">
                        <div className="card-body py-3">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted small mb-1">Total Revenue</p>
                                    <h4 className="mb-0 text-primary fw-bold">{formatCurrency(totalRevenue)}</h4>
                                </div>
                                <DollarSign size={32} className="text-primary opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 bg-success bg-opacity-10">
                        <div className="card-body py-3">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted small mb-1">Total Invoices</p>
                                    <h4 className="mb-0 text-success fw-bold">{totalInvoices}</h4>
                                </div>
                                <TrendingUp size={32} className="text-success opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 bg-info bg-opacity-10">
                        <div className="card-body py-3">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted small mb-1">Total Quantity</p>
                                    <h4 className="mb-0 text-info fw-bold">{totalQuantity}</h4>
                                </div>
                                <Package size={32} className="text-info opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Service Name</th>
                            <th className="px-4 py-3 text-end">Quantity</th>
                            <th className="px-4 py-3 text-end">Total Revenue</th>
                            <th className="px-4 py-3 text-end">Average Price</th>
                            <th className="px-4 py-3 text-end">Invoices</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.services.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-muted">
                                    No services found for the selected period
                                </td>
                            </tr>
                        ) : (
                            data.services.map((service, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3 fw-medium">{service.serviceName}</td>
                                    <td className="px-4 py-3 text-end">{service.quantity || 0}</td>
                                    <td className="px-4 py-3 text-end fw-bold">{formatCurrency(service.totalRevenue)}</td>
                                    <td className="px-4 py-3 text-end text-muted">{formatCurrency(service.averagePrice)}</td>
                                    <td className="px-4 py-3 text-end">{service.invoiceCount || 0}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {data.services.length > 0 && (
                        <tfoot className="table-light fw-bold">
                            <tr>
                                <td className="px-4 py-3">Total</td>
                                <td className="px-4 py-3 text-end">{totalQuantity}</td>
                                <td className="px-4 py-3 text-end">{formatCurrency(totalRevenue)}</td>
                                <td className="px-4 py-3 text-end">{formatCurrency(totalRevenue / totalQuantity || 0)}</td>
                                <td className="px-4 py-3 text-end">{totalInvoices}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </>
    );
};

// Customer Report Component
const CustomerReport = ({ data, formatCurrency }) => {
    if (!data || !data.customers) return null;

    const totalRevenue = data.customers.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
    const totalInvoices = data.customers.reduce((sum, c) => sum + (c.invoiceCount || 0), 0);
    const totalOutstanding = data.customers.reduce((sum, c) => sum + (c.outstanding || 0), 0);

    return (
        <>
            {/* Summary Cards */}
            <div className="row g-3 p-4 pb-3">
                <div className="col-md-4">
                    <div className="card border-0 bg-primary bg-opacity-10">
                        <div className="card-body py-3">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted small mb-1">Total Revenue</p>
                                    <h4 className="mb-0 text-primary fw-bold">{formatCurrency(totalRevenue)}</h4>
                                </div>
                                <DollarSign size={32} className="text-primary opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 bg-success bg-opacity-10">
                        <div className="card-body py-3">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted small mb-1">Total Invoices</p>
                                    <h4 className="mb-0 text-success fw-bold">{totalInvoices}</h4>
                                </div>
                                <Users size={32} className="text-success opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 bg-danger bg-opacity-10">
                        <div className="card-body py-3">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted small mb-1">Outstanding</p>
                                    <h4 className="mb-0 text-danger fw-bold">{formatCurrency(totalOutstanding)}</h4>
                                </div>
                                <TrendingUp size={32} className="text-danger opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Customer Name</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3 text-end">Revenue</th>
                            <th className="px-4 py-3 text-end">Invoices</th>
                            <th className="px-4 py-3 text-end">Avg. Invoice</th>
                            <th className="px-4 py-3 text-end">Outstanding</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.customers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">
                                    No customers found for the selected period
                                </td>
                            </tr>
                        ) : (
                            data.customers.map((customer, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3 fw-medium">{customer.customerName}</td>
                                    <td className="px-4 py-3">
                                        <div className="small">
                                            {customer.email && <div className="text-muted">{customer.email}</div>}
                                            {customer.phone && <div className="text-muted">{customer.phone}</div>}
                                            {!customer.email && !customer.phone && <span className="text-muted">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-end fw-bold">{formatCurrency(customer.totalRevenue)}</td>
                                    <td className="px-4 py-3 text-end">{customer.invoiceCount || 0}</td>
                                    <td className="px-4 py-3 text-end text-muted">{formatCurrency(customer.averageInvoice)}</td>
                                    <td className="px-4 py-3 text-end">
                                        {customer.outstanding > 0 ? (
                                            <span className="text-danger fw-medium">{formatCurrency(customer.outstanding)}</span>
                                        ) : (
                                            <span className="text-success">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {data.customers.length > 0 && (
                        <tfoot className="table-light fw-bold">
                            <tr>
                                <td className="px-4 py-3" colSpan="2">Total</td>
                                <td className="px-4 py-3 text-end">{formatCurrency(totalRevenue)}</td>
                                <td className="px-4 py-3 text-end">{totalInvoices}</td>
                                <td className="px-4 py-3 text-end">{formatCurrency(totalRevenue / totalInvoices || 0)}</td>
                                <td className="px-4 py-3 text-end text-danger">{formatCurrency(totalOutstanding)}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </>
    );
};

// Driver Report Component
const DriverReport = ({ data, formatCurrency }) => {
    if (!data || !data.drivers) return null;

    const totalInvoices = data.drivers.reduce((sum, d) => sum + (d.invoiceCount || 0), 0);
    const totalRevenue = data.drivers.reduce((sum, d) => sum + (d.totalRevenue || 0), 0);

    return (
        <>
            {/* Summary Cards */}
            <div className="row g-3 p-4 pb-3">
                <div className="col-md-6">
                    <div className="card border-0 bg-primary bg-opacity-10">
                        <div className="card-body py-3">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted small mb-1">Total Revenue</p>
                                    <h4 className="mb-0 text-primary fw-bold">{formatCurrency(totalRevenue)}</h4>
                                </div>
                                <DollarSign size={32} className="text-primary opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 bg-success bg-opacity-10">
                        <div className="card-body py-3">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted small mb-1">Total Invoices</p>
                                    <h4 className="mb-0 text-success fw-bold">{totalInvoices}</h4>
                                </div>
                                <Users size={32} className="text-success opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Driver Name</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3 text-end">Total Revenue</th>
                            <th className="px-4 py-3 text-end">Invoices</th>
                            <th className="px-4 py-3 text-end">Avg. Invoice</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.drivers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4 text-muted">
                                    No drivers found for the selected period
                                </td>
                            </tr>
                        ) : (
                            data.drivers.map((driver, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3 fw-medium">{driver.driverName}</td>
                                    <td className="px-4 py-3 text-muted">{driver.phone || '-'}</td>
                                    <td className="px-4 py-3 text-end fw-bold">{formatCurrency(driver.totalRevenue)}</td>
                                    <td className="px-4 py-3 text-end">{driver.invoiceCount || 0}</td>
                                    <td className="px-4 py-3 text-end text-muted">{formatCurrency(driver.averageInvoice)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {data.drivers.length > 0 && (
                        <tfoot className="table-light fw-bold">
                            <tr>
                                <td className="px-4 py-3" colSpan="2">Total</td>
                                <td className="px-4 py-3 text-end">{formatCurrency(totalRevenue)}</td>
                                <td className="px-4 py-3 text-end">{totalInvoices}</td>
                                <td className="px-4 py-3 text-end">{formatCurrency(totalRevenue / totalInvoices || 0)}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </>
    );
};

// Summary Report Component
const SummaryReport = ({ data, formatCurrency }) => {
    if (!data) return null;

    return (
        <>
            {/* Summary Cards */}
            <div className="row g-3 p-4 pb-3">
                <div className="col-md-3">
                    <div className="card border-0 bg-primary bg-opacity-10">
                        <div className="card-body py-3">
                            <p className="text-muted small mb-1">Total Revenue</p>
                            <h4 className="mb-0 text-primary fw-bold">{formatCurrency(data.totalRevenue || 0)}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 bg-success bg-opacity-10">
                        <div className="card-body py-3">
                            <p className="text-muted small mb-1">Total Invoices</p>
                            <h4 className="mb-0 text-success fw-bold">{data.totalInvoices || 0}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 bg-warning bg-opacity-10">
                        <div className="card-body py-3">
                            <p className="text-muted small mb-1">Paid Amount</p>
                            <h4 className="mb-0 text-warning fw-bold">{formatCurrency(data.totalPaid || 0)}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 bg-danger bg-opacity-10">
                        <div className="card-body py-3">
                            <p className="text-muted small mb-1">Outstanding</p>
                            <h4 className="mb-0 text-danger fw-bold">{formatCurrency(data.totalOutstanding || 0)}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="row g-0 border-top">
                <div className="col-md-6 border-end">
                    <div className="p-4">
                        <h6 className="fw-bold text-muted text-uppercase small mb-3">Status Breakdown</h6>
                        <table className="table table-sm mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="py-2">Status</th>
                                    <th className="py-2 text-end">Count</th>
                                    <th className="py-2 text-end">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.statusBreakdown?.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center text-muted py-3">No data</td></tr>
                                ) : (
                                    data.statusBreakdown?.map((status, index) => (
                                        <tr key={index}>
                                            <td className="py-2">
                                                <span className={`badge ${
                                                    status.status === 'paid' ? 'bg-success' :
                                                    status.status === 'partial' ? 'bg-warning text-dark' : 'bg-danger'
                                                }`}>
                                                    {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-2 text-end">{status.count}</td>
                                            <td className="py-2 text-end fw-medium">{formatCurrency(status.amount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="p-4">
                        <h6 className="fw-bold text-muted text-uppercase small mb-3">Top Services</h6>
                        <table className="table table-sm mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="py-2">Service</th>
                                    <th className="py-2 text-end">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topServices?.length === 0 ? (
                                    <tr><td colSpan="2" className="text-center text-muted py-3">No data</td></tr>
                                ) : (
                                    data.topServices?.slice(0, 5).map((service, index) => (
                                        <tr key={index}>
                                            <td className="py-2">{service.serviceName}</td>
                                            <td className="py-2 text-end fw-medium">{formatCurrency(service.revenue)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Reports;
