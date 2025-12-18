import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import {
    customersAPI, driversAPI, servicesAPI, accountsAPI, expenseTypesAPI,
    vendorsAPI, invoicesAPI, companySettingsAPI
} from '../services/api';


const InvoiceContext = createContext({
    // Invoice data
    customers: [],
    drivers: [],
    services: [],
    accounts: [],
    expenses: [],
    vendors: [],
    openInvoices: [],
    closedInvoices: [],
    nextInvoiceNumber: '',
    companySettings: null,

    // Loading states
    loadingStates: {
        customers: false,
        drivers: false,
        services: false,
        accounts: false,
        expenses: false,
        vendors: false,
        openInvoices: false,
        closedInvoices: false,
        nextInvoiceNumber: false,
        companySettings: false
    },

    // Load functions
    loadCustomers: () => {},
    loadDrivers: () => {},
    loadServices: () => {},
    loadAccounts: () => {},
    loadExpenses: () => {},
    loadVendors: () => {},
    loadOpenInvoices: () => {},
    loadClosedInvoices: () => {},
    loadNextInvoiceNumber: () => {},
    loadCompanySettings: () => {},

    // CRUD functions
    addCustomer: () => {},
    updateCustomer: () => {},
    deleteCustomer: () => {},
    addDriver: () => {},
    updateDriver: () => {},
    deleteDriver: () => {},
    addService: () => {},
    updateService: () => {},
    deleteService: () => {},
    addAccount: () => {},
    updateAccount: () => {},
    deleteAccount: () => {},
    addExpenseType: () => {},
    updateExpenseType: () => {},
    deleteExpenseType: () => {},
    addVendor: () => {},
    updateVendor: () => {},
    deleteVendor: () => {},
    generateInvoice: () => {},
    addPayment: () => {},
    addExpense: () => {},
    addInvoiceService: () => {},
    assignDriver: () => {},
    updateExpense: () => {},
    removeExpense: () => {},
    removeInvoiceService: () => {},
    sendInvoiceEmail: () => {},
    deleteInvoice: () => {},
    closeInvoice: () => {}
});

