import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, apiUtils } from '../services/api';

const AuthContext = createContext({
    user: null,
    permissions: [],
    loading: true,
    login: () => {},
    logout: () => {},
    hasPermission: () => false,
    hasAnyPermission: () => false,
    isAuthenticated: false
});


export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedPermissions = localStorage.getItem('permissions');

            if (token && storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                    setPermissions(storedPermissions ? JSON.parse(storedPermissions) : []);
                    // Verify token is still valid
                    const userData = await authAPI.getCurrentUser();
                    setUser(userData);
                    setPermissions(userData.permissions || []);
                } catch (error) {
                    // Only logout if we have invalid stored data
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('permissions');
                    apiUtils.clearCache();
                    setUser(null);
                    setPermissions([]);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await authAPI.login(username, password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('permissions', JSON.stringify(response.permissions));
            setUser(response.user);
            setPermissions(response.permissions);
            apiUtils.clearCache(); // ensure cached data is user-scoped
            return { success: true };
        } catch (error) {
            // Check if it's a connection or timeout error
            if (error.message.includes('Cannot connect to server') ||
                error.message.includes('Request timeout') ||
                error.message.includes('Failed to fetch')) {
                return { success: false, error: 'Cannot connect to server. Please ensure the backend is running on http://localhost:5104 and try again.', connectionError: true };
            }
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        // Prevent multiple logout calls
        if (!user && !permissions.length) return;

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        apiUtils.clearCache(); // prevent cache leakage across sessions
        setUser(null);
        setPermissions([]);
    };

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const hasAnyPermission = (permissionList) => {
        return permissionList.some(permission => permissions.includes(permission));
    };

    const contextValue = {
        user,
        permissions,
        loading,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

