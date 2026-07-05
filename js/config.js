// Application Configuration
// Update BACKEND_URL to your deployed backend URL

const CONFIG = {
  // Backend API URL - auto-detects local vs production
  // For Firebase/Vercel deployment, the hostname won't be localhost
  BACKEND_URL: (function() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Local development detection
    const isLocal = hostname === 'localhost' || 
                    hostname === '127.0.0.1' || 
                    hostname === '' || 
                    protocol === 'file:';
    
    if (isLocal) {
      return 'http://localhost:5000';
    }
    
    // Production - use your deployed backend URL
    return 'https://ai-based-job-portal-backend.onrender.com';
  })(),
  
  // API base path
  API_BASE: '/api'
};

// Get full API base URL
function getApiBaseUrl() {
  return CONFIG.BACKEND_URL + CONFIG.API_BASE;
}

// Get backend URL (for OAuth redirects)
function getBackendUrl() {
  return CONFIG.BACKEND_URL;
}

// Export for use in other files
window.CONFIG = CONFIG;
window.getApiBaseUrl = getApiBaseUrl;
window.getBackendUrl = getBackendUrl;
