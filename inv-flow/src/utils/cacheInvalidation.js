/**
 * Cache Invalidation Utility
 * Provides intelligent cache invalidation strategies for different data types
 */

export const CACHE_KEYS = {
    CUSTOMERS: 'customers',
    DRIVERS: 'drivers',
    SERVICES: 'services',
    ACCOUNTS: 'accounts',
    EXPENSE_TYPES: 'expenses',
    VENDORS: 'vendors',
    OPEN_INVOICES: 'openInvoices',
    CLOSED_INVOICES: 'closedInvoices',
    TRANSACTIONS: 'transactions',
    NEXT_INVOICE_NUMBER: 'nextInvoiceNumber',
    COMPANY_SETTINGS: 'companySettings'
};

export const INVALIDATION_STRATEGIES = {
    // Invalidate specific data types
    SPECIFIC: 'specific',

    // Invalidate all invoice-related data
    INVOICE_RELATED: 'invoice_related',

    // Invalidate all transaction-related data
    TRANSACTION_RELATED: 'transaction_related',

    // Invalidate everything
    ALL: 'all'
};

/**
 * Get invalidation strategy based on operation type
 */
export const getInvalidationStrategy = (operationType, dataType) => {
    const strategies = {
        // Invoice CRUD operations
        'invoice.create': INVALIDATION_STRATEGIES.INVOICE_RELATED,
        'invoice.update': INVALIDATION_STRATEGIES.INVOICE_RELATED,
        'invoice.addPayment': INVALIDATION_STRATEGIES.INVOICE_RELATED,
        'invoice.addExpense': INVALIDATION_STRATEGIES.INVOICE_RELATED,
        'invoice.addService': INVALIDATION_STRATEGIES.INVOICE_RELATED,
        'invoice.removeService': INVALIDATION_STRATEGIES.INVOICE_RELATED,
        'invoice.assignDriver': INVALIDATION_STRATEGIES.INVOICE_RELATED,
        'invoice.updateExpense': INVALIDATION_STRATEGIES.INVOICE_RELATED,
        'invoice.removeExpense': INVALIDATION_STRATEGIES.INVOICE_RELATED,
        'invoice.sendEmail': INVALIDATION_STRATEGIES.SPECIFIC,

        // Customer operations
        'customer.create': INVALIDATION_STRATEGIES.SPECIFIC,
        'customer.update': INVALIDATION_STRATEGIES.SPECIFIC,
        'customer.delete': INVALIDATION_STRATEGIES.SPECIFIC,

        // Driver operations
        'driver.create': INVALIDATION_STRATEGIES.SPECIFIC,
        'driver.update': INVALIDATION_STRATEGIES.SPECIFIC,
        'driver.delete': INVALIDATION_STRATEGIES.SPECIFIC,

        // Service operations
        'service.create': INVALIDATION_STRATEGIES.SPECIFIC,
        'service.update': INVALIDATION_STRATEGIES.SPECIFIC,
        'service.delete': INVALIDATION_STRATEGIES.SPECIFIC,

        // Account operations
        'account.create': INVALIDATION_STRATEGIES.SPECIFIC,
        'account.update': INVALIDATION_STRATEGIES.SPECIFIC,
        'account.delete': INVALIDATION_STRATEGIES.SPECIFIC,

        // Expense type operations
        'expenseType.create': INVALIDATION_STRATEGIES.SPECIFIC,
        'expenseType.update': INVALIDATION_STRATEGIES.SPECIFIC,
        'expenseType.delete': INVALIDATION_STRATEGIES.SPECIFIC,

        // Vendor operations
        'vendor.create': INVALIDATION_STRATEGIES.SPECIFIC,
        'vendor.update': INVALIDATION_STRATEGIES.SPECIFIC,
        'vendor.delete': INVALIDATION_STRATEGIES.SPECIFIC
    };

    return strategies[`${dataType}.${operationType}`] || INVALIDATION_STRATEGIES.SPECIFIC;
};

/**
 * Get keys to invalidate based on strategy
 */
export const getInvalidationKeys = (strategy, specificKey = null) => {
    switch (strategy) {
        case INVALIDATION_STRATEGIES.SPECIFIC:
            return specificKey ? [specificKey] : [];

        case INVALIDATION_STRATEGIES.INVOICE_RELATED:
            return [
                CACHE_KEYS.CUSTOMERS,
                CACHE_KEYS.DRIVERS,
                CACHE_KEYS.SERVICES,
                CACHE_KEYS.ACCOUNTS,
                CACHE_KEYS.EXPENSE_TYPES,
                CACHE_KEYS.VENDORS,
                CACHE_KEYS.OPEN_INVOICES,
                CACHE_KEYS.CLOSED_INVOICES,
                CACHE_KEYS.NEXT_INVOICE_NUMBER,
                CACHE_KEYS.COMPANY_SETTINGS
            ];

        case INVALIDATION_STRATEGIES.TRANSACTION_RELATED:
            return [
                CACHE_KEYS.TRANSACTIONS,
                CACHE_KEYS.ACCOUNTS
            ];

        case INVALIDATION_STRATEGIES.ALL:
            return Object.values(CACHE_KEYS);

        default:
            return [];
    }
};

/**
 * Smart invalidation function that determines what to invalidate based on operation
 */
export const invalidateCache = (operationType, dataType, specificKey = null) => {
    const strategy = getInvalidationStrategy(operationType, dataType);
    return getInvalidationKeys(strategy, specificKey);
};

/**
 * Optimistic update utilities
 */
export const optimisticUpdates = {
    // Add item to array
    add: (array, newItem) => [...array, newItem],

    // Update item in array
    update: (array, updatedItem, idField = 'id') =>
        array.map(item => item[idField] === updatedItem[idField] ? updatedItem : item),

    // Remove item from array
    remove: (array, itemId, idField = 'id') =>
        array.filter(item => item[idField] !== itemId)
};

/**
 * Create optimistic update function
 */
export const createOptimisticUpdate = (operation, currentData, newData, idField = 'id') => {
    switch (operation) {
        case 'create':
            return optimisticUpdates.add(currentData, newData);
        case 'update':
            return optimisticUpdates.update(currentData, newData, idField);
        case 'delete':
            return optimisticUpdates.remove(currentData, newData, idField);
        default:
            return currentData;
    }
};
