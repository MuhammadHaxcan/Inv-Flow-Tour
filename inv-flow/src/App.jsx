import { lazy, Suspense } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { FileText, Building2, FileCheck2, CheckCircle, CreditCard, Tag, Calendar, Users, LogOut, BarChart3, Receipt, Truck } from 'lucide-react'
import './App.css'
import { DataProvider } from './contexts/DataContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { usePermissions } from './hooks/usePermissions'
import 'bootstrap/dist/css/bootstrap.min.css';

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
    const { user, logout } = useAuth();
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

    // Check if user has any invoice-related permissions
    const showInvoicesDropdown = canReadInvoices || canWriteInvoices || canReadClosedInvoices;

    return (
        <nav className="bg-white border-bottom shadow-sm w-100">
            <div className="px-4">
                <div className="d-flex align-items-center justify-content-between py-3">
                    <div className="d-flex align-items-center">
                        <h1 className="h3 fw-bold mb-0 text-primary me-5">Inv-Flow</h1>
                        <div className="d-flex">
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
        </nav>
    );
}

function AppContent() {
    return (
        <DataProvider>
            <div className="min-vh-100 bg-light d-flex flex-column">
                <Navbar />
                <div className="flex-grow-1">
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/" element={
                                <ProtectedRoute requiredPermissions={['invoices.read', 'invoices.write']}>
                                    <Navigate to="/open-invoices" replace />
                                </ProtectedRoute>
                            } />
                            <Route path="/generateinvoice" element={
                                <ProtectedRoute requiredPermission="invoices.write">
                                    <GenerateInvoice />
                                </ProtectedRoute>
                            } />
                            <Route path="/open-invoices" element={
                                <ProtectedRoute requiredPermission="invoices.read">
                                    <OpenInvoices />
                                </ProtectedRoute>
                            } />
                            <Route path="/closed-invoices" element={
                                <ProtectedRoute requiredPermission="closedinvoices.read">
                                    <ClosedInvoices />
                                </ProtectedRoute>
                            } />
                            <Route path="/outstanding-expenses" element={
                                <ProtectedRoute requiredPermission="invoices.read">
                                    <OutstandingExpenses />
                                </ProtectedRoute>
                            } />
                            <Route path="/calendar" element={
                                <ProtectedRoute requiredPermission="invoices.read">
                                    <CalendarView />
                                </ProtectedRoute>
                            } />
                            <Route path="/driver-schedule" element={
                                <ProtectedRoute requiredPermission="invoices.read">
                                    <DriverSchedule />
                                </ProtectedRoute>
                            } />
                            <Route path="/bank-statement" element={
                                <ProtectedRoute requiredPermission="transactions.read">
                                    <BankStatement />
                                </ProtectedRoute>
                            } />
                            <Route path="/services" element={
                                <ProtectedRoute requiredPermission="services.read">
                                    <Services />
                                </ProtectedRoute>
                            } />
                            <Route path="/accounts" element={
                                <ProtectedRoute requiredPermission="accounts.read">
                                    <ChartOfAccounts />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin" element={
                                <ProtectedRoute requiredPermissions={['users.read', 'roles.read', 'permissions.read']}>
                                    <Admin />
                                </ProtectedRoute>
                            } />
                            <Route path="/reports" element={
                                <ProtectedRoute requiredPermission="reports.read">
                                    <Reports />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </Suspense>
                </div>
            </div>
        </DataProvider>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
