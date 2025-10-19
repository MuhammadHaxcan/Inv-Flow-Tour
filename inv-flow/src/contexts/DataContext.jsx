import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const DataContext = createContext();

// Initial data
const initialData = {
  customers: [
    { id: 1, name: 'ABC Company', phone: '+971501234567', email: 'contact@abc.com', origin: 'Dubai' },
    { id: 2, name: 'XYZ Ltd', phone: '+971507654321', email: 'info@xyz.com', origin: 'Abu Dhabi' }
  ],
  drivers: [
    { id: 1, name: 'Ahmed Khan', phone: '+971501111111' },
    { id: 2, name: 'Ali Raza', phone: '+971502222222' },
    { id: 3, name: 'Mohammad Siddiq', phone: '+971503333333' }
  ],
  services: [
    { id: 1, name: 'Airport Transfer', description: 'Pickup and drop off service to and from airport', charge: 4000, vatIncluded: 4200 },
    { id: 2, name: 'City Tour', description: 'Full day city sightseeing tour', charge: 5500, vatIncluded: 5775 },
    { id: 3, name: 'Hourly Rental', description: 'Vehicle rental on hourly basis', charge: 3000, vatIncluded: 3150 },
    { id: 4, name: 'Outstation', description: 'Multi-day tour outside the city', charge: 15000, vatIncluded: 15750 }
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
      number: 'INV-2024-0153',
      date: '2024-03-15',
      customer: 'ABC Company',
      persons: 3,
      driver: 'Ahmed Khan',
      total: 12500,
      paid: 5000,
      status: 'partial',
      services: [
        { id: 1, service: 'Airport Transfer', rate: 5000 },
        { id: 2, service: 'City Tour', rate: 7500 }
      ],
      expenses: [
        { id: 1, type: 'Fuel', amount: 500, date: '2024-03-15' },
        { id: 2, type: 'Tolls', amount: 100, date: '2024-03-15' }
      ],
      payments: [
        { id: 1, amount: 5000, date: '2024-03-15', method: 'Cash Account', reference: 'ADV-001', vat: 0 }
      ]
    }
  ],
  closedInvoices: [
    {
      id: 1,
      number: 'INV-2024-0150',
      date: '2024-03-10',
      customer: 'Global Trading',
      persons: 2,
      driver: 'Ahmed Khan',
      total: 9500,
      paid: 9500,
      status: 'paid',
      vat: 475,
      services: [
        { id: 1, service: 'Airport Transfer', rate: 4000 },
        { id: 2, service: 'City Tour', rate: 5500 }
      ],
      expenses: [
        { id: 1, type: 'Fuel', amount: 300, date: '2024-03-10' },
        { id: 2, type: 'Tolls', amount: 100, date: '2024-03-10' }
      ],
      payments: [
        { id: 1, amount: 5000, date: '2024-03-10', method: 'Cash Account', reference: 'ADV-001' },
        { id: 2, amount: 4500, date: '2024-03-15', method: 'Bank Account - HBL', reference: 'TRX-123' }
      ]
    }
  ],
  transactions: [
    {
      id: 1,
      date: '2024-03-10',
      description: 'Global Trading payment',
      invoiceNumber: 'INV-2024-0150',
      account: 'Cash Account',
      credit: 5000,
      debit: 0,
      reference: 'ADV-001',
      invoiceId: 1,
      notes: 'Advance payment'
    }
  ],
  nextInvoiceNumber: 'INV-2024-0156'
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
    
    // Create service
    const service = {
      ...serviceData,
      id: Date.now()
    };
    
    // Update invoice
    const updatedInvoice = {
      ...invoice,
      services: [...invoice.services, service],
      total: invoice.total + parseFloat(service.rate)
    };
    
    // Update status based on new total
    updatedInvoice.status = updatedInvoice.paid >= updatedInvoice.total 
      ? 'paid' 
      : updatedInvoice.paid > 0 ? 'partial' : 'unpaid';
    
    // Move to closed if fully paid
    if (updatedInvoice.status === 'paid') {
      setOpenInvoices(openInvoices.filter(inv => inv.id !== invoiceId));
      setClosedInvoices([...closedInvoices, updatedInvoice]);
    } else {
      setOpenInvoices(openInvoices.map(inv => inv.id === invoiceId ? updatedInvoice : inv));
    }
    
    return updatedInvoice;
  };

  const assignDriver = (invoiceId, driverName) => {
    // Update invoice with driver
    setOpenInvoices(openInvoices.map(inv => 
      inv.id === invoiceId ? { ...inv, driver: driverName } : inv
    ));
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
      assignDriver
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}