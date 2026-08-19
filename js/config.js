// Configuration file for environment variables
// Domain-based API key selection for enhanced security

// Domain-based API key selection
function getApiKey() {
    const hostname = window.location.hostname;
    
    // Development environment (localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'AIzaSyD30pfnOhtCyexytQPqR4r_OmuNwqY889Y'; // Development key - less restricted
    }
    
    // Production domain
    if (hostname === 'freebookleaf.online' || hostname === 'www.freebookleaf.online') {
        return 'AIzaSyD30pfnOhtCyexytQPqR4r_OmuNwqY889Y'; // Production key - strict referrer restrictions
    }
    
    // Default fallback
    return 'AIzaSyD30pfnOhtCyexytQPqR4r_OmuNwqY889Y';
}

// Configuration object
const CONFIG = {
    GOOGLE_BOOKS_API_KEY: getApiKey(),
    API_TIMEOUT: 10000, // 10 seconds
    MAX_RETRIES: 3,
};

// Initialize configuration
function loadConfig() {
    console.log('Environment:', window.location.hostname);
    console.log('API Key loaded securely');
}

// Initialize configuration
loadConfig();

// Make CONFIG globally available for browser environment
window.CONFIG = CONFIG;

// Export for use in other files (for Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}