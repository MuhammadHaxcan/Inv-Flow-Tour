import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { FileText, Building2, FileCheck2, CheckCircle, CreditCard, Tag, Calendar, Users, LogOut, BarChart3, Receipt, Truck, Menu, X } from 'lucide-react'
import './App.css'
import { InvoiceProvider, useInvoice } from './contexts/InvoiceContext'
import { TransactionProvider, useTransaction } from './contexts/TransactionContext'
import { ServicesProvider, useServices } from './contexts/ServicesContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AdminProvider } from './contexts/AdminContext'
import { usePermissions } from './hooks/usePermissions'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingOverlay from './components/LoadingOverlay'

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const GenerateInvoice = lazy(() => import('./pages/GenerateInvoice'));
const ChartOfAccounts = lazy(() => import('./pages/ChartOfAccounts'));
const OpenInvoices = lazy(() => import('./pages/OpenInvoices'));
const ClosedInvoices = lazy(() => import('./pages/ClosedInvoices'));
const OutstandingExpenses = lazy(() => import('./pages/OutstandingExpenses'));
const BankStatement = lazy(() => import('./pages/BankStatement'));
const Services = lazy(() => import('./pages/Services'));
const CalendarView = lazy(() => import('./pages/CalendarView'));  
const DriverSchedule = lazy(() => import('./pages/DriverSchedule'));
const Admin = lazy(() => import('./pages/Admin'));
const Reports = lazy(() => import('./pages/Reports'));

// Loading component
const PageLoader = () => (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading page...</p>
        </div>
    </div>
);

// Home redirect component that handles authentication loading properly
const HomeRedirect = () => {
    const { isAuthenticated, loading } = useAuth();

    // If still loading authentication state, show a brief loading message
    // but don't keep the user stuck - allow navigation to proceed
    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Checking authentication...</span>
                    </div>
                    <p className="text-muted">Checking authentication...</p>
                    <small className="text-muted">If this takes too long, try refreshing the page</small>
                </div>
            </div>
        );
    }

    // Redirect based on authentication state
    // Use replace to avoid building up history
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Navigate to="/open-invoices" replace />;
};

