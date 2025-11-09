import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const DataContext = createContext();

// Initial data
// Initial data
const initialData = {
    customers: [
        { id: 1, name: 'GlobalTech Solutions Inc.', phone: '+1-212-555-1234', email: 'contact@globaltech.com', origin: 'New York, USA' },
        { id: 2, name: 'EuroStar Holdings', phone: '+44-20-7946-0958', email: 'info@eurostar.eu', origin: 'London, UK' },
        { id: 3, name: 'Asia Pacific Ventures', phone: '+65-6789-1234', email: 'hello@apventures.sg', origin: 'Singapore' },
        { id: 4, name: 'Majid Al Futtaim Properties', phone: '+971502345678', email: 'travel@maf.ae', origin: 'Business Bay, Dubai' },
        { id: 5, name: 'RAK Tourism Authority', phone: '+971509876543', email: 'info@raktourism.ae', origin: 'Ras Al Khaimah, UAE' },
        { id: 6, name: 'Sharjah International Expo', phone: '+971506789012', email: 'logistics@sharjahexpo.ae', origin: 'Sharjah, UAE' },
        { id: 7, name: 'Ajman Beach Resort', phone: '+971503456789', email: 'concierge@ajmanbeach.ae', origin: 'Ajman, UAE' },
        { id: 8, name: 'Etihad Airways Corporate', phone: '+971508901234', email: 'corporate@etihad.ae', origin: 'Abu Dhabi Airport, UAE' }
    ],
    drivers: [
        { id: 1, name: 'Ahmed Al Mansouri', phone: '+971501111111' },
        { id: 2, name: 'Ali Hassan', phone: '+971502222222' },
        { id: 3, name: 'Mohammad Siddiqui', phone: '+971503333333' },
        { id: 4, name: 'Khalid Ibrahim', phone: '+971504444444' },
        { id: 5, name: 'Rashid Al Maktoum', phone: '+971505555555' },
        { id: 6, name: 'Omar Abdulla', phone: '+971506666666' },
        { id: 7, name: 'Youssef Ahmed', phone: '+971507777777' },
        { id: 8, name: 'Hamza Malik', phone: '+971508888888' }
    ],
    services: [
        { id: 1, name: 'Dubai Airport Transfer (DXB)', description: 'Premium pickup/drop-off service to/from Dubai International Airport', charge: 250, vatIncluded: 262.50 },
        { id: 2, name: 'Abu Dhabi Airport Transfer (AUH)', description: 'Luxury transfer service to/from Abu Dhabi Airport', charge: 350, vatIncluded: 367.50 },
        { id: 3, name: 'Dubai City Tour - Full Day', description: 'Complete Dubai sightseeing: Burj Khalifa, Dubai Mall, Palm Jumeirah, Gold Souk', charge: 450, vatIncluded: 472.50 },
        { id: 4, name: 'Abu Dhabi City Tour', description: 'Sheikh Zayed Mosque, Emirates Palace, Louvre Abu Dhabi, Corniche', charge: 500, vatIncluded: 525 },
        { id: 5, name: 'Desert Safari with BBQ', description: 'Dune bashing, camel ride, traditional BBQ dinner & entertainment', charge: 350, vatIncluded: 367.50 },
        { id: 6, name: 'Hourly Rental - 4 Hours', description: 'Luxury vehicle rental with driver for 4 hours within city limits', charge: 300, vatIncluded: 315 },
        { id: 7, name: 'Hourly Rental - 8 Hours', description: 'Full day luxury vehicle rental with professional driver', charge: 550, vatIncluded: 577.50 },
        { id: 8, name: 'Dubai to Abu Dhabi Transfer', description: 'One-way intercity transfer between Dubai and Abu Dhabi', charge: 400, vatIncluded: 420 },
        { id: 9, name: 'Sharjah City Tour', description: 'Cultural tour: Sharjah Museum, Al Noor Mosque, Heritage Area', charge: 300, vatIncluded: 315 },
        { id: 10, name: 'Hatta Mountain Tour', description: 'Day trip to Hatta: heritage village, dam, wadi activities', charge: 600, vatIncluded: 630 },
        { id: 11, name: 'Al Ain Oasis Day Trip', description: 'Visit Al Ain Zoo, Jebel Hafeet, hot springs, camel market', charge: 700, vatIncluded: 735 },
        { id: 12, name: 'Fujairah Beach & Mountain Tour', description: 'East coast tour: beaches, wadis, Fujairah Fort', charge: 650, vatIncluded: 682.50 },
        { id: 13, name: 'Wedding/Event Transfer', description: 'Premium decorated vehicle for special occasions (4 hours)', charge: 800, vatIncluded: 840 },
        { id: 14, name: 'Corporate Roadshow Service', description: 'Multi-location business tour with WiFi-enabled luxury vehicle', charge: 1200, vatIncluded: 1260 },
        { id: 15, name: 'VIP Airport Meet & Greet', description: 'Personalized assistance with immigration, luggage & luxury transfer', charge: 500, vatIncluded: 525 }
    ],
    accounts: [
        { id: 1, name: 'Cash Account', accountNumber: 'N/A', accountType: 'cash', details: 'Cash on hand' },
        { id: 2, name: 'Bank Account - HBL', accountNumber: '1234567890', accountType: 'bank', details: 'Current Account' },
        { id: 3, name: 'Bank Account - MCB', accountNumber: '0987654321', accountType: 'bank', details: 'Current Account' },
        { id: 4, name: 'Credit Card', accountNumber: '1122334455', accountType: 'bank', details: 'Company Credit Card' }
    ],
    expenses: [
        { id: 1, name: 'Fuel', defaultValue: 500 },
        { id: 2, name: 'Tolls', defaultValue: 50 },
        { id: 3, name: 'Parking', defaultValue: 30 },
        { id: 4, name: 'Tickets', defaultValue: 100 },
        { id: 5, name: 'Maintenance', defaultValue: 200 }
    ],
    openInvoices: [
        {
            id: 1,
            number: 'INV-2025-0153',
            date: '2025-10-15',
            customer: 'GlobalTech Solutions Inc.',
            persons: 3,
            driver: 'Ahmed Al Mansouri',
            total: 12500,
            paid: 5000,
            status: 'partial',
            services: [
                { id: 1, service: 'Dubai Airport Transfer (DXB)', rate: 5000 },
                { id: 2, service: 'Dubai City Tour - Full Day', rate: 7500 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 500, date: '2025-10-15' },
                { id: 2, type: 'Tolls', amount: 100, date: '2025-10-15' }
            ],
            payments: [
                { id: 1, amount: 5000, date: '2025-10-15', method: 'Cash Account', reference: 'ADV-001', vat: 0 }
            ]
        },
        {
            id: 2,
            number: 'INV-2025-0154',
            date: '2025-10-17',
            customer: 'Sharjah International Expo',
            persons: 5,
            driver: 'Ali Hassan',
            total: 9500,
            paid: 3000,
            status: 'partial',
            services: [
                { id: 1, service: 'Corporate Roadshow Service', rate: 9500 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 600, date: '2025-10-17' },
                { id: 2, type: 'Parking', amount: 200, date: '2025-10-17' }
            ],
            payments: [
                { id: 1, amount: 3000, date: '2025-10-16', method: 'Bank Account - HBL', reference: 'TRX-456', vat: 150 }
            ]
        },
        {
            id: 3,
            number: 'INV-2025-0155',
            date: '2025-10-20',
            customer: 'Ajman Beach Resort',
            persons: 2,
            driver: 'Mohammad Siddiqui',
            total: 5250,
            paid: 0,
            status: 'unpaid',
            services: [
                { id: 1, service: 'Fujairah Beach & Mountain Tour', rate: 5250 }
            ],
            expenses: [],
            payments: []
        },
        {
            id: 4,
            number: 'INV-2025-0156',
            date: '2025-10-25',
            customer: 'RAK Tourism Authority',
            persons: 8,
            driver: 'Khalid Ibrahim',
            total: 15000,
            paid: 5000,
            status: 'partial',
            services: [
                { id: 1, service: 'Wedding/Event Transfer', rate: 5000 },
                { id: 2, service: 'VIP Airport Meet & Greet', rate: 10000 }
            ],
            expenses: [
                { id: 1, type: 'Tickets', amount: 800, date: '2025-10-25' }
            ],
            payments: [
                { id: 1, amount: 5000, date: '2025-10-20', method: 'Cash Account', reference: 'ADV-002', vat: 0 }
            ]
        },
        {
            id: 5,
            number: 'INV-2025-0158',
            date: '2025-10-28',
            customer: 'Majid Al Futtaim Properties',
            persons: 4,
            driver: 'Youssef Ahmed',
            total: 8500,
            paid: 2000,
            status: 'partial',
            services: [
                { id: 1, service: 'Desert Safari with BBQ', rate: 3500 },
                { id: 2, service: 'Hatta Mountain Tour', rate: 5000 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 450, date: '2025-10-28' }
            ],
            payments: [
                { id: 1, amount: 2000, date: '2025-10-25', method: 'Cash Account', reference: 'ADV-005', vat: 0 }
            ]
        },
        {
            id: 6,
            number: 'INV-2025-0159',
            date: '2025-10-15',
            customer: 'EuroStar Holdings',
            persons: 5,
            driver: 'Hamza Malik',
            total: 7500,
            paid: 3000,
            status: 'partial',
            services: [
                { id: 1, service: 'Abu Dhabi Airport Transfer (AUH)', rate: 2500 },
                { id: 2, service: 'Corporate Roadshow Service', rate: 5000 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 350, date: '2025-10-15' }
            ],
            payments: [
                { id: 1, amount: 3000, date: '2025-10-14', method: 'Bank Account - HBL', reference: 'TRX-789', vat: 150 }
            ]
        },
        {
            id: 7,
            number: 'INV-2025-0160',
            date: '2025-10-15',
            customer: 'Asia Pacific Ventures',
            persons: 4,
            driver: 'Omar Abdulla',
            total: 9800,
            paid: 4000,
            status: 'partial',
            services: [
                { id: 1, service: 'Dubai City Tour - Full Day', rate: 4800 },
                { id: 2, service: 'Hourly Rental - 8 Hours', rate: 5000 }
            ],
            expenses: [
                { id: 1, type: 'Parking', amount: 200, date: '2025-10-15' }
            ],
            payments: [
                { id: 1, amount: 4000, date: '2025-10-15', method: 'Credit Card', reference: 'TRX-888', vat: 200 }
            ]
        }
    ],
    closedInvoices: [
        {
            id: 1,
            number: 'INV-2025-0150',
            date: '2025-10-10',
            customer: 'Al Fahim Group',
            persons: 2,
            driver: 'Rashid Al Maktoum',
            total: 9500,
            paid: 9500,
            status: 'paid',
            vat: 475,
            services: [
                { id: 1, service: 'Abu Dhabi Airport Transfer (AUH)', rate: 4000 },
                { id: 2, service: 'Abu Dhabi City Tour', rate: 5500 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 300, date: '2025-10-10' },
                { id: 2, type: 'Tolls', amount: 100, date: '2025-10-10' }
            ],
            payments: [
                { id: 1, amount: 5000, date: '2025-10-08', method: 'Cash Account', reference: 'ADV-001' },
                { id: 2, amount: 4500, date: '2025-10-10', method: 'Bank Account - HBL', reference: 'TRX-123' }
            ]
        },
        {
            id: 2,
            number: 'INV-2025-0151',
            date: '2025-10-12',
            customer: 'Dubai Pearl Hotels & Resorts',
            persons: 4,
            driver: 'Omar Abdulla',
            total: 7800,
            paid: 7800,
            status: 'paid',
            vat: 390,
            services: [
                { id: 1, service: 'Hourly Rental - 8 Hours', rate: 7800 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 400, date: '2025-10-12' },
                { id: 2, type: 'Parking', amount: 120, date: '2025-10-12' }
            ],
            payments: [
                { id: 1, amount: 7800, date: '2025-10-12', method: 'Bank Account - MCB', reference: 'TRX-234' }
            ]
        },
        {
            id: 3,
            number: 'INV-2025-0152',
            date: '2025-10-05',
            customer: 'Majid Al Futtaim Properties',
            persons: 6,
            driver: 'Youssef Ahmed',
            total: 12500,
            paid: 12500,
            status: 'paid',
            vat: 625,
            services: [
                { id: 1, service: 'Desert Safari with BBQ', rate: 3500 },
                { id: 2, service: 'Dubai City Tour - Full Day', rate: 9000 }
            ],
            expenses: [
                { id: 1, type: 'Fuel', amount: 550, date: '2025-10-05' },
                { id: 2, type: 'Tickets', amount: 1200, date: '2025-10-05' }
            ],
            payments: [
                { id: 1, amount: 6000, date: '2025-10-01', method: 'Cash Account', reference: 'ADV-003' },
                { id: 2, amount: 6500, date: '2025-10-07', method: 'Credit Card', reference: 'TRX-345' }
            ]
        },
        {
            id: 4,
            number: 'INV-2025-0149',
            date: '2025-10-02',
            customer: 'Etihad Airways Corporate',
            persons: 3,
            driver: 'Hamza Malik',
            total: 5250,
            paid: 5250,
            status: 'paid',
            vat: 262.5,
            services: [
                { id: 1, service: 'Dubai to Abu Dhabi Transfer', rate: 5250 }
            ],
            expenses: [
                { id: 1, type: 'Tolls', amount: 100, date: '2025-10-02' }
            ],
            payments: [
                { id: 1, amount: 5250, date: '2025-10-02', method: 'Bank Account - HBL', reference: 'TRX-111' }
            ]
        },
        {
            id: 5,
            number: 'INV-2025-0157',
            date: '2025-10-21',
            customer: 'Dubai Pearl Hotels & Resorts',
            persons: 2,
            driver: 'Ali Hassan',
            total: 6500,
            paid: 6500,
            status: 'paid',
            vat: 325,
            services: [
                { id: 1, service: 'VIP Airport Meet & Greet', rate: 6500 }
            ],
            expenses: [
                { id: 1, type: 'Parking', amount: 150, date: '2025-10-21' }
            ],
            payments: [
                { id: 1, amount: 6500, date: '2025-10-21', method: 'Credit Card', reference: 'TRX-567' }
            ]
        }
    ],
    transactions: [
        {
            id: 1,
            date: '2025-10-08',
            description: 'Al Fahim Group payment',
            invoiceNumber: 'INV-2025-0150',
            account: 'Cash Account',
            credit: 5000,
            debit: 0,
            reference: 'ADV-001',
            invoiceId: 1,
            notes: 'Advance payment'
        },
        {
            id: 2,
            date: '2025-10-10',
            description: 'Al Fahim Group payment',
            invoiceNumber: 'INV-2025-0150',
            account: 'Bank Account - HBL',
            credit: 4500,
            debit: 0,
            reference: 'TRX-123',
            invoiceId: 1,
            notes: 'Final payment'
        },
        {
            id: 3,
            date: '2025-10-12',
            description: 'Dubai Pearl Hotels & Resorts payment',
            invoiceNumber: 'INV-2025-0151',
            account: 'Bank Account - MCB',
            credit: 7800,
            debit: 0,
            reference: 'TRX-234',
            invoiceId: 2,
            notes: 'Full payment'
        },
        {
            id: 4,
            date: '2025-10-01',
            description: 'Majid Al Futtaim Properties payment',
            invoiceNumber: 'INV-2025-0152',
            account: 'Cash Account',
            credit: 6000,
            debit: 0,
            reference: 'ADV-003',
            invoiceId: 3,
            notes: 'Advance payment'
        },
        {
            id: 5,
            date: '2025-10-07',
            description: 'Majid Al Futtaim Properties payment',
            invoiceNumber: 'INV-2025-0152',
            account: 'Credit Card',
            credit: 6500,
            debit: 0,
            reference: 'TRX-345',
            invoiceId: 3,
            notes: 'Balance payment'
        },
        {
            id: 6,
            date: '2025-10-21',
            description: 'Dubai Pearl Hotels & Resorts payment',
            invoiceNumber: 'INV-2025-0157',
            account: 'Credit Card',
            credit: 6500,
            debit: 0,
            reference: 'TRX-567',
            invoiceId: 5,
            notes: 'Full payment'
        },
        {
            id: 7,
            date: '2025-10-14',
            description: 'Etihad Airways Corporate payment',
            invoiceNumber: 'INV-2025-0159',
            account: 'Bank Account - HBL',
            credit: 3000,
            debit: 0,
            reference: 'TRX-789',
            invoiceId: 6,
            notes: 'Advance payment'
        }
    ],
    nextInvoiceNumber: 'INV-2025-0160' // Updated next invoice number
};

