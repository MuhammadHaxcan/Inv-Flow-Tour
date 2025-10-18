import { Routes, Route, NavLink } from 'react-router-dom'
import { FileText, Building2, FileCheck2 } from 'lucide-react'
import './App.css'
import GenerateInvoice from './pages/GenerateInvoice'
import ChartOfAccounts from './pages/ChartOfAccounts'
import OpenInvoices from './pages/OpenInvoices'

function App() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <h1 className="text-xl font-bold text-gray-900">Inv-Flow</h1>
                            <div className="flex gap-1">
                                <NavLink
                                    to="/"
                                    className={({ isActive }) =>
                                        `px-4 py-2 font-medium flex items-center gap-2 ${isActive
                                            ? 'text-gray-900 border-b-2 border-gray-900'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`
                                    }
                                >
                                    <FileText size={18} />
                                    Generate Invoice
                                </NavLink>
                                <NavLink
                                    to="/open-invoices"
                                    className={({ isActive }) =>
                                        `px-4 py-2 font-medium flex items-center gap-2 ${isActive
                                            ? 'text-gray-900 border-b-2 border-gray-900'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`
                                    }
                                >
                                    <FileCheck2 size={18} />
                                    Open Invoices
                                </NavLink>
                                <NavLink
                                    to="/accounts"
                                    className={({ isActive }) =>
                                        `px-4 py-2 font-medium flex items-center gap-2 ${isActive
                                            ? 'text-gray-900 border-b-2 border-gray-900'
                                            : 'text-gray-500 hover:text-gray-700'
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
            <div className="flex-1">
                <Routes>
                    <Route path="/" element={<GenerateInvoice />} />
                    <Route path="/open-invoices" element={<OpenInvoices />} />
                    <Route path="/accounts" element={<ChartOfAccounts />} />
                </Routes>
            </div>
        </div>
    )
}

export default App