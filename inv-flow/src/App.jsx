import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { FileText, Building2, FileCheck2, CheckCircle, CreditCard, Tag } from 'lucide-react'
import './App.css'
import GenerateInvoice from './pages/GenerateInvoice'
import ChartOfAccounts from './pages/ChartOfAccounts'
import OpenInvoices from './pages/OpenInvoices'
import ClosedInvoices from './pages/ClosedInvoices'
import BankTransactions from './pages/BankTransactions'
import Services from './pages/Services'
import { DataProvider } from './contexts/DataContext'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <DataProvider>
            <div className="min-vh-100 bg-light d-flex flex-column">
                {/* Navbar - removed sticky-top */}
                <nav className="bg-white border-bottom shadow-sm w-100">    
                    <div className="px-4">
                        <div className="d-flex align-items-center justify-content-between py-3">
                            <div className="d-flex align-items-center">
                                <h1 className="h3 fw-bold mb-0 text-primary me-5">Inv-Flow</h1>
                                <div className="d-flex">
                                    {/* Invoices Dropdown */}
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
                                        </ul>
                                    </div>
                                    {/* Other Nav Items */}
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
                        <Route path="/services" element={<Services />} />
                        <Route path="/accounts" element={<ChartOfAccounts />} />
                    </Routes>
                </div>
            </div>
        </DataProvider>
    )
}

export default App