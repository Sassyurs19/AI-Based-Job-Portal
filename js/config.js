// Application Configuration
// Update BACKEND_URL to your deployed backend URL
const CONFIG = {
  // Backend API URL - change this to your deployed backend URL
  BACKEND_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://ai-based-job-portal-backend.onrender.com',
  
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
