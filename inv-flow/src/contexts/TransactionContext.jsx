import React, { createContext, useState, useContext, useCallback } from 'react';
import { transactionsAPI, accountsAPI } from '../services/api';

const TransactionContext = createContext({
    // Transaction data
    transactions: [],
    accounts: [],

    // Loading states
    loadingStates: {
        transactions: false,
        accounts: false
    },

    // Load functions
    loadTransactions: () => {},
    loadAccounts: () => {}
});

export function TransactionProvider({ children }) {
    // State for transaction-related data
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);

    // Loading states
    const [loadingStates, setLoadingStates] = useState({
        transactions: false,
        accounts: false
    });

    // Cache to track what's been loaded
    const [loaded, setLoaded] = useState({
        transactions: false,
        accounts: false
    });

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

    return (
        <TransactionContext.Provider value={{
            // Data
            transactions,
            accounts,

            // Loading states
            loadingStates,

            // Load functions
            loadTransactions,
            loadAccounts
        }}>
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransaction() {
    const context = useContext(TransactionContext);
    if (context === undefined) {
        throw new Error('useTransaction must be used within a TransactionProvider');
    }
    return context;
}