export function InvoiceProvider({ children }) {
    // State for invoice-related data
    const [customers, setCustomers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [services, setServices] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [openInvoices, setOpenInvoices] = useState([]);
    const [closedInvoices, setClosedInvoices] = useState([]);
    const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');
    const [companySettings, setCompanySettings] = useState(null);

    // Loading states for invoice resources
    const [loadingStates, setLoadingStates] = useState({
        customers: false,
        drivers: false,
        services: false,
        accounts: false,
        expenses: false,
        vendors: false,
        openInvoices: false,
        closedInvoices: false,
        nextInvoiceNumber: false,
        companySettings: false
    });

    // State to track what's been loaded
    const [loaded, setLoaded] = useState({
        customers: false,
        drivers: false,
        services: false,
        accounts: false,
        expenses: false,
        vendors: false,
        openInvoices: false,
        closedInvoices: false,
        nextInvoiceNumber: false,
        companySettings: false
    });


    // Load customers - always load fresh data
    const loadCustomers = useCallback(async (force = false) => {
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
    }, []);

    // Load drivers - always load fresh data
    const loadDrivers = useCallback(async (force = false) => {
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
    }, []);

    // Load services - always load fresh data
    const loadServices = useCallback(async (force = false) => {
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
    }, []);

    // Load accounts - always load fresh data
    const loadAccounts = useCallback(async (force = false) => {
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
    }, []);

    // Load expense types - always load fresh data
    const loadExpenses = useCallback(async (force = false) => {
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
    }, []);

    // Load vendors - always load fresh data
    const loadVendors = useCallback(async (force = false) => {
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
    }, []);

    // Load open invoices - always load fresh data
    const loadOpenInvoices = useCallback(async (force = false) => {
        setLoadingStates(prev => ({ ...prev, openInvoices: true }));
        try {
            const data = await invoicesAPI.getOpen();
            setOpenInvoices(Array.isArray(data) ? data : []);
            setLoaded(prev => ({ ...prev, openInvoices: true }));
        } catch (error) {
            console.error('Error loading open invoices:', error);
            setOpenInvoices([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, openInvoices: false }));
        }
    }, []);

    // Load closed invoices - always load fresh data
    const loadClosedInvoices = useCallback(async (force = false) => {
        setLoadingStates(prev => ({ ...prev, closedInvoices: true }));
        try {
            const data = await invoicesAPI.getClosed();
            setClosedInvoices(Array.isArray(data) ? data : []);
            setLoaded(prev => ({ ...prev, closedInvoices: true }));
        } catch (error) {
            console.error('Error loading closed invoices:', error);
            console.error('Error details:', error.response || error.message);
            setClosedInvoices([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, closedInvoices: false }));
        }
    }, []);

    // Load next invoice number - always load fresh data
    const loadNextInvoiceNumber = useCallback(async (force = false) => {
        setLoadingStates(prev => ({ ...prev, nextInvoiceNumber: true }));
        try {
            const data = await invoicesAPI.getNextNumber();
            setNextInvoiceNumber(data.number || 'SKT-INV-2025-0001');
            setLoaded(prev => ({ ...prev, nextInvoiceNumber: true }));
        } catch (error) {
            console.error('Error loading next invoice number:', error);
            setNextInvoiceNumber('SKT-INV-2025-0001');
        } finally {
            setLoadingStates(prev => ({ ...prev, nextInvoiceNumber: false }));
        }
    }, []);

    // Load company settings - always load fresh data
    const loadCompanySettings = useCallback(async (force = false) => {
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
    }, []);

    // CRUD functions for customers
    const addCustomer = useCallback(async (customer) => {
        try {
            const newCustomer = await customersAPI.create(customer);
            setCustomers(prev => [...prev, newCustomer]);
            return newCustomer;
        } catch (error) {
            throw error;
        }
    }, []);

    const updateCustomer = async (updatedCustomer) => {
        // Optimistic update
        const previousCustomer = customers.find(c => c.id === updatedCustomer.id);
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));

        try {
            const customer = await customersAPI.update(updatedCustomer.id, updatedCustomer);
            setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? customer : c));
            return customer;
        } catch (error) {
            // Revert optimistic update on error
            setCustomers(prev => prev.map(c => c.id === previousCustomer.id ? previousCustomer : c));
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

    // CRUD functions for drivers
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

    // CRUD functions for services
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

    // CRUD functions for accounts
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

    // CRUD functions for expense types
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

    // CRUD functions for vendors
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
    const generateInvoice = useCallback(async (invoiceData) => {
        try {
            const createInvoiceDto = {
                date: invoiceData.date || new Date().toISOString().split('T')[0],
                customerId: invoiceData.customerId,
                driverId: invoiceData.driverId,
                driverNotes: invoiceData.driverNotes || null,
                adults: invoiceData.adults ?? invoiceData.persons ?? 0,
                children: invoiceData.children ?? 0,
                tripType: invoiceData.tripType || 'Morning',
                tripMode: invoiceData.tripMode || 'Shared',
                services: invoiceData.services || [],
                expenses: invoiceData.expenses || [],
                payments: invoiceData.payments || []
            };

            const newInvoice = await invoicesAPI.create(createInvoiceDto);

            // Selectively reload only affected data
            await Promise.all([
                loadOpenInvoices(true), // New invoice will be open
                loadNextInvoiceNumber(true) // Invoice number was used
            ]);

            return newInvoice;
        } catch (error) {
            throw error;
        }
    }, [loadOpenInvoices, loadNextInvoiceNumber]);

    const addPayment = async (invoiceId, paymentData) => {
        try {
            const updatedInvoice = await invoicesAPI.addPayment(invoiceId, {
                accountId: paymentData.accountId || accounts.find(a => a.name === paymentData.method)?.id,
                amount: paymentData.amount,
                date: paymentData.date,
                reference: paymentData.reference,
                notes: paymentData.notes
            });


            // Selectively reload - payment might move invoice from open to closed
            await Promise.all([
                loadOpenInvoices(true),
                loadClosedInvoices(true)
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
                loadOpenInvoices(true)
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

    const assignDriver = async (invoiceId, driverName, driverNotes = null, date = null) => {
        try {
            const driverId = drivers.find(d => d.name === driverName)?.id;
            const assignData = {
                driverId,
                driverNotes: driverNotes || null
            };

            // Add date if provided
            if (date) {
                assignData.date = date;
            }

            const updatedInvoice = await invoicesAPI.assignDriver(invoiceId, assignData);
            // Force reload invoices
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
                loadOpenInvoices(true)
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
                loadOpenInvoices(true)
            ]);

            return updatedInvoice;
        } catch (error) {
            throw error;
        }
    };

    const sendInvoiceEmail = async (invoiceId) => {
        try {
            const result = await invoicesAPI.sendEmail(invoiceId);


            // Reload invoices to get updated emailSentAt timestamp
            await Promise.all([
                loadOpenInvoices(true),
                loadClosedInvoices(true)
            ]);

            return result;
        } catch (error) {
            throw error;
        }
    };

    const deleteInvoice = async (invoiceId) => {
        try {
            const result = await invoicesAPI.delete(invoiceId);


            // Reload invoices to reflect the deletion
            await Promise.all([
                loadOpenInvoices(true),
                loadClosedInvoices(true)
            ]);

            return result;
        } catch (error) {
            throw error;
        }
    };

    const closeInvoice = async (invoiceId) => {
        try {
            const result = await invoicesAPI.closeInvoice(invoiceId);

            // Reload invoices to reflect the closure (moves from open to closed)
            await Promise.all([
                loadOpenInvoices(true),
                loadClosedInvoices(true)
            ]);

            return result;
        } catch (error) {
            throw error;
        }
    };

    return (
        <InvoiceContext.Provider value={{
            // Data
            customers,
            drivers,
            services,
            accounts,
            expenses,
            vendors,
            openInvoices,
            closedInvoices,
            nextInvoiceNumber,
            companySettings,

            // Loading states
            loadingStates,

            // Load functions
            loadCustomers,
            loadDrivers,
            loadServices,
            loadAccounts,
            loadExpenses,
            loadVendors,
            loadOpenInvoices,
            loadClosedInvoices,
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
            sendInvoiceEmail,
            deleteInvoice,
            closeInvoice,
        }}>
            {children}
        </InvoiceContext.Provider>
    );
}

export function useInvoice() {
    const context = useContext(InvoiceContext);
    if (context === undefined) {
        throw new Error('useInvoice must be used within an InvoiceProvider');
    }
    return context;
}
