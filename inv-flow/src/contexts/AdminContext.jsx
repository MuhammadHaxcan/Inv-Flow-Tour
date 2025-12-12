import React, { createContext, useState, useContext, useCallback } from 'react';
import {
    usersAPI, rolesAPI, permissionsAPI, signaturesAPI, companySettingsAPI
} from '../services/api';

const AdminContext = createContext({
    // Admin data
    users: [],
    roles: [],
    permissions: [],
    signatures: [],
    companySettings: null,

    // Loading states
    loadingStates: {
        users: false,
        roles: false,
        permissions: false,
        signatures: false,
        companySettings: false
    },

    // Load functions
    loadUsers: () => {},
    loadRoles: () => {},
    loadPermissions: () => {},
    loadSignatures: () => {},
    loadCompanySettings: () => {},

    // User CRUD functions
    createUser: () => {},
    updateUser: () => {},
    deleteUser: () => {},

    // Role CRUD functions
    createRole: () => {},
    updateRole: () => {},
    deleteRole: () => {},

    // Signature functions
    createSignature: () => {},
    setActiveSignature: () => {},
    deleteSignature: () => {},

    // Company settings functions
    updateEmailSettings: () => {},
    updateLogo: () => {},
    clearLogo: () => {}
});

export function AdminProvider({ children }) {
    // State for admin-related data
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [signatures, setSignatures] = useState([]);
    const [companySettings, setCompanySettings] = useState(null);

    // Loading states
    const [loadingStates, setLoadingStates] = useState({
        users: false,
        roles: false,
        permissions: false,
        signatures: false,
        companySettings: false
    });

    // State to track what's been loaded
    const [loaded, setLoaded] = useState({
        users: false,
        roles: false,
        permissions: false,
        signatures: false,
        companySettings: false
    });

    // Load users - always load fresh data
    const loadUsers = useCallback(async (force = false) => {
        setLoadingStates(prev => ({ ...prev, users: true }));
        try {
            const data = await usersAPI.getAll();
            setUsers(data);
            setLoaded(prev => ({ ...prev, users: true }));
        } catch (error) {
            console.error('Error loading users:', error);
            setUsers([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, users: false }));
        }
    }, []);

    // Load roles - always load fresh data
    const loadRoles = useCallback(async (force = false) => {
        setLoadingStates(prev => ({ ...prev, roles: true }));
        try {
            const data = await rolesAPI.getAll();
            setRoles(data);
            setLoaded(prev => ({ ...prev, roles: true }));
        } catch (error) {
            console.error('Error loading roles:', error);
            setRoles([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, roles: false }));
        }
    }, []);

    // Load permissions - always load fresh data
    const loadPermissions = useCallback(async (force = false) => {
        setLoadingStates(prev => ({ ...prev, permissions: true }));
        try {
            const data = await permissionsAPI.getAll();
            setPermissions(data);
            setLoaded(prev => ({ ...prev, permissions: true }));
        } catch (error) {
            console.error('Error loading permissions:', error);
            setPermissions([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, permissions: false }));
        }
    }, []);

    // Load signatures - always load fresh data
    const loadSignatures = useCallback(async (force = false) => {
        setLoadingStates(prev => ({ ...prev, signatures: true }));
        try {
            const data = await signaturesAPI.getAll();
            setSignatures(data);
            setLoaded(prev => ({ ...prev, signatures: true }));
        } catch (error) {
            console.error('Error loading signatures:', error);
            setSignatures([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, signatures: false }));
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

    // User CRUD functions
    const createUser = useCallback(async (userData) => {
        try {
            
            const newUser = await usersAPI.create(userData);
            
            // Optimistically add to local state
            setUsers(prev => [...prev, newUser]);
            // Mark as needing refresh to ensure consistency
            setLoaded(prev => ({ ...prev, users: false }));
            
            return newUser;
        } catch (error) {
            throw error;
        }
    }, []);

    const updateUser = useCallback(async (userId, userData) => {
        try {
            
            const updatedUser = await usersAPI.update(userId, userData);
            
            // Optimistically update local state
            setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
            
            return updatedUser;
        } catch (error) {
            throw error;
        }
    }, []);

    const deleteUser = useCallback(async (userId) => {
        try {
            
            await usersAPI.delete(userId);
            
            // Optimistically remove from local state
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            throw error;
        }
    }, []);

    // Role CRUD functions
    const createRole = useCallback(async (roleData) => {
        try {
            
            const newRole = await rolesAPI.create(roleData);
            
            // Optimistically add to local state
            setRoles(prev => [...prev, newRole]);
            // Mark as needing refresh
            setLoaded(prev => ({ ...prev, roles: false }));
            
            return newRole;
        } catch (error) {
            throw error;
        }
    }, []);

    const updateRole = useCallback(async (roleId, roleData) => {
        try {
            
            const updatedRole = await rolesAPI.update(roleId, roleData);
            
            // Optimistically update local state
            setRoles(prev => prev.map(r => r.id === roleId ? updatedRole : r));
            
            return updatedRole;
        } catch (error) {
            throw error;
        }
    }, []);

    const deleteRole = useCallback(async (roleId) => {
        try {
            
            await rolesAPI.delete(roleId);
            
            // Optimistically remove from local state
            setRoles(prev => prev.filter(r => r.id !== roleId));
        } catch (error) {
            throw error;
        }
    }, []);

    // Signature functions
    const createSignature = useCallback(async (signatureData) => {
        try {
            
            const newSignature = await signaturesAPI.create(signatureData);
            
            // Optimistically add to local state
            setSignatures(prev => [...prev, newSignature]);
            // Mark as needing refresh
            setLoaded(prev => ({ ...prev, signatures: false }));
            
            // Reload to get updated active status
            await loadSignatures(true);
            
            return newSignature;
        } catch (error) {
            throw error;
        }
    }, [loadSignatures]);

    const setActiveSignature = useCallback(async (signatureId) => {
        try {
            
            await signaturesAPI.setActive(signatureId);
            
            // Optimistically update local state
            setSignatures(prev => prev.map(s => ({
                ...s,
                isActive: s.id === signatureId
            })));
            
            // Reload to ensure consistency
            await loadSignatures(true);
            await loadCompanySettings(true);
        } catch (error) {
            throw error;
        }
    }, [loadSignatures, loadCompanySettings]);

    const deleteSignature = useCallback(async (signatureId) => {
        try {
            
            await signaturesAPI.delete(signatureId);
            
            // Optimistically remove from local state
            setSignatures(prev => prev.filter(s => s.id !== signatureId));
        } catch (error) {
            throw error;
        }
    }, []);

    // Company settings functions
    const updateEmailSettings = useCallback(async (emailData) => {
        try {
            
            const updatedSettings = await companySettingsAPI.updateEmail(emailData);
            
            // Optimistically update local state
            setCompanySettings(prev => prev ? { ...prev, ...updatedSettings } : updatedSettings);
            
            // Reload to ensure consistency
            await loadCompanySettings(true);
            
            return updatedSettings;
        } catch (error) {
            throw error;
        }
    }, [loadCompanySettings]);

    const updateLogo = useCallback(async (logoData) => {
        try {
            
            const updatedSettings = await companySettingsAPI.updateLogo(logoData);
            
            // Optimistically update local state
            setCompanySettings(prev => prev ? { ...prev, ...updatedSettings } : updatedSettings);
            
            // Reload to ensure consistency
            await loadCompanySettings(true);
            
            return updatedSettings;
        } catch (error) {
            throw error;
        }
    }, [loadCompanySettings]);

    const clearLogo = useCallback(async () => {
        try {
            
            const updatedSettings = await companySettingsAPI.clearLogo();
            
            // Optimistically update local state
            setCompanySettings(prev => prev ? { ...prev, ...updatedSettings } : updatedSettings);
            
            // Reload to ensure consistency
            await loadCompanySettings(true);
            
            return updatedSettings;
        } catch (error) {
            throw error;
        }
    }, [loadCompanySettings]);

    return (
        <AdminContext.Provider value={{
            // Data
            users,
            roles,
            permissions,
            signatures,
            companySettings,

            // Loading states
            loadingStates,

            // Load functions
            loadUsers,
            loadRoles,
            loadPermissions,
            loadSignatures,
            loadCompanySettings,

            // User CRUD functions
            createUser,
            updateUser,
            deleteUser,

            // Role CRUD functions
            createRole,
            updateRole,
            deleteRole,

            // Signature functions
            createSignature,
            setActiveSignature,
            deleteSignature,

            // Company settings functions
            updateEmailSettings,
            updateLogo,
            clearLogo
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}