export function DataProvider({ children }) {
    // State for all our data
    const [customers, setCustomers] = useState(initialData.customers);
    const [drivers, setDrivers] = useState(initialData.drivers);
    const [services, setServices] = useState(initialData.services);
    const [accounts, setAccounts] = useState(initialData.accounts);
    const [expenses, setExpenses] = useState(initialData.expenses);
    const [openInvoices, setOpenInvoices] = useState(initialData.openInvoices);
    const [closedInvoices, setClosedInvoices] = useState(initialData.closedInvoices);
    const [transactions, setTransactions] = useState(initialData.transactions);
    const [nextInvoiceNumber, setNextInvoiceNumber] = useState(initialData.nextInvoiceNumber);

    // Business logic functions
    const addCustomer = (customer) => {
        const newCustomer = { ...customer, id: Date.now() };
        setCustomers([...customers, newCustomer]);
        return newCustomer;
    };

    const updateCustomer = (updatedCustomer) => {
        setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    };

    const deleteCustomer = (id) => {
        setCustomers(customers.filter(c => c.id !== id));
    };

    const addDriver = (driver) => {
        const newDriver = { ...driver, id: Date.now() };
        setDrivers([...drivers, newDriver]);
        return newDriver;
    };

    const updateDriver = (updatedDriver) => {
        setDrivers(drivers.map(d => d.id === updatedDriver.id ? updatedDriver : d));
    };

    const deleteDriver = (id) => {
        setDrivers(drivers.filter(d => d.id !== id));
    };

    const addService = (service) => {
        const newService = { ...service, id: Date.now() };
        setServices([...services, newService]);
        return newService;
    };

    const updateService = (updatedService) => {
        setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
    };

    const deleteService = (id) => {
        setServices(services.filter(s => s.id !== id));
    };

    const addAccount = (account) => {
        const newAccount = { ...account, id: Date.now() };
        setAccounts([...accounts, newAccount]);
        return newAccount;
    };

    const updateAccount = (updatedAccount) => {
        setAccounts(accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a));
    };

    const deleteAccount = (id) => {
        setAccounts(accounts.filter(a => a.id !== id));
    };

    const addExpenseType = (expense) => {
        const newExpense = { ...expense, id: Date.now() };
        setExpenses([...expenses, newExpense]);
        return newExpense;
    };

    const updateExpenseType = (updatedExpense) => {
        setExpenses(expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    };

    const deleteExpenseType = (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const generateInvoice = (invoiceData) => {
        // Generate next invoice number
        const currentNumber = nextInvoiceNumber;

        // Increment for next invoice
        const numPart = parseInt(currentNumber.split('-')[2]);
        const newNumPart = (numPart + 1).toString().padStart(4, '0');
        const newNextInvoice = `INV-${currentNumber.split('-')[1]}-${newNumPart}`;
        setNextInvoiceNumber(newNextInvoice);

        // Create new invoice
        const newInvoice = {
            ...invoiceData,
            id: Date.now(),
            number: currentNumber,
            date: new Date().toISOString().split('T')[0],
            status: invoiceData.paid >= invoiceData.total ? 'paid' : invoiceData.paid > 0 ? 'partial' : 'unpaid'
        };

        // Add to proper list
        if (newInvoice.status === 'paid') {
            setClosedInvoices([...closedInvoices, newInvoice]);
        } else {
            setOpenInvoices([...openInvoices, newInvoice]);
        }

        // Add transactions for payments
        if (invoiceData.payments && invoiceData.payments.length > 0) {
            const newTransactions = invoiceData.payments.map(payment => ({
                id: Date.now() + Math.random(), // Ensure unique ID
                date: payment.date,
                description: `${invoiceData.customer} payment`,
                invoiceNumber: currentNumber,
                account: payment.method,
                credit: payment.amount,
                debit: 0,
                reference: payment.reference,
                invoiceId: newInvoice.id,
                notes: payment.notes || 'Invoice payment'
            }));

            setTransactions([...transactions, ...newTransactions]);
        }

        return newInvoice;
    };

    const addPayment = (invoiceId, paymentData) => {
        // Find invoice
        const invoice = openInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) return null;

        // Create payment
        const payment = {
            ...paymentData,
            id: Date.now(),
            vat: accounts.find(a => a.name === paymentData.method)?.accountType === 'bank'
                ? paymentData.amount * 0.05
                : 0
        };

        // Update invoice
        const updatedInvoice = {
            ...invoice,
            payments: [...invoice.payments, payment],
            paid: invoice.paid + paymentData.amount
        };

        // Update status
        updatedInvoice.status = updatedInvoice.paid >= updatedInvoice.total
            ? 'paid'
            : updatedInvoice.paid > 0 ? 'partial' : 'unpaid';

        // Add transaction
        const newTransaction = {
            id: Date.now(),
            date: payment.date,
            description: `${invoice.customer} payment`,
            invoiceNumber: invoice.number,
            account: payment.method,
            credit: payment.amount,
            debit: 0,
            reference: payment.reference,
            invoiceId: invoice.id,
            notes: payment.notes || 'Invoice payment'
        };

        setTransactions([...transactions, newTransaction]);

        // Move to closed if fully paid
        if (updatedInvoice.status === 'paid') {
            setOpenInvoices(openInvoices.filter(inv => inv.id !== invoiceId));
            setClosedInvoices([...closedInvoices, updatedInvoice]);
        } else {
            setOpenInvoices(openInvoices.map(inv => inv.id === invoiceId ? updatedInvoice : inv));
        }

        return updatedInvoice;
    };

    const addExpense = (invoiceId, expenseData) => {
        // Find invoice
        const invoice = openInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) return null;

        // Create expense
        const expense = {
            ...expenseData,
            id: Date.now()
        };

        // Update invoice
        const updatedInvoice = {
            ...invoice,
            expenses: [...invoice.expenses, expense]
        };

        // Add transaction
        const newTransaction = {
            id: Date.now(),
            date: expense.date,
            description: `${expense.type} expense for ${invoice.number}`,
            invoiceNumber: invoice.number,
            account: 'Cash Account', // Default for expenses
            credit: 0,
            debit: expense.amount,
            reference: `EXP-${expense.id}`,
            invoiceId: invoice.id,
            expenseType: expense.type
        };

        setTransactions([...transactions, newTransaction]);
        setOpenInvoices(openInvoices.map(inv => inv.id === invoiceId ? updatedInvoice : inv));

        return updatedInvoice;
    };

    const addInvoiceService = (invoiceId, serviceData) => {
        // Find invoice
        const invoice = openInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) return null;

        let updatedServices;
        let serviceToAdd;

        // Check if we're updating an existing service
        if (serviceData.id) {
            // Update existing service
            updatedServices = invoice.services.map(s =>
                s.id === serviceData.id ? { ...s, ...serviceData } : s
            );
        } else {
            // Add new service with a new ID
            serviceToAdd = {
                ...serviceData,
                id: Date.now() // Generate a new ID
            };
            updatedServices = [...invoice.services, serviceToAdd];
        }

        // Calculate new total (sum of all service rates)
        const newTotal = updatedServices.reduce((sum, s) => sum + parseFloat(s.rate || 0), 0);

        // Update status based on new total and paid amount
        let newStatus = invoice.status;
        if (invoice.paid >= newTotal) {
            newStatus = 'paid';
        } else if (invoice.paid > 0) {
            newStatus = 'partial';
        } else {
            newStatus = 'unpaid';
        }

        const updatedInvoice = {
            ...invoice,
            services: updatedServices,
            total: newTotal,
            status: newStatus
        };

        // If invoice is now paid due to total change, move it to closed invoices
        if (newStatus === 'paid' && invoice.status !== 'paid') {
            setOpenInvoices(openInvoices.filter(inv => inv.id !== invoiceId));
            setClosedInvoices([...closedInvoices, updatedInvoice]);
        } else {
            // Otherwise update it in openInvoices
            setOpenInvoices(openInvoices.map(inv => inv.id === invoiceId ? updatedInvoice : inv));
        }

        return updatedInvoice;
    };

    const removeInvoiceService = (invoiceId, serviceId) => {
        // Find invoice
        const invoice = openInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) return null;

        // Find service to remove
        const serviceToRemove = invoice.services.find(s => s.id === serviceId);
        if (!serviceToRemove) return null;

        // Update invoice with new services list and recalculate total
        const updatedServices = invoice.services.filter(s => s.id !== serviceId);
        const newTotal = updatedServices.reduce((sum, s) => sum + parseFloat(s.rate || 0), 0);

        // Update status based on new total and paid amount
        let newStatus = invoice.status;
        if (invoice.paid >= newTotal) {
            newStatus = 'paid';
        } else if (invoice.paid > 0) {
            newStatus = 'partial';
        } else {
            newStatus = 'unpaid';
        }

        const updatedInvoice = {
            ...invoice,
            services: updatedServices,
            total: newTotal,
            status: newStatus
        };

        // If invoice is now paid due to total reduction, move it to closed invoices
        if (newStatus === 'paid' && invoice.status !== 'paid') {
            setOpenInvoices(openInvoices.filter(inv => inv.id !== invoiceId));
            setClosedInvoices([...closedInvoices, updatedInvoice]);
        } else {
            // Just update the invoice in openInvoices
            setOpenInvoices(openInvoices.map(inv => inv.id === invoiceId ? updatedInvoice : inv));
        }

        return updatedInvoice;
    };

    const assignDriver = (invoiceId, driverName) => {
        // Find the invoice first
        const invoice = openInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) return null;

        // Create updated invoice with new driver
        const updatedInvoice = {
            ...invoice,
            driver: driverName
        };

        // Update the invoice in openInvoices
        setOpenInvoices(openInvoices.map(inv =>
            inv.id === invoiceId ? updatedInvoice : inv
        ));

        return updatedInvoice;
    };

    const updateExpense = (invoiceId, expenseId, updatedExpense) => {
        // Find invoice
        const invoice = openInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) return null;
        
        // Update expense
        const updatedInvoice = {
            ...invoice,
            expenses: invoice.expenses.map(exp => 
                exp.id === expenseId ? { ...exp, ...updatedExpense } : exp
            )
        };
        
        // Update transaction if needed
        const expenseTransaction = transactions.find(t => 
            t.invoiceId === invoiceId && t.reference === `EXP-${expenseId}`
        );
        
        if (expenseTransaction) {
            const updatedTransaction = {
                ...expenseTransaction,
                date: updatedExpense.date,
                description: `${updatedExpense.type} expense for ${invoice.number}`,
                debit: updatedExpense.amount,
                expenseType: updatedExpense.type
            };
            
            setTransactions(transactions.map(t => 
                t.id === expenseTransaction.id ? updatedTransaction : t
            ));
        }
        
        setOpenInvoices(openInvoices.map(inv => 
            inv.id === invoiceId ? updatedInvoice : inv
        ));
        
        return updatedInvoice;
    };

    const removeExpense = (invoiceId, expenseId) => {
        // Find invoice
        const invoice = openInvoices.find(inv => inv.id === invoiceId);
        if (!invoice) return null;
        
        // Find expense to remove
        const expenseToRemove = invoice.expenses.find(e => e.id === expenseId);
        if (!expenseToRemove) return null;
        
        // Update invoice
        const updatedInvoice = {
            ...invoice,
            expenses: invoice.expenses.filter(e => e.id !== expenseId)
        };
        
        // Remove associated transaction
        setTransactions(transactions.filter(t => 
            !(t.invoiceId === invoiceId && t.reference === `EXP-${expenseId}`)
        ));
        
        setOpenInvoices(openInvoices.map(inv => 
            inv.id === invoiceId ? updatedInvoice : inv
        ));
        
        return updatedInvoice;
    };

    return (
        <DataContext.Provider value={{
            customers,
            drivers,
            services,
            accounts,
            expenses,
            openInvoices,
            closedInvoices,
            transactions,
            nextInvoiceNumber,
            addCustomer,
            updateCustomer,
            deleteCustomer,
            addDriver,
            updateDriver,
            deleteDriver,
            addService,
            updateService,
            deleteService,
            addAccount,
            updateAccount,
            deleteAccount,
            addExpenseType,
            updateExpenseType,
            deleteExpenseType,
            generateInvoice,
            addPayment,
            addExpense,
            addInvoiceService,
            assignDriver,
            updateExpense,
            removeExpense,
            removeInvoiceService
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}