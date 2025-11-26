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
    }, [activeTab, dateRange, selectedService, selectedCustomer, selectedDriver]);

    const loadReportData = async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            // Build filters object, only including non-null values
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
            // Log full error for debugging
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

    const formatDate = (date) => {
        if (!date) return '';
        // Handle both Date objects and date strings (YYYY-MM-DD)
        if (typeof date === 'string') {
            const dateObj = new Date(date + 'T00:00:00'); // Add time to avoid timezone issues
            return dateObj.toLocaleDateString();
        }
        return new Date(date).toLocaleDateString();
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
        <div className="content-wrapper py-3 px-4">
            <div className="card shadow">
                <div className="card-header bg-light py-3">
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
                        <div className="col-md-3">
                            <label className="form-label small fw-medium">Date Range</label>
                            <div className="input-group input-group-sm">
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                    className="form-control"
                                />
                                <span className="input-group-text">to</span>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                    className="form-control"
                                />
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

                        <div className="col-md-3">
                            <button
                                onClick={loadReportData}
                                className="btn btn-sm btn-primary d-flex align-items-center gap-2"
                                disabled={loading}
                            >
                                <Filter size={16} />
                                {loading ? 'Loading...' : 'Apply Filters'}
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
                                        className={`nav-link d-flex align-items-center gap-2 px-3 py-2 ${
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
                <div className="card-body p-4">
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {!error && reportData && (
                        <>
                            {activeTab === 'service' && (
                                <ServiceReport data={reportData} formatCurrency={formatCurrency} />
                            )}
                            {activeTab === 'customer' && (
                                <CustomerReport data={reportData} formatCurrency={formatCurrency} />
                            )}
                            {activeTab === 'driver' && (
                                <DriverReport data={reportData} formatCurrency={formatCurrency} />
                            )}
                            {activeTab === 'summary' && (
                                <SummaryReport data={reportData} formatCurrency={formatCurrency} />
                            )}
                        </>
                    )}

                    {!error && !reportData && !loading && (
                        <div className="text-center py-5 text-muted">
                            <BarChart3 size={48} className="mb-3 opacity-50" />
                            <p>No data available for the selected filters</p>
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
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Revenue</h6>
                            <h3 className="mb-0">{formatCurrency(totalRevenue)}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Invoices</h6>
                            <h3 className="mb-0">{totalInvoices}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Quantity</h6>
                            <h3 className="mb-0">{totalQuantity}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover table-striped">
                    <thead className="table-light">
                        <tr>
                            <th>Service Name</th>
                            <th className="text-end">Quantity</th>
                            <th className="text-end">Total Revenue</th>
                            <th className="text-end">Average Price</th>
                            <th className="text-end">Invoice Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.services.map((service, index) => (
                            <tr key={index}>
                                <td className="fw-medium">{service.serviceName}</td>
                                <td className="text-end">{service.quantity || 0}</td>
                                <td className="text-end fw-bold">{formatCurrency(service.totalRevenue)}</td>
                                <td className="text-end">{formatCurrency(service.averagePrice)}</td>
                                <td className="text-end">{service.invoiceCount || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="table-light fw-bold">
                        <tr>
                            <td>Total</td>
                            <td className="text-end">{totalQuantity}</td>
                            <td className="text-end">{formatCurrency(totalRevenue)}</td>
                            <td className="text-end">{formatCurrency(totalRevenue / totalQuantity || 0)}</td>
                            <td className="text-end">{totalInvoices}</td>
                        </tr>
                    </tfoot>
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

    return (
        <>
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Revenue</h6>
                            <h3 className="mb-0">{formatCurrency(totalRevenue)}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Invoices</h6>
                            <h3 className="mb-0">{totalInvoices}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover table-striped">
                    <thead className="table-light">
                        <tr>
                            <th>Customer Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th className="text-end">Total Revenue</th>
                            <th className="text-end">Invoice Count</th>
                            <th className="text-end">Average Invoice</th>
                            <th className="text-end">Outstanding</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.customers.map((customer, index) => (
                            <tr key={index}>
                                <td className="fw-medium">{customer.customerName}</td>
                                <td>{customer.email || '-'}</td>
                                <td>{customer.phone || '-'}</td>
                                <td className="text-end fw-bold">{formatCurrency(customer.totalRevenue)}</td>
                                <td className="text-end">{customer.invoiceCount || 0}</td>
                                <td className="text-end">{formatCurrency(customer.averageInvoice)}</td>
                                <td className="text-end text-danger">{formatCurrency(customer.outstanding || 0)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="table-light fw-bold">
                        <tr>
                            <td colSpan="3">Total</td>
                            <td className="text-end">{formatCurrency(totalRevenue)}</td>
                            <td className="text-end">{totalInvoices}</td>
                            <td className="text-end">{formatCurrency(totalRevenue / totalInvoices || 0)}</td>
                            <td className="text-end text-danger">
                                {formatCurrency(data.customers.reduce((sum, c) => sum + (c.outstanding || 0), 0))}
                            </td>
                        </tr>
                    </tfoot>
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
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Revenue</h6>
                            <h3 className="mb-0">{formatCurrency(totalRevenue)}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Invoices</h6>
                            <h3 className="mb-0">{totalInvoices}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover table-striped">
                    <thead className="table-light">
                        <tr>
                            <th>Driver Name</th>
                            <th>Phone</th>
                            <th className="text-end">Total Revenue</th>
                            <th className="text-end">Invoice Count</th>
                            <th className="text-end">Average Invoice</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.drivers.map((driver, index) => (
                            <tr key={index}>
                                <td className="fw-medium">{driver.driverName}</td>
                                <td>{driver.phone || '-'}</td>
                                <td className="text-end fw-bold">{formatCurrency(driver.totalRevenue)}</td>
                                <td className="text-end">{driver.invoiceCount || 0}</td>
                                <td className="text-end">{formatCurrency(driver.averageInvoice)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="table-light fw-bold">
                        <tr>
                            <td colSpan="2">Total</td>
                            <td className="text-end">{formatCurrency(totalRevenue)}</td>
                            <td className="text-end">{totalInvoices}</td>
                            <td className="text-end">{formatCurrency(totalRevenue / totalInvoices || 0)}</td>
                        </tr>
                    </tfoot>
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
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Revenue</h6>
                            <h3 className="mb-0">{formatCurrency(data.totalRevenue || 0)}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Invoices</h6>
                            <h3 className="mb-0">{data.totalInvoices || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-dark">
                        <div className="card-body">
                            <h6 className="card-title">Paid Amount</h6>
                            <h3 className="mb-0">{formatCurrency(data.totalPaid || 0)}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-danger text-white">
                        <div className="card-body">
                            <h6 className="card-title">Outstanding</h6>
                            <h3 className="mb-0">{formatCurrency(data.totalOutstanding || 0)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <h5 className="fw-bold mb-3">Status Breakdown</h5>
                    <div className="table-responsive">
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th className="text-end">Count</th>
                                    <th className="text-end">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.statusBreakdown?.map((status, index) => (
                                    <tr key={index}>
                                        <td>
                                            <span className={`badge ${
                                                status.status === 'paid' ? 'bg-success' :
                                                status.status === 'partial' ? 'bg-warning' : 'bg-danger'
                                            }`}>
                                                {status.status}
                                            </span>
                                        </td>
                                        <td className="text-end">{status.count}</td>
                                        <td className="text-end">{formatCurrency(status.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <h5 className="fw-bold mb-3">Top Services</h5>
                    <div className="table-responsive">
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th className="text-end">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topServices?.slice(0, 5).map((service, index) => (
                                    <tr key={index}>
                                        <td>{service.serviceName}</td>
                                        <td className="text-end">{formatCurrency(service.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Reports;

