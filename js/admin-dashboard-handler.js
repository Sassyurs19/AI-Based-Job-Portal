// Admin Dashboard Handler
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (!protectAdminRoute()) return;

  // Update sidebar with user info
  updateSidebar();

  // Load dashboard data
  loadDashboardData();
});

function updateSidebar() {
  const user = api.getCurrentUser();
  if (!user) return;

  // Update avatar
  const avatar = document.querySelector('.sidebar-header .avatar');
  if (avatar) {
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD';
    avatar.textContent = initials;
  }

  // Update name
  const nameEl = document.querySelector('.sidebar-header h3');
  if (nameEl) {
    nameEl.textContent = user.name || 'Admin';
  }

  // Update logout link
  const logoutLink = document.querySelector('.sidebar-nav a.logout');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      handleLogout();
    });
  }
}

async function loadDashboardData() {
  try {
    // Load admin dashboard stats
    const result = await api.getAdminDashboard();
    
    if (result.success) {
      updateDashboardStats(result.stats);
    }

    // Load recent users
    loadRecentUsers();

    // Load recent jobs
    loadRecentJobs();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showError('Failed to load dashboard data');
  }
}

function updateDashboardStats(data) {
  // Update total users
  const totalUsersEl = document.getElementById('totalUsers');
  if (totalUsersEl && data.totalUsers !== undefined) {
    totalUsersEl.textContent = data.totalUsers;
  }

  // Update total recruiters
  const totalRecruitersEl = document.getElementById('totalRecruiters');
  if (totalRecruitersEl && data.totalRecruiters !== undefined) {
    totalRecruitersEl.textContent = data.totalRecruiters;
  }

  // Update total jobs
  const totalJobsEl = document.getElementById('totalJobs');
  if (totalJobsEl && data.totalJobs !== undefined) {
    totalJobsEl.textContent = data.totalJobs;
  }

  // Update total applications
  const totalAppsEl = document.getElementById('totalApplications');
  if (totalAppsEl && data.totalApplications !== undefined) {
    totalAppsEl.textContent = data.totalApplications;
  }
}

async function loadRecentUsers() {
  try {
    const result = await api.getAllUsers();
    
    if (result.success && result.users) {
      const recentUsersContainer = document.getElementById('recentUsers');
      if (recentUsersContainer) {
        recentUsersContainer.innerHTML = result.users.slice(0, 5).map(user => `
          <div class="recent-item">
            <div class="item-avatar">${user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</div>
            <div class="item-info">
              <h4>${user.name || 'User'}</h4>
              <p>${user.role || 'candidate'}</p>
            </div>
            <span class="status status-${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Error loading recent users:', error);
  }
}

async function loadRecentJobs() {
  try {
    const result = await api.getAllJobs();
    
    if (result.success && result.jobs) {
      const recentJobsContainer = document.getElementById('recentJobs');
      if (recentJobsContainer) {
        recentJobsContainer.innerHTML = result.jobs.slice(0, 5).map(job => `
          <div class="recent-item">
            <div class="item-avatar">${job.title ? job.title.substring(0, 2).toUpperCase() : 'J'}</div>
            <div class="item-info">
              <h4>${job.title || 'Job'}</h4>
              <p>${job.company?.name || 'Company'}</p>
            </div>
            <span class="status status-active">${job.applications || 0} applications</span>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Error loading recent jobs:', error);
  }
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = 'color: #ef4444; padding: 1rem; margin: 1rem 0; background: #fee2e2; border-radius: 8px;';
  
  const dashboardContent = document.querySelector('.dashboard-content');
  if (dashboardContent) {
    dashboardContent.insertBefore(errorDiv, dashboardContent.firstChild);
  }
}
