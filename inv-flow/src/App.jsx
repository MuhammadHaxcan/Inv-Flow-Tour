import { lazy, Suspense } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { FileText, Building2, FileCheck2, CheckCircle, CreditCard, Tag, Calendar, Users, LogOut, BarChart3 } from 'lucide-react'
import './App.css'
import { DataProvider } from './contexts/DataContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import 'bootstrap/dist/css/bootstrap.min.css';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const GenerateInvoice = lazy(() => import('./pages/GenerateInvoice'));
const ChartOfAccounts = lazy(() => import('./pages/ChartOfAccounts'));
const OpenInvoices = lazy(() => import('./pages/OpenInvoices'));
const ClosedInvoices = lazy(() => import('./pages/ClosedInvoices'));
const BankStatement = lazy(() => import('./pages/BankStatement'));
const Services = lazy(() => import('./pages/Services'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
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

function ProtectedRoute({ children, requiredPermission }) {
    const { isAuthenticated, hasPermission, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="alert alert-danger" role="alert">
                    You don't have permission to access this page.
                </div>
            </div>
        );
    }

    return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function Navbar() {
    const { user, logout, hasPermission, hasAnyPermission } = useAuth();

    const canAccessInvoices = hasAnyPermission(['invoices.read', 'invoices.write']);
    const canAccessServices = hasAnyPermission(['services.read', 'services.write']);
    const canAccessAccounts = hasAnyPermission(['accounts.read', 'accounts.write']);
    const canAccessTransactions = hasPermission('transactions.read');
    const canAccessAdmin = hasAnyPermission(['users.read', 'roles.read', 'permissions.read']);

    return (
        <nav className="bg-white border-bottom shadow-sm w-100">
            <div className="px-4">
                <div className="d-flex align-items-center justify-content-between py-3">
                    <div className="d-flex align-items-center">
                        <h1 className="h3 fw-bold mb-0 text-primary me-5">Inv-Flow</h1>
                        <div className="d-flex">
                            {canAccessInvoices && (
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
                                        {hasPermission('invoices.write') && (
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
                                        {hasPermission('invoices.read') && (
                                            <>
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
                                            </>
                                        )}
                                    </ul>
                                </div>
                            )}
                            {hasPermission('invoices.read') && (
                                <NavLink
                                    to="/calendar"
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-decoration-none d-flex align-items-center gap-2 ${isActive
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-secondary'
                                        }`
                                    }
                                >
                                    <Calendar size={18} />
                                    Calendar
                                </NavLink>
                            )}
                            {canAccessTransactions && (
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
                            {canAccessServices && (
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
                            {canAccessAccounts && (
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
                            {hasPermission('invoices.read') && (
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
                                <ProtectedRoute requiredPermission="invoices.read">
                                    <Navigate to="/generateinvoice" replace />
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
                                <ProtectedRoute requiredPermission="invoices.read">
                                    <ClosedInvoices />
                                </ProtectedRoute>
                            } />
                            <Route path="/calendar" element={
                                <ProtectedRoute requiredPermission="invoices.read">
                                    <CalendarView />
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
                                <ProtectedRoute requiredPermission="users.read">
                                    <Admin />
                                </ProtectedRoute>
                            } />
                            <Route path="/reports" element={
                                <ProtectedRoute requiredPermission="invoices.read">
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
