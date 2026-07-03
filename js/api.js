// API Client with JWT Authentication
// Load configuration
const API_BASE_URL = window.getApiBaseUrl ? window.getApiBaseUrl() : 'http://localhost:5000/api';

function getResolvedPath(target) {
  const inAdmin = window.location.pathname.includes('/admin/');
  if (inAdmin) {
    if (target.startsWith('admin/')) {
      return target.replace('admin/', '');
    } else {
      return '../' + target;
    }
  } else {
    return target;
  }
}
window.getResolvedPath = getResolvedPath;

class APIClient {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.isRefreshing = false;

    // Clean up any corrupt stringified "undefined" or "null" from previous sessions
    if (this.accessToken === 'undefined' || this.accessToken === 'null') {
      this.accessToken = null;
      localStorage.removeItem('accessToken');
    }
    if (this.refreshToken === 'undefined' || this.refreshToken === 'null') {
      this.refreshToken = null;
      localStorage.removeItem('refreshToken');
    }
  }

  // Store tokens securely
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  // Clear tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const user = localStorage.getItem('currentUser');
      if (!user || user === 'undefined' || user === 'null') return null;
      return JSON.parse(user);
    } catch (e) {
      localStorage.removeItem('currentUser');
      return null;
    }
  }

  // Set current user
  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  // Clear current user
  clearCurrentUser() {
    localStorage.removeItem('currentUser');
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }

  // Get user role
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  // Refresh access token
  async refreshAccessToken() {
    if (this.isRefreshing) {
      return this.isRefreshing;
    }

    if (!this.refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }

    this.isRefreshing = this._refreshAccessToken();
    try {
      const newAccessToken = await this.isRefreshing;
      return newAccessToken;
    } finally {
      this.isRefreshing = false;
    }
  }

  async _refreshAccessToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
      return data.token;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    let headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add access token if available
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers
    });

    // If 401, try to refresh token (avoid for auth routes)
    const isAuthRoute = endpoint.includes('/auth/login') || 
                        endpoint.includes('/auth/refresh-token') || 
                        endpoint.includes('/auth/register') ||
                        endpoint.includes('/auth/verify-otp');

    if (response.status === 401 && this.refreshToken && !isAuthRoute) {
      try {
        const newToken = await this.refreshAccessToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers
        });
      } catch (error) {
        // Refresh failed, logout
        this.logout();
        throw error;
      }
    }

    return response;
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // File upload
  async upload(endpoint, file, fieldName = 'file') {
    const formData = new FormData();
    formData.append(fieldName, file);

    const url = `${API_BASE_URL}${endpoint}`;
    let headers = {};

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });

    if (response.status === 401 && this.refreshToken) {
      try {
        const newToken = await this.refreshAccessToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: formData
        });
      } catch (error) {
        this.logout();
        throw error;
      }
    }

    return response;
  }

  // Logout
  logout() {
    this.clearTokens();
    this.clearCurrentUser();
    window.location.href = getResolvedPath('login.html');
  }

  // Auth API methods
  async register(data) {
    const response = await this.post('/auth/register', data);
    const result = await response.json();
    if (result.success && result.token) {
      this.setTokens(result.token, result.refreshToken);
      this.setCurrentUser(result.user);
    }
    return result;
  }

  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    const result = await response.json();
    if (result.success) {
      this.setTokens(result.token, result.refreshToken);
      this.setCurrentUser(result.user);
    }
    return result;
  }

  async logoutAPI() {
    try {
      await this.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.logout();
    }
  }

  async getMe() {
    const response = await this.get('/auth/me');
    const result = await response.json();
    if (result.success) {
      this.setCurrentUser(result.user);
    }
    return result;
  }

  async updateProfile(data) {
    const response = await this.put('/auth/profile', data);
    const result = await response.json();
    if (result.success) {
      this.setCurrentUser(result.user);
    }
    return result;
  }

  async forgotPassword(email) {
    const response = await this.post('/auth/forgot-password', { email });
    return response.json();
  }

  async verifyPasswordResetOTP(email, otp) {
    const response = await this.post('/auth/verify-password-reset-otp', { email, otp });
    return response.json();
  }

  async resetPassword(email, password) {
    const response = await this.put('/auth/reset-password', { email, password });
    return response.json();
  }

  async setPassword(userId, password) {
    const response = await this.post('/auth/set-password', { userId, password });
    return response.json();
  }

  async verifyOTP(userId, otp, purpose = 'email-verification') {
    const response = await this.post('/auth/verify-otp', { userId, otp, purpose });
    const result = await response.json();
    if (result.success) {
      this.setTokens(result.token, result.refreshToken);
      this.setCurrentUser(result.user);
    }
    return result;
  }

  async resendOTP(userId) {
    const response = await this.post('/auth/resend-otp', { userId });
    return response.json();
  }

  // Jobs API methods
  async getJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';
    const response = await this.get(endpoint);
    return response.json();
  }

  async getJobById(id) {
    const response = await this.get(`/jobs/${id}`);
    return response.json();
  }

  async createJob(data) {
    const response = await this.post('/jobs', data);
    return response.json();
  }

  async updateJob(id, data) {
    const response = await this.put(`/jobs/${id}`, data);
    return response.json();
  }

  async deleteJob(id) {
    const response = await this.delete(`/jobs/${id}`);
    return response.json();
  }

  async getMyJobs() {
    const response = await this.get('/jobs/my-jobs');
    return response.json();
  }

  async getJobStats() {
    const response = await this.get('/jobs/stats');
    return response.json();
  }

  // Applications API methods
  async applyForJob(jobId, coverLetter) {
    const response = await this.post('/applications/apply', { jobId, coverLetter });
    return response.json();
  }

  async getMyApplications() {
    const response = await this.get('/applications/my-applications');
    return response.json();
  }

  async getJobApplications(jobId) {
    const response = await this.get(`/applications/job/${jobId}`);
    return response.json();
  }

  async updateApplicationStatus(applicationId, status) {
    const response = await this.put(`/applications/${applicationId}/status`, { status });
    return response.json();
  }

  async saveJob(jobId) {
    const response = await this.post('/applications/save', { jobId });
    return response.json();
  }

  async unsaveJob(jobId) {
    const response = await this.delete(`/applications/save/${jobId}`);
    return response.json();
  }

  async getSavedJobs() {
    const response = await this.get('/applications/saved');
    return response.json();
  }

  async uploadResume(file) {
    const response = await this.upload('/applications/upload-resume', file, 'resume');
    return response.json();
  }

  async analyzeResume(jobId) {
    const response = await this.post('/applications/analyze-resume', { jobId });
    return response.json();
  }

  // Recruiter API methods
  async createRecruiterProfile(data) {
    const response = await this.post('/recruiter/profile', data);
    return response.json();
  }

  async getRecruiterProfile() {
    const response = await this.get('/recruiter/profile');
    return response.json();
  }

  async updateRecruiterProfile(data) {
    const response = await this.put('/recruiter/profile', data);
    return response.json();
  }

  async getRecruiterDashboard() {
    const response = await this.get('/recruiter/dashboard');
    return response.json();
  }

  // Admin API methods
  async getAdminDashboard() {
    const response = await this.get('/admin/dashboard');
    return response.json();
  }

  async getAllUsers() {
    const response = await this.get('/admin/users');
    return response.json();
  }

  async updateUserStatus(userId, isActive) {
    const response = await this.put(`/admin/users/${userId}/status`, { isActive });
    return response.json();
  }

  async getAllJobs() {
    const response = await this.get('/admin/jobs');
    return response.json();
  }

  async deleteJobAdmin(id) {
    const response = await this.delete(`/admin/jobs/${id}`);
    return response.json();
  }

  async getAllRecruiters() {
    const response = await this.get('/admin/recruiters');
    return response.json();
  }

  async verifyRecruiter(recruiterId) {
    const response = await this.put(`/admin/recruiters/${recruiterId}/verify`);
    return response.json();
  }

  // Notifications API methods
  async getNotifications() {
    const response = await this.get('/notifications');
    return response.json();
  }

  async markNotificationAsRead(notificationId) {
    const response = await this.put(`/notifications/${notificationId}/read`);
    return response.json();
  }

  async markAllNotificationsAsRead() {
    const response = await this.put('/notifications/read-all');
    return response.json();
  }

  async deleteNotification(notificationId) {
    const response = await this.delete(`/notifications/${notificationId}`);
    return response.json();
  }

  async getUserById(id) {
    const response = await this.get(`/auth/users/${id}`);
    return response.json();
  }

  async withdrawApplication(id) {
    const response = await this.delete(`/applications/${id}`);
    return response.json();
  }

  async getApplicationById(id) {
    const response = await this.get(`/applications/${id}`);
    return response.json();
  }
}

// Create global API client instance
const api = new APIClient();
