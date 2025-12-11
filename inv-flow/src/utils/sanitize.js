// Secure input sanitization helpers using DOMPurify to prevent XSS attacks
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content while preserving safe elements
 * @param {string} html - The HTML content to sanitize
 * @param {Object} options - DOMPurify options
 * @returns {string} - Sanitized HTML content
 */
export const sanitizeHtml = (html, options = {}) => {
    if (!html || typeof html !== 'string') return '';

    const defaultOptions = {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        ALLOWED_ATTR: [],
        ALLOW_DATA_ATTR: false,
        ...options
    };

    return DOMPurify.sanitize(html, defaultOptions);
};

/**
 * Sanitize a string by removing all HTML tags and potentially dangerous characters
 * @param {string} value - The string to sanitize
 * @returns {string} - Sanitized plain text
 */
export const sanitizeString = (value = '') => {
    const str = typeof value === 'string' ? value : String(value ?? '');
    // Use DOMPurify to strip all HTML and sanitize
    return DOMPurify.sanitize(str, { ALLOWED_TAGS: [] }).trim();
};

/**
 * Sanitize credential-like inputs (strips all HTML, no special characters allowed)
 */
export const sanitizeCredentials = ({ username = '', password = '' }) => ({
    username: sanitizeString(username),
    password: sanitizeString(password)
});

/**
 * Sanitize all string fields in a shallow object
 */
export const sanitizeObjectStrings = (obj = {}) => {
    if (typeof obj !== 'object' || obj === null) return {};
    return Object.entries(obj).reduce((acc, [key, val]) => {
        acc[key] = typeof val === 'string' ? sanitizeString(val) : val;
        return acc;
    }, {});
};

/**
 * Sanitize rich text content that may contain safe HTML
 * @param {string} content - The content that may contain HTML
 * @returns {string} - Sanitized content with safe HTML preserved
 */
export const sanitizeRichText = (content) => {
    return sanitizeHtml(content, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'blockquote'],
        ALLOWED_ATTR: []
    });
};


