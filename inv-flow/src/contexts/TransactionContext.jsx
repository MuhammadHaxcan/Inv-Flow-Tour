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

    // State to track what's been loaded
    const [loaded, setLoaded] = useState({
        transactions: false,
        accounts: false
    });

    // Load transactions - always load fresh data
    const loadTransactions = useCallback(async (force = false) => {
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
