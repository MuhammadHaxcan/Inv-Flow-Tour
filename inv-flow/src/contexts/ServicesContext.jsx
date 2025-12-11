import React, { createContext, useState, useContext, useCallback } from 'react';
import { servicesAPI, apiUtils } from '../services/api';
import { CACHE_KEYS } from '../utils/cacheInvalidation';

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

    // Cache to track what's been loaded
    const [loaded, setLoaded] = useState({
        services: false
    });

    // Load services only when needed
    const loadServices = useCallback(async (force = false) => {
        if (loaded.services && !force) return;
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
    }, [loaded.services]);

    // Service CRUD functions
    const addService = useCallback(async (service) => {
        try {
            // Clear API cache before making the request
            apiUtils.clearCacheFor('/services');
            
            const newService = await servicesAPI.create(service);
            setServices(prev => [...prev, newService]);
            return newService;
        } catch (error) {
            throw error;
        }
    }, []);

    const updateService = useCallback(async (updatedService) => {
        try {
            // Clear API cache before making the request
            apiUtils.clearCacheFor('/services');
            
            const service = await servicesAPI.update(updatedService.id, updatedService);
            setServices(prev => prev.map(s => s.id === updatedService.id ? service : s));
            return service;
        } catch (error) {
            throw error;
        }
    }, []);

    const deleteService = useCallback(async (id) => {
        try {
            // Clear API cache before making the request
            apiUtils.clearCacheFor('/services');
            
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
