// Permission constants for the application
// These should match the backend permission names

export const PERMISSIONS = {
    // Invoice permissions
    INVOICES_READ: 'invoices.read',
    INVOICES_WRITE: 'invoices.write',
    INVOICES_DELETE: 'invoices.delete',
    
    // Closed invoice permissions
    CLOSEDINVOICES_READ: 'closedinvoices.read',
    
    // Service permissions
    SERVICES_READ: 'services.read',
    SERVICES_WRITE: 'services.write',
    SERVICES_DELETE: 'services.delete',
        
    // Account permissions
    ACCOUNTS_READ: 'accounts.read',
    ACCOUNTS_WRITE: 'accounts.write',
    ACCOUNTS_DELETE: 'accounts.delete',
    
    // Transaction permissions
    TRANSACTIONS_READ: 'transactions.read',
    
    // Report permissions
    REPORTS_READ: 'reports.read',
    REPORTS_WRITE: 'reports.write',
    
    // Customer permissions
    CUSTOMERS_READ: 'customers.read',
    CUSTOMERS_WRITE: 'customers.write',
    CUSTOMERS_DELETE: 'customers.delete',
    
    // Driver permissions
    DRIVERS_READ: 'drivers.read',
    DRIVERS_WRITE: 'drivers.write',
    DRIVERS_DELETE: 'drivers.delete',
    
    // Vendor permissions
    VENDORS_READ: 'vendors.read',
    VENDORS_WRITE: 'vendors.write',
    VENDORS_DELETE: 'vendors.delete',
    
    // Expense Type permissions (matches backend 'expenses' resource)
    EXPENSE_TYPES_READ: 'expenses.read',
    EXPENSE_TYPES_WRITE: 'expenses.write',
    EXPENSE_TYPES_DELETE: 'expenses.delete',
    
    // User permissions
    USERS_READ: 'users.read',
    USERS_WRITE: 'users.write',
    USERS_DELETE: 'users.delete',
    
    // Role permissions
    ROLES_READ: 'roles.read',
    ROLES_WRITE: 'roles.write',
    ROLES_DELETE: 'roles.delete',
    
    // Permission permissions
    PERMISSIONS_READ: 'permissions.read',
    
    // Signature permissions
    SIGNATURES_READ: 'signatures.read',
    SIGNATURES_WRITE: 'signatures.write',
    SIGNATURES_DELETE: 'signatures.delete',
    
    // Company Settings permissions
    COMPANY_SETTINGS_READ: 'companysettings.read',
    COMPANY_SETTINGS_WRITE: 'companysettings.write',
};

    // Page access requirements
export const PAGE_PERMISSIONS = {
    generateInvoice: [PERMISSIONS.INVOICES_WRITE],
    openInvoices: [PERMISSIONS.INVOICES_READ],
    closedInvoices: [PERMISSIONS.CLOSEDINVOICES_READ],
    outstandingExpenses: [PERMISSIONS.INVOICES_READ],
    calendar: [PERMISSIONS.INVOICES_READ],
    bankStatement: [PERMISSIONS.TRANSACTIONS_READ],
    services: [PERMISSIONS.SERVICES_READ],
    chartOfAccounts: [PERMISSIONS.ACCOUNTS_READ],
    reports: [PERMISSIONS.REPORTS_READ],
    admin: [PERMISSIONS.USERS_READ, PERMISSIONS.ROLES_READ],
};

// Action permissions for specific operations
export const ACTION_PERMISSIONS = {
    // Invoice actions
    addPayment: [PERMISSIONS.INVOICES_WRITE],
    addExpense: [PERMISSIONS.INVOICES_WRITE],
    editExpense: [PERMISSIONS.INVOICES_WRITE],
    deleteExpense: [PERMISSIONS.INVOICES_DELETE],
    addService: [PERMISSIONS.INVOICES_WRITE],
    editService: [PERMISSIONS.INVOICES_WRITE],
    deleteService: [PERMISSIONS.INVOICES_DELETE],
    assignDriver: [PERMISSIONS.INVOICES_WRITE],
    sendEmail: [PERMISSIONS.INVOICES_WRITE],
    printInvoice: [PERMISSIONS.INVOICES_READ],
    
    // Service actions
    createService: [PERMISSIONS.SERVICES_WRITE],
    editServiceMaster: [PERMISSIONS.SERVICES_WRITE],
    deleteServiceMaster: [PERMISSIONS.SERVICES_DELETE],
    
    // Account actions
    createAccount: [PERMISSIONS.ACCOUNTS_WRITE],
    editAccount: [PERMISSIONS.ACCOUNTS_WRITE],
    deleteAccount: [PERMISSIONS.ACCOUNTS_DELETE],
    
    // Customer actions
    createCustomer: [PERMISSIONS.CUSTOMERS_WRITE],
    editCustomer: [PERMISSIONS.CUSTOMERS_WRITE],
    deleteCustomer: [PERMISSIONS.CUSTOMERS_DELETE],
    
    // Driver actions
    createDriver: [PERMISSIONS.DRIVERS_WRITE],
    editDriver: [PERMISSIONS.DRIVERS_WRITE],
    deleteDriver: [PERMISSIONS.DRIVERS_DELETE],
    
    // Vendor actions
    createVendor: [PERMISSIONS.VENDORS_WRITE],
    editVendor: [PERMISSIONS.VENDORS_WRITE],
    deleteVendor: [PERMISSIONS.VENDORS_DELETE],
    
    // Expense Type actions
    createExpenseType: [PERMISSIONS.EXPENSE_TYPES_WRITE],
    editExpenseType: [PERMISSIONS.EXPENSE_TYPES_WRITE],
    deleteExpenseType: [PERMISSIONS.EXPENSE_TYPES_DELETE],
    
    // User actions
    createUser: [PERMISSIONS.USERS_WRITE],
    editUser: [PERMISSIONS.USERS_WRITE],
    deleteUser: [PERMISSIONS.USERS_DELETE],
    
    // Role actions
    createRole: [PERMISSIONS.ROLES_WRITE],
    editRole: [PERMISSIONS.ROLES_WRITE],
    deleteRole: [PERMISSIONS.ROLES_DELETE],
    
    // Signature actions
    createSignature: [PERMISSIONS.SIGNATURES_WRITE],
    deleteSignature: [PERMISSIONS.SIGNATURES_DELETE],
    setActiveSignature: [PERMISSIONS.SIGNATURES_WRITE],
    
    // Company settings actions
    updateLogo: [PERMISSIONS.COMPANY_SETTINGS_WRITE],
    clearLogo: [PERMISSIONS.COMPANY_SETTINGS_WRITE],
};

export default PERMISSIONS;

