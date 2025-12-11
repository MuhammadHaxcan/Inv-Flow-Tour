// API Base URL Configuration
// Development: http://localhost:5104/api
// Production with nginx proxy: /api (relative URL)
// Production with separate domain: https://api.yourdomain.com/api
const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    
    // If VITE_API_URL is set, use it
    if (envUrl) {
        // If it's a relative URL (starts with /), use as-is
        if (envUrl.startsWith('/')) {
            return envUrl;
        }
        // If it's an absolute URL, use it
        return envUrl;
    }
    
    // Default to localhost for development
    return 'http://localhost:5104/api';
};

const API_BASE_URL = getApiBaseUrl();

// Connection check
let isBackendAvailable = null;
let connectionCheckPromise = null;

const checkBackendConnection = async () => {
    if (connectionCheckPromise) {
        return connectionCheckPromise;
    }

    connectionCheckPromise = (async () => {
        // Skip connection check for relative URLs (production with proxy)
        if (API_BASE_URL.startsWith('/')) {
            isBackendAvailable = true;
            return true;
        }
        
        try {
            const baseUrlWithoutApi = API_BASE_URL.replace('/api', '');
            const response = await fetch(`${baseUrlWithoutApi}/swagger/index.html`, {
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

// Cache configuration
const CACHE_CONFIG = {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    MAX_CACHE_SIZE: 200, // Increased from 100 to 200
};

// LRU Cache implementation
class LRUCache {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }
        // Move to end (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            // Update existing - move to end
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Remove least recently used (first item)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    delete(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    has(key) {
        return this.cache.has(key);
    }

    get size() {
        return this.cache.size;
    }

    keys() {
        return this.cache.keys();
    }

    // Clear entries matching pattern
    clearPattern(pattern) {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
}

// In-memory cache with LRU eviction
const responseCache = new LRUCache(CACHE_CONFIG.MAX_CACHE_SIZE);

// Cache utilities
const getCacheKey = (endpoint, options) => {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${endpoint}:${body}`;
};

const getCachedResponse = (key) => {
    const cached = responseCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
        responseCache.delete(key);
        return null;
    }

    return cached.data;
};

const setCachedResponse = (key, data, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
    // Clean up old entries if cache is too large
    if (responseCache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
        const oldestKey = responseCache.keys().next().value;
        responseCache.delete(oldestKey);
    }

    responseCache.set(key, {
        data,
        expiry: Date.now() + ttl
    });
};

// Enhanced retry configuration
const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504], // Request Timeout, Too Many Requests, Server Errors
    retryableErrors: ['NetworkError', 'TimeoutError', 'TypeError']
};

// Calculate delay with exponential backoff and jitter
const calculateRetryDelay = (attempt) => {
    const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
        RETRY_CONFIG.maxDelay
    );
    // Add jitter (±25% of delay)
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    return Math.max(100, delay + jitter);
};

// Check if error is retryable
const isRetryableError = (error, statusCode) => {
    if (statusCode && RETRY_CONFIG.retryableStatusCodes.includes(statusCode)) {
        return true;
    }

    if (error && RETRY_CONFIG.retryableErrors.some(retryableError =>
        error.message?.includes(retryableError) || error.name === retryableError
    )) {
        return true;
    }

    return false;
};

// Enhanced API call function with caching, retry logic, and timeout
const apiCall = async (endpoint, options = {}, retries = 0, useCache = true) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add ngrok skip header only if needed (development)
    if (API_BASE_URL.includes('ngrok')) {
        headers['ngrok-skip-browser-warning'] = 'true';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Check cache for GET requests
    const method = options.method || 'GET';
    const cacheKey = getCacheKey(endpoint, options);

    if (method === 'GET' && useCache) {
        const cachedResponse = getCachedResponse(cacheKey);
        if (cachedResponse) {
            return cachedResponse;
        }
    }

    try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 401) {
            // Unauthorized - clear token and redirect to login (avoid loops on login page)
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('permissions');
            responseCache.clear(); // avoid serving stale cached responses without auth

            // Skip redirect if already on the login page to avoid refresh loops
            const onLoginPage = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/login');
            if (!onLoginPage) {
                window.location.href = '/login';
            }
            throw new Error('Unauthorized');
        }

        if (response.status === 403) {
            // Forbidden - user doesn't have permission
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: 'You do not have permission to access this resource' };
            }
            const errorMessage = errorData.message || errorData.error || 'You do not have permission to access this resource';
            const error = new Error(errorMessage);
            error.response = errorData;
            error.status = 403;
            throw error;
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
            error.status = response.status;
            throw error;
        }

        // Handle 204 No Content responses (common for DELETE operations)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            const result = { success: true };
            // Cache successful responses for GET requests
            if (method === 'GET' && useCache) {
                setCachedResponse(cacheKey, result);
            }
            return result;
        }

        // Try to parse JSON, return success object if empty
        const text = await response.text();
        if (!text) {
            const result = { success: true };
            if (method === 'GET' && useCache) {
                setCachedResponse(cacheKey, result);
            }
            return result;
        }

        try {
            const result = JSON.parse(text);
            // Cache successful GET responses
            if (method === 'GET' && response.ok && useCache) {
                setCachedResponse(cacheKey, result);
            }
            return result;
        } catch {
            const result = { success: true, data: text };
            if (method === 'GET' && useCache) {
                setCachedResponse(cacheKey, result);
            }
            return result;
        }
    } catch (error) {
        // Handle timeout errors
        if (error.name === 'AbortError') {
            const errorMsg = `Request timeout. The server took too long to respond. Please check your connection and try again.`;
            console.error(errorMsg);

            // Retry timeout errors
            if (retries < RETRY_CONFIG.maxRetries && isRetryableError(error)) {
                const delay = calculateRetryDelay(retries);
                console.log(`Retrying request in ${delay}ms (attempt ${retries + 1}/${RETRY_CONFIG.maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return apiCall(endpoint, options, retries + 1, useCache);
            }

            throw new Error(errorMsg);
        }

        // Handle connection errors with enhanced retry logic
        if ((error.message.includes('Failed to fetch') ||
            error.message.includes('ERR_CONNECTION_REFUSED') ||
            error.message.includes('NetworkError') ||
            error.name === 'TypeError') && retries < RETRY_CONFIG.maxRetries) {

            // Check if backend is available for first retry
            if (retries === 0) {
                const isAvailable = await checkBackendConnection();
                if (!isAvailable) {
                    const errorMsg = `Cannot connect to server. Please ensure the backend is running on ${API_BASE_URL.replace('/api', '')}`;
                    console.error(errorMsg);
                    throw new Error(errorMsg);
                }
            }

            // Retry with exponential backoff
            const delay = calculateRetryDelay(retries);
            console.log(`Retrying request in ${delay}ms (attempt ${retries + 1}/${RETRY_CONFIG.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return apiCall(endpoint, options, retries + 1, useCache);
        }

        // For other errors, check if they're retryable
        if (isRetryableError(error) && retries < RETRY_CONFIG.maxRetries) {
            const delay = calculateRetryDelay(retries);
            console.log(`Retrying request in ${delay}ms (attempt ${retries + 1}/${RETRY_CONFIG.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return apiCall(endpoint, options, retries + 1, useCache);
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
    create: (data) => apiUtils.noCache('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiUtils.noCache(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiUtils.noCache(`/customers/${id}`, { method: 'DELETE' }),
};

// Drivers API
export const driversAPI = {
    getAll: () => apiCall('/drivers'),
    getById: (id) => apiCall(`/drivers/${id}`),
    create: (data) => apiUtils.noCache('/drivers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiUtils.noCache(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiUtils.noCache(`/drivers/${id}`, { method: 'DELETE' }),
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
    create: (data) => apiUtils.noCache('/invoices', { method: 'POST', body: JSON.stringify(data) }),
    addPayment: (id, data) => apiUtils.noCache(`/invoices/${id}/payments`, { method: 'POST', body: JSON.stringify(data) }),
    addExpense: (id, data) => apiUtils.noCache(`/invoices/${id}/expenses`, { method: 'POST', body: JSON.stringify(data) }),
    addService: (id, data) => apiUtils.noCache(`/invoices/${id}/services`, { method: 'POST', body: JSON.stringify(data) }),
    updateService: (id, data) => apiUtils.noCache(`/invoices/${id}/services`, { method: 'PUT', body: JSON.stringify(data) }),
    removeService: (id, serviceId) => apiUtils.noCache(`/invoices/${id}/services/${serviceId}`, { method: 'DELETE' }),
    assignDriver: (id, data) => apiUtils.noCache(`/invoices/${id}/driver`, { method: 'PUT', body: JSON.stringify(data) }),
    updateExpense: (id, expenseId, data) => apiUtils.noCache(`/invoices/${id}/expenses/${expenseId}`, { method: 'PUT', body: JSON.stringify(data) }),
    removeExpense: (id, expenseId) => apiUtils.noCache(`/invoices/${id}/expenses/${expenseId}`, { method: 'DELETE' }),
    getOutstandingExpenses: () => apiCall('/invoices/expenses/outstanding'),
    markExpensePaid: (expenseId, data) => apiUtils.noCache(`/invoices/expenses/${expenseId}/mark-paid`, { method: 'POST', body: JSON.stringify(data) }),
    sendEmail: (id) => apiUtils.noCache(`/invoices/${id}/send-email`, { method: 'POST' }),
    getDriverSchedule: () => apiCall('/invoices/driver-schedule'),
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
    getAgentReport: (filters) => apiCall('/reports/agent', {
        method: 'POST',
        body: JSON.stringify(filters)
    }),
};

// Signatures API
export const signaturesAPI = {
    getAll: () => apiCall('/signatures'),
    getById: (id) => apiCall(`/signatures/${id}`),
    getActive: () => apiCall('/signatures/active'),
    create: (data) => apiCall('/signatures', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/signatures/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    setActive: (id) => apiCall(`/signatures/${id}/set-active`, { method: 'POST' }),
    delete: (id) => apiCall(`/signatures/${id}`, { method: 'DELETE' }),
};

// Company Settings API
export const companySettingsAPI = {
    get: () => apiCall('/companysettings'),
    update: (data) => apiCall('/companysettings', { method: 'PUT', body: JSON.stringify(data) }),
    updateLogo: (data) => apiCall('/companysettings/logo', { method: 'POST', body: JSON.stringify(data) }),
    clearLogo: () => apiCall('/companysettings/logo', { method: 'DELETE' }),
    setActiveSignature: (signatureId) => apiCall(`/companysettings/signature/${signatureId}`, { method: 'POST' }),
    getEmail: () => apiCall('/companysettings/email'),
    updateEmail: (data) => apiCall('/companysettings/email', { method: 'PUT', body: JSON.stringify(data) }),
};

// Enhanced API utilities
export const apiUtils = {
    // Clear all cached responses
    clearCache: () => {
        responseCache.clear();
    },

    // Clear cache for specific endpoint pattern
    clearCacheFor: (endpointPattern) => {
        responseCache.clearPattern(endpointPattern);
    },

    // Get cache statistics
    getCacheStats: () => ({
        size: responseCache.size,
        maxSize: CACHE_CONFIG.MAX_CACHE_SIZE
    }),

    // Make API call without caching (for mutations)
    noCache: (endpoint, options = {}) => apiCall(endpoint, options, 0, false),

    // Make API call with custom TTL (not implemented yet)
    withTTL: (endpoint, options = {}, ttl) => apiCall(endpoint, options, 0, true)
};