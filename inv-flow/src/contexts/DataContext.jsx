import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    customersAPI, driversAPI, servicesAPI, accountsAPI, expenseTypesAPI,
    invoicesAPI, transactionsAPI
} from '../services/api';

const DataContext = createContext();

export function DataProvider({ children }) {
    // State for all our data
    const [customers, setCustomers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [services, setServices] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [openInvoices, setOpenInvoices] = useState([]);
    const [closedInvoices, setClosedInvoices] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');
    const [loading, setLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const [
                customersData,
                driversData,
                servicesData,
                accountsData,
                expensesData,
                openInvoicesData,
                closedInvoicesData,
                transactionsData,
                nextNumberData
            ] = await Promise.all([
                customersAPI.getAll().catch(() => []),
                driversAPI.getAll().catch(() => []),
                servicesAPI.getAll().catch(() => []),
                accountsAPI.getAll().catch(() => []),
                expenseTypesAPI.getAll().catch(() => []),
                invoicesAPI.getOpen().catch(() => []),
                invoicesAPI.getClosed().catch(() => []),
                transactionsAPI.getAll().catch(() => []),
                invoicesAPI.getNextNumber().catch(() => ({ number: 'INV-2025-0001' }))
            ]);

            setCustomers(customersData);
            setDrivers(driversData);
            setServices(servicesData);
            setAccounts(accountsData);
            setExpenses(expensesData);
            setOpenInvoices(openInvoicesData);
            setClosedInvoices(closedInvoicesData);
            setTransactions(transactionsData);
            setNextInvoiceNumber(nextNumberData.number || 'INV-2025-0001');
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Customer functions
    const addCustomer = async (customer) => {
        try {
            const newCustomer = await customersAPI.create(customer);
            setCustomers([...customers, newCustomer]);
            return newCustomer;
        } catch (error) {
            throw error;
        }
    };

    const updateCustomer = async (updatedCustomer) => {
        try {
            const customer = await customersAPI.update(updatedCustomer.id, updatedCustomer);
            setCustomers(customers.map(c => c.id === updatedCustomer.id ? customer : c));
            return customer;
        } catch (error) {
            throw error;
        }
    };

    const deleteCustomer = async (id) => {
        try {
            await customersAPI.delete(id);
            setCustomers(customers.filter(c => c.id !== id));
        } catch (error) {
            throw error;
        }
    };

    // Driver functions
    const addDriver = async (driver) => {
        try {
            const newDriver = await driversAPI.create(driver);
            setDrivers([...drivers, newDriver]);
            return newDriver;
        } catch (error) {
            throw error;
        }
    };

    const updateDriver = async (updatedDriver) => {
        try {
            const driver = await driversAPI.update(updatedDriver.id, updatedDriver);
            setDrivers(drivers.map(d => d.id === updatedDriver.id ? driver : d));
            return driver;
        } catch (error) {
            throw error;
        }
    };

    const deleteDriver = async (id) => {
        try {
            await driversAPI.delete(id);
            setDrivers(drivers.filter(d => d.id !== id));
        } catch (error) {
            throw error;
        }
    };

    // Service functions
    const addService = async (service) => {
        try {
            const newService = await servicesAPI.create(service);
            setServices([...services, newService]);
            return newService;
        } catch (error) {
            throw error;
        }
    };

    const updateService = async (updatedService) => {
        try {
            const service = await servicesAPI.update(updatedService.id, updatedService);
            setServices(services.map(s => s.id === updatedService.id ? service : s));
            return service;
        } catch (error) {
            throw error;
        }
    };

    const deleteService = async (id) => {
        try {
            await servicesAPI.delete(id);
            setServices(services.filter(s => s.id !== id));
        } catch (error) {
            throw error;
        }
    };

    // Account functions
    const addAccount = async (account) => {
        try {
            const newAccount = await accountsAPI.create(account);
            setAccounts([...accounts, newAccount]);
            return newAccount;
        } catch (error) {
            throw error;
        }
    };

    const updateAccount = async (updatedAccount) => {
        try {
            const account = await accountsAPI.update(updatedAccount.id, updatedAccount);
            setAccounts(accounts.map(a => a.id === updatedAccount.id ? account : a));
            return account;
        } catch (error) {
            throw error;
        }
    };

    const deleteAccount = async (id) => {
        try {
            await accountsAPI.delete(id);
            setAccounts(accounts.filter(a => a.id !== id));
        } catch (error) {
            throw error;
        }
    };

    // Expense Type functions
    const addExpenseType = async (expense) => {
        try {
            const newExpense = await expenseTypesAPI.create(expense);
            setExpenses([...expenses, newExpense]);
            return newExpense;
        } catch (error) {
            throw error;
        }
    };

    const updateExpenseType = async (updatedExpense) => {
        try {
            const expense = await expenseTypesAPI.update(updatedExpense.id, updatedExpense);
            setExpenses(expenses.map(e => e.id === updatedExpense.id ? expense : e));
            return expense;
        } catch (error) {
            throw error;
        }
    };

    const deleteExpenseType = async (id) => {
        try {
            await expenseTypesAPI.delete(id);
            setExpenses(expenses.filter(e => e.id !== id));
        } catch (error) {
            throw error;
        }
    };

    // Invoice functions
    const generateInvoice = async (invoiceData) => {
        try {
            // Transform data to match API format
            const createInvoiceDto = {
                date: invoiceData.date || new Date().toISOString().split('T')[0],
                customerId: invoiceData.customerId,
                driverId: invoiceData.driverId,
                persons: invoiceData.persons || 1,
                services: invoiceData.services || [],
                expenses: invoiceData.expenses || [],
                payments: invoiceData.payments || []
            };

            const newInvoice = await invoicesAPI.create(createInvoiceDto);
            
            // Reload invoices
            const [open, closed] = await Promise.all([
                invoicesAPI.getOpen(),
                invoicesAPI.getClosed()
            ]);
            setOpenInvoices(open);
            setClosedInvoices(closed);

            // Update next invoice number
            const nextNumber = await invoicesAPI.getNextNumber();
            setNextInvoiceNumber(nextNumber.number);

            return newInvoice;
        } catch (error) {
            throw error;
        }
    };

    const addPayment = async (invoiceId, paymentData) => {
        try {
            const updatedInvoice = await invoicesAPI.addPayment(invoiceId, {
                accountId: paymentData.accountId || accounts.find(a => a.name === paymentData.method)?.id,
                amount: paymentData.amount,
                date: paymentData.date,
                reference: paymentData.reference,
                notes: paymentData.notes
            });

            // Reload invoices and transactions
            const [open, closed, trans] = await Promise.all([
                invoicesAPI.getOpen(),
                invoicesAPI.getClosed(),
                transactionsAPI.getAll()
            ]);
            setOpenInvoices(open);
            setClosedInvoices(closed);
            setTransactions(trans);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    const addExpense = async (invoiceId, expenseData) => {
        try {
            const updatedInvoice = await invoicesAPI.addExpense(invoiceId, {
                expenseTypeId: expenseData.expenseTypeId || expenses.find(e => e.name === expenseData.type)?.id,
                amount: expenseData.amount,
                date: expenseData.date
            });

            // Reload invoices and transactions
            const [open, trans] = await Promise.all([
                invoicesAPI.getOpen(),
                transactionsAPI.getAll()
            ]);
            setOpenInvoices(open);
            setTransactions(trans);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    const addInvoiceService = async (invoiceId, serviceData) => {
        try {
            let updatedInvoice;
            if (serviceData.id) {
                // Update existing service
                updatedInvoice = await invoicesAPI.updateService(invoiceId, {
                    id: serviceData.id,
                    serviceId: serviceData.serviceId,
                    rate: serviceData.rate
                });
            } else {
                // Add new service
                updatedInvoice = await invoicesAPI.addService(invoiceId, {
                    serviceId: serviceData.serviceId,
                    rate: serviceData.rate
                });
            }

            // Reload invoices
            const [open, closed] = await Promise.all([
                invoicesAPI.getOpen(),
                invoicesAPI.getClosed()
            ]);
            setOpenInvoices(open);
            setClosedInvoices(closed);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    const removeInvoiceService = async (invoiceId, serviceId) => {
        try {
            const updatedInvoice = await invoicesAPI.removeService(invoiceId, serviceId);

            // Reload invoices
            const [open, closed] = await Promise.all([
                invoicesAPI.getOpen(),
                invoicesAPI.getClosed()
            ]);
            setOpenInvoices(open);
            setClosedInvoices(closed);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    const assignDriver = async (invoiceId, driverName) => {
        try {
            const driverId = drivers.find(d => d.name === driverName)?.id;
            const updatedInvoice = await invoicesAPI.assignDriver(invoiceId, { driverId });

            // Reload invoices
            const [open, closed] = await Promise.all([
                invoicesAPI.getOpen(),
                invoicesAPI.getClosed()
            ]);
            setOpenInvoices(open);
            setClosedInvoices(closed);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    const updateExpense = async (invoiceId, expenseId, updatedExpense) => {
        try {
            const updatedInvoice = await invoicesAPI.updateExpense(invoiceId, expenseId, {
                expenseTypeId: updatedExpense.expenseTypeId || expenses.find(e => e.name === updatedExpense.type)?.id,
                amount: updatedExpense.amount,
                date: updatedExpense.date
            });

            // Reload invoices and transactions
            const [open, trans] = await Promise.all([
                invoicesAPI.getOpen(),
                transactionsAPI.getAll()
            ]);
            setOpenInvoices(open);
            setTransactions(trans);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    const removeExpense = async (invoiceId, expenseId) => {
        try {
            const updatedInvoice = await invoicesAPI.removeExpense(invoiceId, expenseId);

            // Reload invoices and transactions
            const [open, trans] = await Promise.all([
                invoicesAPI.getOpen(),
                transactionsAPI.getAll()
            ]);
            setOpenInvoices(open);
            setTransactions(trans);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
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
            loading,
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
            removeInvoiceService,
            refreshData: loadAllData
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}
