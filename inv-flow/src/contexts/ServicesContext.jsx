import React, { createContext, useState, useContext, useCallback } from 'react';
import { servicesAPI } from '../services/api';

const ServicesContext = createContext({
    // Services data
    services: [],
    loadingStates: {
        services: false
    },
    // Functions
    loadServices: () => {},
    addService: () => {},
    updateService: () => {},
    deleteService: () => {}
});

export function ServicesProvider({ children }) {
    // State for services data
    const [services, setServices] = useState([]);

    // Loading states
    const [loadingStates, setLoadingStates] = useState({
        services: false
    });

    // State to track what's been loaded
    const [loaded, setLoaded] = useState({
        services: false
    });


    // Load services - always load fresh data
    const loadServices = useCallback(async (force = false) => {
        setLoadingStates(prev => ({ ...prev, services: true }));
        try {
            const data = await servicesAPI.getAll();
            setServices(data);
            setLoaded(prev => ({ ...prev, services: true }));
        } catch (error) {
            console.error('Error loading services:', error);
            setServices([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, services: false }));
        }
    }, []);

    // Service CRUD functions
    const addService = useCallback(async (service) => {
        try {
            const newService = await servicesAPI.create(service);
            setServices(prev => [...prev, newService]);
            return newService;
        } catch (error) {
            throw error;
        }
    }, []);

    const updateService = useCallback(async (updatedService) => {
        try {
            const service = await servicesAPI.update(updatedService.id, updatedService);
            setServices(prev => prev.map(s => s.id === updatedService.id ? service : s));
            return service;
        } catch (error) {
            throw error;
        }
    }, []);

    const deleteService = useCallback(async (id) => {
        try {
            await servicesAPI.delete(id);
            setServices(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            throw error;
        }
    }, []);

    return (
        <ServicesContext.Provider value={{
            // Data
            services,

            // Loading states
            loadingStates,

            // Functions
            loadServices,
            addService,
            updateService,
            deleteService,
        }}>
            {children}
        </ServicesContext.Provider>
    );
}

export function useServices() {
    const context = useContext(ServicesContext);
    if (context === undefined) {
        throw new Error('useServices must be used within a ServicesProvider');
    }
    return context;
}
