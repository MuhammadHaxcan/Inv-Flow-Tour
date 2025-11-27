import React, { createContext, useState, useContext, useCallback } from 'react';
import {
    customersAPI, driversAPI, servicesAPI, accountsAPI, expenseTypesAPI,
    vendorsAPI, invoicesAPI, transactionsAPI, companySettingsAPI
} from '../services/api';

const DataContext = createContext();

export function DataProvider({ children }) {
    // State for all our data - initialized as empty, loaded on demand
    const [customers, setCustomers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [services, setServices] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [openInvoices, setOpenInvoices] = useState([]);
    const [closedInvoices, setClosedInvoices] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');
    const [companySettings, setCompanySettings] = useState(null);
    
    // Loading states for each resource
    const [loadingStates, setLoadingStates] = useState({
        customers: false,
        drivers: false,
        services: false,
        accounts: false,
        expenses: false,
        vendors: false,
        openInvoices: false,
        closedInvoices: false,
        transactions: false,
        nextInvoiceNumber: false,
        companySettings: false
    });

    // Cache to track what's been loaded
    const [loaded, setLoaded] = useState({
        customers: false,
        drivers: false,
        services: false,
        accounts: false,
        expenses: false,
        vendors: false,
        openInvoices: false,
        closedInvoices: false,
        transactions: false,
        nextInvoiceNumber: false,
        companySettings: false
    });

    // Load customers only when needed
    const loadCustomers = useCallback(async (force = false) => {
        if (loaded.customers && !force) return;
        setLoadingStates(prev => ({ ...prev, customers: true }));
        try {
            const data = await customersAPI.getAll();
            setCustomers(data);
            setLoaded(prev => ({ ...prev, customers: true }));
        } catch (error) {
            console.error('Error loading customers:', error);
            setCustomers([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, customers: false }));
        }
    }, [loaded.customers]);

    // Load drivers only when needed
    const loadDrivers = useCallback(async (force = false) => {
        if (loaded.drivers && !force) return;
        setLoadingStates(prev => ({ ...prev, drivers: true }));
        try {
            const data = await driversAPI.getAll();
            setDrivers(data);
            setLoaded(prev => ({ ...prev, drivers: true }));
        } catch (error) {
            console.error('Error loading drivers:', error);
            setDrivers([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, drivers: false }));
        }
    }, [loaded.drivers]);

    // Load services only when needed
    const loadServices = useCallback(async (force = false) => {
        if (loaded.services && !force) return;
        setLoadingStates(prev => ({ ...prev, services: true }));
        try {
            const data = await servicesAPI.getAll();
            setServices(data);
            setLoaded(prev => ({ ...prev, services: true }));
        } catch (error) {
            console.error('Error loading services:', error);
            setServices([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, services: false }));
        }
    }, [loaded.services]);

    // Load accounts only when needed
    const loadAccounts = useCallback(async (force = false) => {
        if (loaded.accounts && !force) return;
        setLoadingStates(prev => ({ ...prev, accounts: true }));
        try {
            const data = await accountsAPI.getAll();
            setAccounts(data);
            setLoaded(prev => ({ ...prev, accounts: true }));
        } catch (error) {
            console.error('Error loading accounts:', error);
            setAccounts([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, accounts: false }));
        }
    }, [loaded.accounts]);

    // Load expense types only when needed
    const loadExpenses = useCallback(async (force = false) => {
        if (loaded.expenses && !force) return;
        setLoadingStates(prev => ({ ...prev, expenses: true }));
        try {
            const data = await expenseTypesAPI.getAll();
            setExpenses(data);
            setLoaded(prev => ({ ...prev, expenses: true }));
        } catch (error) {
            console.error('Error loading expenses:', error);
            setExpenses([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, expenses: false }));
        }
    }, [loaded.expenses]);

    // Load vendors only when needed
    const loadVendors = useCallback(async (force = false) => {
        if (loaded.vendors && !force) return;
        setLoadingStates(prev => ({ ...prev, vendors: true }));
        try {
            const data = await vendorsAPI.getAll();
            setVendors(data);
            setLoaded(prev => ({ ...prev, vendors: true }));
        } catch (error) {
            console.error('Error loading vendors:', error);
            setVendors([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, vendors: false }));
        }
    }, [loaded.vendors]);

    // Load open invoices only when needed
    const loadOpenInvoices = useCallback(async (force = false) => {
        if (loaded.openInvoices && !force) return;
        setLoadingStates(prev => ({ ...prev, openInvoices: true }));
        try {
            const data = await invoicesAPI.getOpen();
            console.log('Open invoices loaded:', data);
            setOpenInvoices(Array.isArray(data) ? data : []);
            setLoaded(prev => ({ ...prev, openInvoices: true }));
        } catch (error) {
            console.error('Error loading open invoices:', error);
            console.error('Error details:', error.response || error.message);
            setOpenInvoices([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, openInvoices: false }));
        }
    }, [loaded.openInvoices]);

    // Load closed invoices only when needed
    const loadClosedInvoices = useCallback(async (force = false) => {
        if (loaded.closedInvoices && !force) return;
        setLoadingStates(prev => ({ ...prev, closedInvoices: true }));
        try {
            const data = await invoicesAPI.getClosed();
            console.log('Closed invoices loaded:', data);
            setClosedInvoices(Array.isArray(data) ? data : []);
            setLoaded(prev => ({ ...prev, closedInvoices: true }));
        } catch (error) {
            console.error('Error loading closed invoices:', error);
            console.error('Error details:', error.response || error.message);
            setClosedInvoices([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, closedInvoices: false }));
        }
    }, [loaded.closedInvoices]);

    // Load transactions only when needed
    const loadTransactions = useCallback(async (force = false) => {
        if (loaded.transactions && !force) return;
        setLoadingStates(prev => ({ ...prev, transactions: true }));
        try {
            const data = await transactionsAPI.getAll();
            setTransactions(data);
            setLoaded(prev => ({ ...prev, transactions: true }));
        } catch (error) {
            console.error('Error loading transactions:', error);
            setTransactions([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, transactions: false }));
        }
    }, [loaded.transactions]);

    // Load next invoice number only when needed
    const loadNextInvoiceNumber = useCallback(async (force = false) => {
        if (loaded.nextInvoiceNumber && !force) return;
        setLoadingStates(prev => ({ ...prev, nextInvoiceNumber: true }));
        try {
            const data = await invoicesAPI.getNextNumber();
            setNextInvoiceNumber(data.number || 'INV-2025-0001');
            setLoaded(prev => ({ ...prev, nextInvoiceNumber: true }));
        } catch (error) {
            console.error('Error loading next invoice number:', error);
            setNextInvoiceNumber('INV-2025-0001');
        } finally {
            setLoadingStates(prev => ({ ...prev, nextInvoiceNumber: false }));
        }
    }, [loaded.nextInvoiceNumber]);

    // Load company settings only when needed
    const loadCompanySettings = useCallback(async (force = false) => {
        if (loaded.companySettings && !force) return;
        setLoadingStates(prev => ({ ...prev, companySettings: true }));
        try {
            const data = await companySettingsAPI.get();
            setCompanySettings(data);
            setLoaded(prev => ({ ...prev, companySettings: true }));
        } catch (error) {
            console.error('Error loading company settings:', error);
            setCompanySettings(null);
        } finally {
            setLoadingStates(prev => ({ ...prev, companySettings: false }));
        }
    }, [loaded.companySettings]);

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

    // Vendor functions
    const addVendor = async (vendor) => {
        try {
            const newVendor = await vendorsAPI.create(vendor);
            setVendors([...vendors, newVendor]);
            return newVendor;
        } catch (error) {
            throw error;
        }
    };

    const updateVendor = async (updatedVendor) => {
        try {
            const vendor = await vendorsAPI.update(updatedVendor.id, updatedVendor);
            setVendors(vendors.map(v => v.id === updatedVendor.id ? vendor : v));
            return vendor;
        } catch (error) {
            throw error;
        }
    };

    const deleteVendor = async (id) => {
        try {
            await vendorsAPI.delete(id);
            setVendors(vendors.filter(v => v.id !== id));
        } catch (error) {
            throw error;
        }
    };

    // Invoice functions
    const generateInvoice = async (invoiceData) => {
        try {
            const createInvoiceDto = {
                date: invoiceData.date || new Date().toISOString().split('T')[0],
                customerId: invoiceData.customerId,
                driverId: invoiceData.driverId,
                driverNotes: invoiceData.driverNotes || null,
                persons: invoiceData.persons || 1,
                services: invoiceData.services || [],
                expenses: invoiceData.expenses || [],
                payments: invoiceData.payments || []
            };

            const newInvoice = await invoicesAPI.create(createInvoiceDto);
            
            // Reload relevant invoices
            await Promise.all([
                loadOpenInvoices(true),
                loadClosedInvoices(true),
                loadNextInvoiceNumber(true)
            ]);

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

            await Promise.all([
                loadOpenInvoices(true),
                loadClosedInvoices(true),
                loadTransactions(true)
            ]);

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
                date: expenseData.date,
                accountId: expenseData.accountId || accounts.find(a => a.name === expenseData.accountName)?.id,
                vendorId: expenseData.vendorId || (expenseData.vendorName ? vendors.find(v => v.name === expenseData.vendorName)?.id : null),
                pax: expenseData.pax || null
            });

            await Promise.all([
                loadOpenInvoices(true),
                loadTransactions(true)
            ]);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    const addInvoiceService = async (invoiceId, serviceData) => {
        try {
            // Resolve serviceId from service name if not provided
            let serviceId = serviceData.serviceId;
            if (!serviceId && serviceData.service) {
                const service = services.find(s => s.name === serviceData.service);
                serviceId = service?.id;
            }
            
            if (!serviceId) {
                throw new Error('Service not found');
            }

            let updatedInvoice;
            if (serviceData.id) {
                // Update existing service
                updatedInvoice = await invoicesAPI.updateService(invoiceId, {
                    id: serviceData.id,
                    serviceId: serviceId,
                    rate: serviceData.rate
                });
            } else {
                // Add new service
                updatedInvoice = await invoicesAPI.addService(invoiceId, {
                    serviceId: serviceId,
                    rate: serviceData.rate
                });
            }

            await Promise.all([
                loadOpenInvoices(true),
                loadClosedInvoices(true)
            ]);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    const removeInvoiceService = async (invoiceId, serviceId) => {
        try {
            const updatedInvoice = await invoicesAPI.removeService(invoiceId, serviceId);

            await Promise.all([
                loadOpenInvoices(true),
                loadClosedInvoices(true)
            ]);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    const assignDriver = async (invoiceId, driverName, driverNotes = null) => {
        try {
            const driverId = drivers.find(d => d.name === driverName)?.id;
            const updatedInvoice = await invoicesAPI.assignDriver(invoiceId, { 
                driverId,
                driverNotes: driverNotes || null
            });

            await Promise.all([
                loadOpenInvoices(true),
                loadClosedInvoices(true)
            ]);

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
                date: updatedExpense.date,
                accountId: updatedExpense.accountId || accounts.find(a => a.name === updatedExpense.accountName)?.id,
                vendorId: updatedExpense.vendorId || (updatedExpense.vendorName ? vendors.find(v => v.name === updatedExpense.vendorName)?.id : null),
                pax: updatedExpense.pax || null
            });

            await Promise.all([
                loadOpenInvoices(true),
                loadTransactions(true)
            ]);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    const removeExpense = async (invoiceId, expenseId) => {
        try {
            const updatedInvoice = await invoicesAPI.removeExpense(invoiceId, expenseId);

            await Promise.all([
                loadOpenInvoices(true),
                loadTransactions(true)
            ]);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    return (
        <DataContext.Provider value={{
            // Data
            customers,
            drivers,
            services,
            accounts,
            expenses,
            vendors,
            openInvoices,
            closedInvoices,
            transactions,
            nextInvoiceNumber,
            companySettings,
            
            // Loading states
            loadingStates,
            
            // Load functions (on-demand loading)
            loadCustomers,
            loadDrivers,
            loadServices,
            loadAccounts,
            loadExpenses,
            loadVendors,
            loadOpenInvoices,
            loadClosedInvoices,
            loadTransactions,
            loadNextInvoiceNumber,
            loadCompanySettings,
            
            // CRUD functions
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
            addVendor,
            updateVendor,
            deleteVendor,
            generateInvoice,
            addPayment,
            addExpense,
            addInvoiceService,
            assignDriver,
            updateExpense,
            removeExpense,
            removeInvoiceService,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}