function ProtectedRoute({ children, requiredPermission, requiredPermissions }) {
    const { isAuthenticated, hasPermission, hasAnyPermission, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check for single permission or array of permissions
    const hasAccess = requiredPermission 
        ? hasPermission(requiredPermission)
        : requiredPermissions 
            ? hasAnyPermission(requiredPermissions)
            : true;

    if (!hasAccess) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="alert alert-danger" role="alert">
                        <h5 className="alert-heading">Access Denied</h5>
                        <p className="mb-0">You don't have permission to access this page.</p>
                    </div>
                    <NavLink to="/" className="btn btn-primary mt-3">
                        Go to Home
                    </NavLink>
                </div>
            </div>
        );
    }

    return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
    const { companySettings, loadCompanySettings } = useInvoice();
    const {
        // Invoice permissions
        canReadInvoices,
        canWriteInvoices,
        canReadClosedInvoices,

        // Service permissions
        canReadServices,

        // Account permissions
        canReadAccounts,

        // Transaction permissions
        canReadTransactions,

        // Report permissions
        canReadReports,

        // Admin permissions
        canReadUsers,
        canReadRoles,
        canReadPermissions,

        // Composite permissions
        canAccessAdmin,
        canManageInvoices,
        canManageServices,
        canManageAccounts
    } = usePermissions();
    const companyName = companySettings?.companyName || 'SKT-Tourisn';
    const logoSrc = companySettings?.logoImageData;

    useEffect(() => {
        if (!isAuthenticated) return;
        loadCompanySettings();
    }, [isAuthenticated, loadCompanySettings]);

    // Hide navbar (and logout) when user is not authenticated or still loading
    if (!isAuthenticated || authLoading) {
        return null;
    }

    // Check if user has any invoice-related permissions
    const showInvoicesDropdown = canReadInvoices || canWriteInvoices || canReadClosedInvoices;

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Close mobile menu when clicking a link
    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white border-bottom shadow-sm w-100">
            <div className="px-4">
                <div className="d-flex align-items-center justify-content-between py-3">
                    <div className="d-flex align-items-center">
                        {logoSrc ? (
                            <img
                                src={logoSrc}
                                alt={companyName}
                                style={{ maxHeight: '60px', width: 'auto', objectFit: 'contain' }}
                                className="me-3"
                            />
                        ) : (
                            <h1 className="h3 fw-bold mb-0 text-primary me-5">{companyName}</h1>
                        )}

                        {/* Hamburger menu button - visible on mobile */}
                        <button
                            className="btn btn-outline-secondary d-lg-none me-3"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        {/* Desktop navigation - hidden on mobile */}
                        <div className="d-none d-lg-flex">
                            {showInvoicesDropdown && (
                                <div className="dropdown">
                                    <button
                                        className="btn btn-white px-4 py-2 d-flex align-items-center gap-2 text-secondary dropdown-toggle"
                                        type="button"
                                        id="invoicesDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <FileText size={18} />
                                        Invoices
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="invoicesDropdown">
                                        {canWriteInvoices && (
                                            <li>
                                                <NavLink
                                                    to="/generateinvoice"
                                                    className={({ isActive }) =>
                                                        `dropdown-item d-flex align-items-center gap-2${isActive ? ' text-primary' : ''}`
                                                    }
                                                >
                                                    <FileText size={18} />
                                                    Generate Invoice
                                                </NavLink>
                                            </li>
                                        )}
                                        {canReadInvoices && (
                                            <li>
                                                <NavLink
                                                    to="/open-invoices"
                                                    className={({ isActive }) =>
                                                        `dropdown-item d-flex align-items-center gap-2${isActive ? ' text-primary' : ''}`
                                                    }
                                                >
                                                    <FileCheck2 size={18} />
                                                    Open Invoices
                                                </NavLink>
                                            </li>
                                        )}
                                        {canReadClosedInvoices && (
                                            <li>
                                                <NavLink
                                                    to="/closed-invoices"
                                                    className={({ isActive }) =>
                                                        `dropdown-item d-flex align-items-center gap-2${isActive ? ' text-primary' : ''}`
                                                    }
                                                >
                                                    <CheckCircle size={18} />
                                                    Closed Invoices
                                                </NavLink>
                                            </li>
                                        )}
                                        {canReadInvoices && (
                                            <>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li>
                                                    <NavLink
                                                        to="/outstanding-expenses"
                                                        className={({ isActive }) =>
                                                            `dropdown-item d-flex align-items-center gap-2${isActive ? ' text-primary' : ''}`
                                                        }
                                                    >
                                                        <Receipt size={18} />
                                                        Outstanding Expenses
                                                    </NavLink>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            )}
                            {canReadInvoices && (
                                <div className="dropdown">
                                    <button
                                        className="btn btn-white px-4 py-2 d-flex align-items-center gap-2 text-secondary dropdown-toggle"
                                        type="button"
                                        id="calendarDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <Calendar size={18} />
                                        Calendar
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="calendarDropdown">
                                        <li>
                                            <NavLink
                                                to="/calendar"
                                                className={({ isActive }) =>
                                                    `dropdown-item d-flex align-items-center gap-2${isActive ? ' text-primary' : ''}`
                                                }
                                            >
                                                <Calendar size={18} />
                                                Invoice Calendar
                                            </NavLink>
                                        </li>
                                        <li>
                                            <NavLink
                                                to="/driver-schedule"
                                                className={({ isActive }) =>
                                                    `dropdown-item d-flex align-items-center gap-2${isActive ? ' text-primary' : ''}`
                                                }
                                            >
                                                <Truck size={18} />
                                                Driver Schedule
                                            </NavLink>
                                        </li>
                                    </ul>
                                </div>
                            )}
                            {canReadTransactions && (
                                <NavLink
                                    to="/bank-statement"
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-decoration-none d-flex align-items-center gap-2 ${isActive
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-secondary'
                                        }`
                                    }
                                >
                                    <CreditCard size={18} />
                                    Bank Statement
                                </NavLink>
                            )}
                            {canReadServices && (
                                <NavLink
                                    to="/services"
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-decoration-none d-flex align-items-center gap-2 ${isActive
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-secondary'
                                        }`
                                    }
                                >
                                    <Tag size={18} />
                                    Services
                                </NavLink>
                            )}
                            {canReadAccounts && (
                                <NavLink
                                    to="/accounts"
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-decoration-none d-flex align-items-center gap-2 ${isActive
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-secondary'
                                        }`
                                    }
                                >
                                    <Building2 size={18} />
                                    Chart of Accounts
                                </NavLink>
                            )}
                            {canReadReports && (
                                <NavLink
                                    to="/reports"
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-decoration-none d-flex align-items-center gap-2 ${isActive
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-secondary'
                                        }`
                                    }
                                >
                                    <BarChart3 size={18} />
                                    Reports
                                </NavLink>
                            )}
                            {canAccessAdmin && (
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-decoration-none d-flex align-items-center gap-2 ${isActive
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-secondary'
                                        }`
                                    }
                                >
                                    <Users size={18} />
                                    Admin
                                </NavLink>
                            )}
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        {/* Desktop user info and logout - hidden on mobile */}
                        <div className="d-none d-lg-flex align-items-center gap-3">
                            {user && (
                                <span className="text-secondary">
                                    {user.fullName || user.username}
                                </span>
                            )}
                            <button
                                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={logout}
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-index-1050" onClick={closeMobileMenu}>
                <div className="bg-white h-100 w-75 shadow-lg" style={{ maxWidth: '300px' }} onClick={(e) => e.stopPropagation()}>
                    <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
                        <span className="fw-bold text-primary">Menu</span>
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={closeMobileMenu}
                            aria-label="Close menu"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="p-3">
                        <div className="d-flex flex-column gap-2">
                            {showInvoicesDropdown && (
                                <div className="mb-3">
                                    <div className="fw-medium text-secondary mb-2 d-flex align-items-center gap-2">
                                        <FileText size={18} />
                                        Invoices
                                    </div>
                                    <div className="ms-3 d-flex flex-column gap-1">
                                        {canWriteInvoices && (
                                            <NavLink
                                                to="/generateinvoice"
                                                className={({ isActive }) =>
                                                    `text-decoration-none px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                                                }
                                                onClick={closeMobileMenu}
                                            >
                                                Generate Invoice
                                            </NavLink>
                                        )}
                                        {canReadInvoices && (
                                            <NavLink
                                                to="/open-invoices"
                                                className={({ isActive }) =>
                                                    `text-decoration-none px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                                                }
                                                onClick={closeMobileMenu}
                                            >
                                                Open Invoices
                                            </NavLink>
                                        )}
                                        {canReadClosedInvoices && (
                                            <NavLink
                                                to="/closed-invoices"
                                                className={({ isActive }) =>
                                                    `text-decoration-none px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                                                }
                                                onClick={closeMobileMenu}
                                            >
                                                Closed Invoices
                                            </NavLink>
                                        )}
                                        {canReadInvoices && (
                                            <NavLink
                                                to="/outstanding-expenses"
                                                className={({ isActive }) =>
                                                    `text-decoration-none px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                                                }
                                                onClick={closeMobileMenu}
                                            >
                                                Outstanding Expenses
                                            </NavLink>
                                        )}
                                    </div>
                                </div>
                            )}

                            {canReadInvoices && (
                                <div className="mb-3">
                                    <div className="fw-medium text-secondary mb-2 d-flex align-items-center gap-2">
                                        <Calendar size={18} />
                                        Calendar
                                    </div>
                                    <div className="ms-3 d-flex flex-column gap-1">
                                        <NavLink
                                            to="/calendar"
                                            className={({ isActive }) =>
                                                `text-decoration-none px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                                            }
                                            onClick={closeMobileMenu}
                                        >
                                            Invoice Calendar
                                        </NavLink>
                                        <NavLink
                                            to="/driver-schedule"
                                            className={({ isActive }) =>
                                                `text-decoration-none px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                                            }
                                            onClick={closeMobileMenu}
                                        >
                                            Driver Schedule
                                        </NavLink>
                                    </div>
                                </div>
                            )}

                            {canReadTransactions && (
                                <NavLink
                                    to="/bank-statement"
                                    className={({ isActive }) =>
                                        `text-decoration-none px-3 py-2 rounded d-flex align-items-center gap-2 mb-2 ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                                    }
                                    onClick={closeMobileMenu}
                                >
                                    <CreditCard size={18} />
                                    Bank Statement
                                </NavLink>
                            )}

                            {canReadServices && (
                                <NavLink
                                    to="/services"
                                    className={({ isActive }) =>
                                        `text-decoration-none px-3 py-2 rounded d-flex align-items-center gap-2 mb-2 ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                                    }
                                    onClick={closeMobileMenu}
                                >
                                    <Tag size={18} />
                                    Services
                                </NavLink>
                            )}

                            {canReadAccounts && (
                                <NavLink
                                    to="/accounts"
                                    className={({ isActive }) =>
                                        `text-decoration-none px-3 py-2 rounded d-flex align-items-center gap-2 mb-2 ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                                    }
                                    onClick={closeMobileMenu}
                                >
                                    <Building2 size={18} />
                                    Chart of Accounts
                                </NavLink>
                            )}

                            {canReadReports && (
                                <NavLink
                                    to="/reports"
                                    className={({ isActive }) =>
                                        `text-decoration-none px-3 py-2 rounded d-flex align-items-center gap-2 mb-2 ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                                    }
                                    onClick={closeMobileMenu}
                                >
                                    <BarChart3 size={18} />
                                    Reports
                                </NavLink>
                            )}

                            {canAccessAdmin && (
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) =>
                                        `text-decoration-none px-3 py-2 rounded d-flex align-items-center gap-2 mb-2 ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                                    }
                                    onClick={closeMobileMenu}
                                >
                                    <Users size={18} />
                                    Admin
                                </NavLink>
                            )}

                            <hr className="my-3" />
                            <div className="d-flex align-items-center justify-content-between">
                                <span className="text-secondary">
                                    {user?.fullName || user?.username}
                                </span>
                                <button
                                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                                    onClick={() => {
                                        closeMobileMenu();
                                        logout();
                                    }}
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </nav>
    );
}

