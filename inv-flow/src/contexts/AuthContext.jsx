import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedPermissions = localStorage.getItem('permissions');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setPermissions(storedPermissions ? JSON.parse(storedPermissions) : []);
                // Verify token is still valid
                authAPI.getCurrentUser()
                    .then(userData => {
                        setUser(userData);
                        setPermissions(userData.permissions || []);
                    })
                    .catch(() => {
                        logout();
                    })
                    .finally(() => setLoading(false));
            } catch (error) {
                logout();
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await authAPI.login(username, password);
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('permissions', JSON.stringify(response.permissions));
            setUser(response.user);
            setPermissions(response.permissions);
            return { success: true };
        } catch (error) {
            // Check if it's a connection error
            if (error.message.includes('Cannot connect to server')) {
                return { success: false, error: 'Cannot connect to server. Please ensure the backend is running on http://localhost:5104 or https://localhost:7291', connectionError: true };
            }
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        setUser(null);
        setPermissions([]);
    };

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const hasAnyPermission = (permissionList) => {
        return permissionList.some(permission => permissions.includes(permission));
    };

    return (
        <AuthContext.Provider value={{
            user,
            permissions,
            loading,
            login,
            logout,
            hasPermission,
            hasAnyPermission,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

