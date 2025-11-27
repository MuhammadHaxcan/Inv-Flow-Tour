// Use HTTP for development (port 5104) or HTTPS (port 7291)
// If using HTTPS, you may need to accept the self-signed certificate in your browser
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5104/api';

// Connection check
let isBackendAvailable = null;
let connectionCheckPromise = null;

const checkBackendConnection = async () => {
    if (connectionCheckPromise) {
        return connectionCheckPromise;
    }

    connectionCheckPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL.replace('/api', '')}/swagger/index.html`, {
                method: 'HEAD',
                mode: 'no-cors'
            });
            isBackendAvailable = true;
            return true;
        } catch (error) {
            // Try a simple API call instead
            try {
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                isBackendAvailable = true;
                return true;
            } catch (e) {
                isBackendAvailable = false;
                return false;
            }
        }
    })();

    return connectionCheckPromise;
};

// Helper function to get auth token
const getToken = () => {
    return localStorage.getItem('token');
};

// Helper function to make API calls with retry logic
const apiCall = async (endpoint, options = {}, retries = 0) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('permissions');
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: `HTTP error! status: ${response.status}` };
            }
            const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
            const error = new Error(errorMessage);
            error.response = errorData;
            throw error;
        }

        return response.json();
    } catch (error) {
        // Handle connection errors
        if ((error.message.includes('Failed to fetch') || 
            error.message.includes('ERR_CONNECTION_REFUSED') ||
            error.message.includes('NetworkError') ||
            error.name === 'TypeError') && retries < 1) {
            
            // Check if backend is available
            const isAvailable = await checkBackendConnection();
            
            if (!isAvailable) {
                const errorMsg = `Cannot connect to server. Please ensure the backend is running on ${API_BASE_URL.replace('/api', '')}`;
                console.error(errorMsg);
                throw new Error(errorMsg);
            }
            
            // Retry once if backend seems available
            return apiCall(endpoint, options, retries + 1);
        }
        throw error;
    }
};

// Auth API
export const authAPI = {
    login: async (username, password) => {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },
    register: async (username, email, password, fullName) => {
        return apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, fullName }),
        });
    },
    getCurrentUser: async () => {
        return apiCall('/auth/me');
    },
};

// Customers API
export const customersAPI = {
    getAll: () => apiCall('/customers'),
    getById: (id) => apiCall(`/customers/${id}`),
    create: (data) => apiCall('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/customers/${id}`, { method: 'DELETE' }),
};

// Drivers API
export const driversAPI = {
    getAll: () => apiCall('/drivers'),
    getById: (id) => apiCall(`/drivers/${id}`),
    create: (data) => apiCall('/drivers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/drivers/${id}`, { method: 'DELETE' }),
};

// Services API
export const servicesAPI = {
    getAll: () => apiCall('/services'),
    getById: (id) => apiCall(`/services/${id}`),
    create: (data) => apiCall('/services', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/services/${id}`, { method: 'DELETE' }),
};

// Accounts API
export const accountsAPI = {
    getAll: () => apiCall('/accounts'),
    getById: (id) => apiCall(`/accounts/${id}`),
    create: (data) => apiCall('/accounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/accounts/${id}`, { method: 'DELETE' }),
};

// Expense Types API
export const expenseTypesAPI = {
    getAll: () => apiCall('/expensetypes'),
    getById: (id) => apiCall(`/expensetypes/${id}`),
    create: (data) => apiCall('/expensetypes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/expensetypes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/expensetypes/${id}`, { method: 'DELETE' }),
};

// Vendors API
export const vendorsAPI = {
    getAll: () => apiCall('/vendors'),
    getById: (id) => apiCall(`/vendors/${id}`),
    create: (data) => apiCall('/vendors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/vendors/${id}`, { method: 'DELETE' }),
};

// Invoices API
export const invoicesAPI = {
    getOpen: () => apiCall('/invoices/open'),
    getClosed: () => apiCall('/invoices/closed'),
    getById: (id) => apiCall(`/invoices/${id}`),
    getNextNumber: () => apiCall('/invoices/next-number'),
    create: (data) => apiCall('/invoices', { method: 'POST', body: JSON.stringify(data) }),
    addPayment: (id, data) => apiCall(`/invoices/${id}/payments`, { method: 'POST', body: JSON.stringify(data) }),
    addExpense: (id, data) => apiCall(`/invoices/${id}/expenses`, { method: 'POST', body: JSON.stringify(data) }),
    addService: (id, data) => apiCall(`/invoices/${id}/services`, { method: 'POST', body: JSON.stringify(data) }),
    updateService: (id, data) => apiCall(`/invoices/${id}/services`, { method: 'PUT', body: JSON.stringify(data) }),
    removeService: (id, serviceId) => apiCall(`/invoices/${id}/services/${serviceId}`, { method: 'DELETE' }),
    assignDriver: (id, data) => apiCall(`/invoices/${id}/driver`, { method: 'PUT', body: JSON.stringify(data) }),
    updateExpense: (id, expenseId, data) => apiCall(`/invoices/${id}/expenses/${expenseId}`, { method: 'PUT', body: JSON.stringify(data) }),
    removeExpense: (id, expenseId) => apiCall(`/invoices/${id}/expenses/${expenseId}`, { method: 'DELETE' }),
    getOutstandingExpenses: () => apiCall('/invoices/expenses/outstanding'),
    markExpensePaid: (expenseId, data) => apiCall(`/invoices/expenses/${expenseId}/mark-paid`, { method: 'POST', body: JSON.stringify(data) }),
};

// Transactions API
export const transactionsAPI = {
    getAll: () => apiCall('/transactions'),
    getByAccount: (accountId) => apiCall(`/transactions/account/${accountId}`),
    getByInvoice: (invoiceId) => apiCall(`/transactions/invoice/${invoiceId}`),
};

// Users API
export const usersAPI = {
    getAll: () => apiCall('/users'),
    getById: (id) => apiCall(`/users/${id}`),
    create: (data) => apiCall('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/users/${id}`, { method: 'DELETE' }),
    changePassword: (data) => apiCall('/users/change-password', { method: 'POST', body: JSON.stringify(data) }),
    adminChangePassword: (id, data) => apiCall(`/users/${id}/change-password`, { method: 'POST', body: JSON.stringify(data) }),
};

// Roles API
export const rolesAPI = {
    getAll: () => apiCall('/roles'),
    getById: (id) => apiCall(`/roles/${id}`),
    create: (data) => apiCall('/roles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/roles/${id}`, { method: 'DELETE' }),
};

// Permissions API
export const permissionsAPI = {
    getAll: () => apiCall('/permissions'),
    getById: (id) => apiCall(`/permissions/${id}`),
};

// Reports API
export const reportsAPI = {
    getServiceReport: (filters) => apiCall('/reports/service', {
        method: 'POST',
        body: JSON.stringify(filters)
    }),
    getCustomerReport: (filters) => apiCall('/reports/customer', {
        method: 'POST',
        body: JSON.stringify(filters)
    }),
    getDriverReport: (filters) => apiCall('/reports/driver', {
        method: 'POST',
        body: JSON.stringify(filters)
    }),
    getSummaryReport: (filters) => apiCall('/reports/summary', {
        method: 'POST',
        body: JSON.stringify(filters)
    }),
};