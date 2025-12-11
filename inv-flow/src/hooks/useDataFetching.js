import { useState, useCallback } from 'react';

/**
 * Custom hook for standardized data fetching with loading states and error handling
 * @param {Function} fetchFunction - The async function that fetches data
 * @param {Object} options - Configuration options
 * @param {number} options.retryCount - Number of retries on failure (default: 1)
 * @param {number} options.retryDelay - Delay between retries in ms (default: 1000)
 * @param {Function} options.onSuccess - Callback on successful fetch
 * @param {Function} options.onError - Callback on error
 * @param {boolean} options.showErrorAlerts - Whether to show error alerts (default: true)
 * @returns {Object} - { data, loading, error, refetch, lastFetchTime }
 */
export const useDataFetching = (fetchFunction, options = {}) => {
    const {
        retryCount = 1,
        retryDelay = 1000,
        onSuccess,
        onError,
        showErrorAlerts = true
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(null);

    const executeFetch = useCallback(async (attempt = 1) => {
        try {
            setLoading(true);
            setError(null);

            const result = await fetchFunction();

            setData(result);
            setLastFetchTime(new Date());
            setLoading(false);

            if (onSuccess) {
                onSuccess(result);
            }

            return result;
        } catch (err) {
            const errorMessage = err.message || 'An error occurred while fetching data';
            setError(errorMessage);
            setLoading(false);

            // Retry logic
            if (attempt < retryCount + 1) {
                setTimeout(() => {
                    return executeFetch(attempt + 1);
                }, retryDelay);
                return;
            }

            if (onError) {
                onError(err);
            }

            // Show error alert if enabled
            if (showErrorAlerts) {
                console.error('Data fetching error:', errorMessage);
                // You could integrate with a toast notification system here
                // showErrorToast(errorMessage);
            }

            throw err;
        }
    }, [fetchFunction, retryCount, retryDelay, onSuccess, onError, showErrorAlerts]);

    const refetch = useCallback(() => {
        return executeFetch(1);
    }, [executeFetch]);

    return {
        data,
        loading,
        error,
        refetch,
        lastFetchTime
    };
};

/**
 * Hook for managing async operations with loading states
 * @param {Function} operation - The async operation function
 * @param {Object} options - Configuration options
 * @returns {Object} - { execute, loading, error, result }
 */
export const useAsyncOperation = (operation, options = {}) => {
    const {
        onSuccess,
        onError,
        successMessage,
        errorMessage
    } = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);

            const res = await operation(...args);

            setResult(res);
            setLoading(false);

            if (onSuccess) {
                onSuccess(res);
            }

            if (successMessage) {
                console.log(successMessage);
                // You could show a success toast here
                // showSuccessToast(successMessage);
            }

            return res;
        } catch (err) {
            const errorMsg = err.message || errorMessage || 'Operation failed';
            setError(errorMsg);
            setLoading(false);

            if (onError) {
                onError(err);
            }

            console.error('Async operation error:', errorMsg);
            // You could show an error toast here
            // showErrorToast(errorMsg);

            throw err;
        }
    }, [operation, onSuccess, onError, successMessage, errorMessage]);

    return {
        execute,
        loading,
        error,
        result
    };
};

/**
 * Hook for debounced search/filter operations
 * @param {Function} searchFunction - The search function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {Object} - { search, loading, results, error }
 */
export const useDebouncedSearch = (searchFunction, delay = 300) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const debouncedSearch = useCallback(
        debounce(async (term) => {
            if (!term.trim()) {
                setResults([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const searchResults = await searchFunction(term);
                setResults(searchResults);
            } catch (err) {
                setError(err.message || 'Search failed');
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, delay),
        [searchFunction, delay]
    );

    const search = useCallback((term) => {
        setSearchTerm(term);
        debouncedSearch(term);
    }, [debouncedSearch]);

    return {
        search,
        searchTerm,
        results,
        loading,
        error
    };
};

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Hook for form submissions with validation
 * @param {Function} submitFunction - The form submission function
 * @param {Function} validateFunction - Optional validation function
 * @returns {Object} - { submit, loading, error, isValid }
 */
export const useFormSubmission = (submitFunction, validateFunction = null) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const submit = useCallback(async (formData) => {
        try {
            setLoading(true);
            setError(null);
            setValidationErrors({});

            // Validate if validation function provided
            if (validateFunction) {
                const errors = await validateFunction(formData);
                if (errors && Object.keys(errors).length > 0) {
                    setValidationErrors(errors);
                    setLoading(false);
                    return { success: false, errors };
                }
            }

            const result = await submitFunction(formData);

            setLoading(false);
            return { success: true, data: result };
        } catch (err) {
            const errorMsg = err.message || 'Form submission failed';
            setError(errorMsg);
            setLoading(false);
            return { success: false, error: errorMsg };
        }
    }, [submitFunction, validateFunction]);

    return {
        submit,
        loading,
        error,
        validationErrors,
        isValid: Object.keys(validationErrors).length === 0
    };
};
