import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS, ACTION_PERMISSIONS, PAGE_PERMISSIONS } from '../constants/permissions';

/**
 * Custom hook for permission checking throughout the app
 * Provides convenient methods to check various permission combinations
 */
export function usePermissions() {
    const { permissions, hasPermission, hasAnyPermission } = useAuth();

    /**
     * Check if user can access a specific page
     * @param {string} pageName - The page name from PAGE_PERMISSIONS
     * @returns {boolean}
     */
    const canAccessPage = (pageName) => {
        const requiredPermissions = PAGE_PERMISSIONS[pageName];
        if (!requiredPermissions || requiredPermissions.length === 0) return true;
        return hasAnyPermission(requiredPermissions);
    };

    /**
     * Check if user can perform a specific action
     * @param {string} actionName - The action name from ACTION_PERMISSIONS
     * @returns {boolean}
     */
    const canPerformAction = (actionName) => {
        const requiredPermissions = ACTION_PERMISSIONS[actionName];
        if (!requiredPermissions || requiredPermissions.length === 0) return true;
        return hasAnyPermission(requiredPermissions);
    };

    // Invoice permissions
    const canReadInvoices = hasPermission(PERMISSIONS.INVOICES_READ);
    const canWriteInvoices = hasPermission(PERMISSIONS.INVOICES_WRITE);
    const canDeleteInvoices = hasPermission(PERMISSIONS.INVOICES_DELETE);

    // Service permissions
    const canReadServices = hasPermission(PERMISSIONS.SERVICES_READ);
    const canWriteServices = hasPermission(PERMISSIONS.SERVICES_WRITE);
    const canDeleteServices = hasPermission(PERMISSIONS.SERVICES_DELETE);

    // Account permissions
    const canReadAccounts = hasPermission(PERMISSIONS.ACCOUNTS_READ);
    const canWriteAccounts = hasPermission(PERMISSIONS.ACCOUNTS_WRITE);
    const canDeleteAccounts = hasPermission(PERMISSIONS.ACCOUNTS_DELETE);

    // Transaction permissions
    const canReadTransactions = hasPermission(PERMISSIONS.TRANSACTIONS_READ);

    // Report permissions
    const canReadReports = hasPermission(PERMISSIONS.REPORTS_READ);
    const canWriteReports = hasPermission(PERMISSIONS.REPORTS_WRITE);

    // Customer permissions
    const canReadCustomers = hasPermission(PERMISSIONS.CUSTOMERS_READ);
    const canWriteCustomers = hasPermission(PERMISSIONS.CUSTOMERS_WRITE);
    const canDeleteCustomers = hasPermission(PERMISSIONS.CUSTOMERS_DELETE);

    // Driver permissions
    const canReadDrivers = hasPermission(PERMISSIONS.DRIVERS_READ);
    const canWriteDrivers = hasPermission(PERMISSIONS.DRIVERS_WRITE);
    const canDeleteDrivers = hasPermission(PERMISSIONS.DRIVERS_DELETE);

    // Vendor permissions
    const canReadVendors = hasPermission(PERMISSIONS.VENDORS_READ);
    const canWriteVendors = hasPermission(PERMISSIONS.VENDORS_WRITE);
    const canDeleteVendors = hasPermission(PERMISSIONS.VENDORS_DELETE);

    // Expense Type permissions
    const canReadExpenseTypes = hasPermission(PERMISSIONS.EXPENSE_TYPES_READ);
    const canWriteExpenseTypes = hasPermission(PERMISSIONS.EXPENSE_TYPES_WRITE);
    const canDeleteExpenseTypes = hasPermission(PERMISSIONS.EXPENSE_TYPES_DELETE);

    // User permissions
    const canReadUsers = hasPermission(PERMISSIONS.USERS_READ);
    const canWriteUsers = hasPermission(PERMISSIONS.USERS_WRITE);
    const canDeleteUsers = hasPermission(PERMISSIONS.USERS_DELETE);

    // Role permissions
    const canReadRoles = hasPermission(PERMISSIONS.ROLES_READ);
    const canWriteRoles = hasPermission(PERMISSIONS.ROLES_WRITE);
    const canDeleteRoles = hasPermission(PERMISSIONS.ROLES_DELETE);

    // Permission permissions
    const canReadPermissions = hasPermission(PERMISSIONS.PERMISSIONS_READ);

    // Signature permissions
    const canReadSignatures = hasPermission(PERMISSIONS.SIGNATURES_READ);
    const canWriteSignatures = hasPermission(PERMISSIONS.SIGNATURES_WRITE);
    const canDeleteSignatures = hasPermission(PERMISSIONS.SIGNATURES_DELETE);

    // Company Settings permissions
    const canReadCompanySettings = hasPermission(PERMISSIONS.COMPANY_SETTINGS_READ);
    const canWriteCompanySettings = hasPermission(PERMISSIONS.COMPANY_SETTINGS_WRITE);

    // Composite permissions for common use cases
    const canAccessAdmin = canReadUsers || canReadRoles || canReadPermissions;
    const canManageInvoices = canReadInvoices || canWriteInvoices;
    const canManageServices = canReadServices || canWriteServices;
    const canManageAccounts = canReadAccounts || canWriteAccounts;

    // Chart of Accounts category permissions
    const canWriteCategory = (category) => {
        switch (category) {
            case 'customer':
                return canWriteCustomers;
            case 'driver':
                return canWriteDrivers;
            case 'vendor':
                return canWriteVendors;
            case 'expense':
                return canWriteExpenseTypes;
            case 'bank':
                return canWriteAccounts;
            default:
                return false;
        }
    };

    const canDeleteCategory = (category) => {
        switch (category) {
            case 'customer':
                return canDeleteCustomers;
            case 'driver':
                return canDeleteDrivers;
            case 'vendor':
                return canDeleteVendors;
            case 'expense':
                return canDeleteExpenseTypes;
            case 'bank':
                return canDeleteAccounts;
            default:
                return false;
        }
    };

    return {
        // Raw permissions array
        permissions,
        
        // Base permission check functions
        hasPermission,
        hasAnyPermission,
        
        // Page/Action helpers
        canAccessPage,
        canPerformAction,
        
        // Invoice permissions
        canReadInvoices,
        canWriteInvoices,
        canDeleteInvoices,
        
        // Service permissions
        canReadServices,
        canWriteServices,
        canDeleteServices,
        
        // Account permissions
        canReadAccounts,
        canWriteAccounts,
        canDeleteAccounts,
        
        // Transaction permissions
        canReadTransactions,
        
        // Report permissions
        canReadReports,
        canWriteReports,
        
        // Customer permissions
        canReadCustomers,
        canWriteCustomers,
        canDeleteCustomers,
        
        // Driver permissions
        canReadDrivers,
        canWriteDrivers,
        canDeleteDrivers,
        
        // Vendor permissions
        canReadVendors,
        canWriteVendors,
        canDeleteVendors,
        
        // Expense Type permissions
        canReadExpenseTypes,
        canWriteExpenseTypes,
        canDeleteExpenseTypes,
        
        // User permissions
        canReadUsers,
        canWriteUsers,
        canDeleteUsers,
        
        // Role permissions
        canReadRoles,
        canWriteRoles,
        canDeleteRoles,
        
        // Permission permissions
        canReadPermissions,
        
        // Signature permissions
        canReadSignatures,
        canWriteSignatures,
        canDeleteSignatures,
        
        // Company Settings permissions
        canReadCompanySettings,
        canWriteCompanySettings,
        
        // Composite permissions
        canAccessAdmin,
        canManageInvoices,
        canManageServices,
        canManageAccounts,
        
        // Category-based permissions
        canWriteCategory,
        canDeleteCategory,
    };
}

export default usePermissions;