function AppContent() {
    const GlobalLoadingOverlay = () => {
        // Aggregate loading states from all contexts
        const invoiceContext = useInvoice();
        const transactionContext = useTransaction();
        const servicesContext = useServices();

        // Collect active loading flags with context prefixes so we can see what's stuck
        const activeFlags = [
            // Only show critical global loading states, not page-specific ones
            // Exclude: openInvoices, closedInvoices, customers, drivers, services, accounts, expenses, vendors, companySettings, nextInvoiceNumber
            ...Object.entries(invoiceContext.loadingStates || {})
                .filter(([k, v]) => !!v && !['openInvoices', 'closedInvoices', 'customers', 'drivers', 'services', 'accounts', 'expenses', 'vendors', 'companySettings', 'nextInvoiceNumber'].includes(k))
                .map(([k]) => `invoice.${k}`),
            ...Object.entries(transactionContext.loadingStates || {}).filter(([, v]) => !!v).map(([k]) => `transaction.${k}`),
            ...Object.entries(servicesContext.loadingStates || {}).filter(([, v]) => !!v).map(([k]) => `services.${k}`),
        ];

        const isLoading = activeFlags.length > 0;
        const message = activeFlags.length
            ? `Loading: ${activeFlags.slice(0, 4).join(', ')}${activeFlags.length > 4 ? '…' : ''}`
            : 'Loading data...';

        return <LoadingOverlay active={isLoading} message={message} />;
    };

    return (
        <AdminProvider>
            <InvoiceProvider>
                <TransactionProvider>
                    <ServicesProvider>
                        <div className="min-vh-100 bg-light d-flex flex-column">
                        <Navbar />
                        <GlobalLoadingOverlay />
                        <div className="flex-grow-1">
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                    <Route path="/login" element={
                                        <ErrorBoundary>
                                            <Login />
                                        </ErrorBoundary>
                                    } />
                                    <Route path="/" element={
                                        <ErrorBoundary>
                                            <HomeRedirect />
                                        </ErrorBoundary>
                                    } />
                                    <Route path="/generateinvoice" element={
                                        <ProtectedRoute requiredPermission="invoices.write">
                                            <ErrorBoundary>
                                                <GenerateInvoice />
                                            </ErrorBoundary>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/open-invoices" element={
                                        <ProtectedRoute requiredPermission="invoices.read">
                                            <ErrorBoundary>
                                                <OpenInvoices />
                                            </ErrorBoundary>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/closed-invoices" element={
                                        <ProtectedRoute requiredPermission="closedinvoices.read">
                                            <ErrorBoundary>
                                                <ClosedInvoices />
                                            </ErrorBoundary>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/outstanding-expenses" element={
                                        <ProtectedRoute requiredPermission="invoices.read">
                                            <ErrorBoundary>
                                                <OutstandingExpenses />
                                            </ErrorBoundary>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/calendar" element={
                                        <ProtectedRoute requiredPermission="invoices.read">
                                            <ErrorBoundary>
                                                <CalendarView />
                                            </ErrorBoundary>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/driver-schedule" element={
                                        <ProtectedRoute requiredPermission="invoices.read">
                                            <ErrorBoundary>
                                                <DriverSchedule />
                                            </ErrorBoundary>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/bank-statement" element={
                                        <ProtectedRoute requiredPermission="transactions.read">
                                            <ErrorBoundary>
                                                <BankStatement />
                                            </ErrorBoundary>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/services" element={
                                        <ProtectedRoute requiredPermission="services.read">
                                            <ErrorBoundary>
                                                <Services />
                                            </ErrorBoundary>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/accounts" element={
                                        <ProtectedRoute requiredPermission="accounts.read">
                                            <ErrorBoundary>
                                                <ChartOfAccounts />
                                            </ErrorBoundary>
                                    </ProtectedRoute>
                                    } />
                                    <Route path="/admin" element={
                                        <ProtectedRoute requiredPermissions={['users.read', 'roles.read', 'permissions.read']}>
                                            <ErrorBoundary>
                                                <Admin />
                                            </ErrorBoundary>
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/reports" element={
                                        <ProtectedRoute requiredPermission="reports.read">
                                            <ErrorBoundary>
                                                <Reports />
                                            </ErrorBoundary>
                                        </ProtectedRoute>
                                    } />
                                </Routes>
                            </Suspense>
                        </div>
                        </div>
                    </ServicesProvider>
                </TransactionProvider>
            </InvoiceProvider>
        </AdminProvider>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
