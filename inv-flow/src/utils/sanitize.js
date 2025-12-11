// Simple input sanitization helpers to reduce XSS/HTML injection risk.
// These utilities are intentionally conservative and avoid adding new heavy dependencies.

/**
 * Sanitize a string by trimming, removing angle brackets, and stripping HTML tags.
 */
export const sanitizeString = (value = '') => {
    const str = typeof value === 'string' ? value : String(value ?? '');
    // Remove HTML tags and angle brackets
    return str.replace(/<[^>]*>?/gm, '').replace(/[<>]/g, '').trim();
};

/**
 * Sanitize credential-like inputs.
 */
export const sanitizeCredentials = ({ username = '', password = '' }) => ({
    username: sanitizeString(username),
    password: sanitizeString(password)
});

/**
 * Sanitize all string fields in a shallow object.
 */
export const sanitizeObjectStrings = (obj = {}) => {
    if (typeof obj !== 'object' || obj === null) return {};
    return Object.entries(obj).reduce((acc, [key, val]) => {
        acc[key] = typeof val === 'string' ? sanitizeString(val) : val;
        return acc;
    }, {});
};


