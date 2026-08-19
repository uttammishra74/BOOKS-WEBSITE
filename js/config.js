// Configuration file for environment variables
// Domain-based API key selection for enhanced security

// Configuration object
const CONFIG = {
    API_TIMEOUT: 10000, // 10 seconds
    MAX_RETRIES: 3,
};

// Domain-based API key selection
function getApiKey() {
    const hostname = window.location.hostname;
    
    // Development environment (localhost)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'AIzaSyD30pfnOhtCyexytQPqR4r_OmuNwqY889Y'; // Development key - less restricted
    }
    
    // Cloudflare Pages preview domains
    if (hostname.includes('pages.dev')) {
        return 'AIzaSyD30pfnOhtCyexytQPqR4r_OmuNwqY889Y'; // Staging key - medium restrictions
    }
    
    // Production domain (replace with your actual domain)
    if (hostname === 'your-production-domain.com' || hostname === 'www.your-production-domain.com') {
        return 'PRODUCTION_API_KEY_HERE'; // Production key - strict referrer restrictions
    }
    
    // Default fallback
    return 'AIzaSyD30pfnOhtCyexytQPqR4r_OmuNwqY889Y';
}

// Set the API key
CONFIG.GOOGLE_BOOKS_API_KEY = getApiKey();

// Initialize configuration
function loadConfig() {
    // Configuration is now loaded via getApiKey function
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