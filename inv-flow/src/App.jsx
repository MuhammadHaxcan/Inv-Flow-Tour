import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { FileText, Building2, FileCheck2, CheckCircle, CreditCard } from 'lucide-react'
import './App.css'
import GenerateInvoice from './pages/GenerateInvoice'
import ChartOfAccounts from './pages/ChartOfAccounts'
import OpenInvoices from './pages/OpenInvoices'
import ClosedInvoices from './pages/ClosedInvoices'
import BankTransactions from './pages/BankTransactions'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <div className="min-vh-100 bg-light d-flex flex-column">
            {/* Navbar - removed sticky-top */}
            <nav className="bg-white border-bottom shadow-sm w-100">
                <div className="px-4">
                    <div className="d-flex align-items-center justify-content-between py-3">
                        <div className="d-flex align-items-center">
                            <h1 className="h3 fw-bold mb-0 text-primary me-5">Inv-Flow</h1>
                            <div className="d-flex">
                                <NavLink
                                    to="/generateinvoice"
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-decoration-none d-flex align-items-center gap-2 ${isActive
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-secondary'
                                        }`
                                    }
                                >
                                    <FileText size={18} />
                                    Generate Invoice
                                </NavLink>
                                <NavLink
                                    to="/open-invoices"
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-decoration-none d-flex align-items-center gap-2 ${isActive
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-secondary'
                                        }`
                                    }
                                >
                                    <FileCheck2 size={18} />
                                    Open Invoices
                                </NavLink>
                                <NavLink
                                    to="/closed-invoices"
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-decoration-none d-flex align-items-center gap-2 ${isActive
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-secondary'
                                        }`
                                    }
                                >
                                    <CheckCircle size={18} />
                                    Closed Invoices
                                </NavLink>
                                <NavLink
                                    to="/bank-transactions"
                                    className={({ isActive }) =>
                                        `px-4 py-2 text-decoration-none d-flex align-items-center gap-2 ${isActive
                                            ? 'text-primary border-bottom border-2 border-primary'
                                            : 'text-secondary'
                                        }`
                                    }
                                >
                                    <CreditCard size={18} />
                                    Bank Transactions
                                </NavLink>
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
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <div className="flex-grow-1">
                <Routes>
                    <Route path="/" element={<Navigate to="/generateinvoice" replace />} />
                    <Route path="/generateinvoice" element={<GenerateInvoice />} />
                    <Route path="/open-invoices" element={<OpenInvoices />} />
                    <Route path="/closed-invoices" element={<ClosedInvoices />} />
                    <Route path="/bank-transactions" element={<BankTransactions />} />
                    <Route path="/accounts" element={<ChartOfAccounts />} />
                </Routes>
            </div>
        </div>
    )
}

export default App