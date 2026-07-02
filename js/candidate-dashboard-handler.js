// Candidate Dashboard Handler
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (!protectCandidateRoute()) return;

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
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JD';
    avatar.textContent = initials;
  }

  // Update name
  const nameEl = document.querySelector('.sidebar-header h3');
  if (nameEl) {
    nameEl.textContent = user.name || 'Candidate';
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
    // Load user's applications
    const applicationsResult = await api.getMyApplications();
    
    // Load saved jobs
    const savedJobsResult = await api.getSavedJobs();

    // Update stats
    updateStats(applicationsResult, savedJobsResult);

    // Load recent jobs
    loadRecentJobs();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showError('Failed to load dashboard data');
  }
}

function updateStats(applicationsResult, savedJobsResult) {
  const applicationsCount = applicationsResult.success ? applicationsResult.count : 0;
  const savedJobsCount = savedJobsResult.success ? savedJobsResult.count : 0;

  // Update application count
  const appCountEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
  if (appCountEl) {
    appCountEl.textContent = applicationsCount;
  }

  // Update saved jobs count
  const savedCountEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
  if (savedCountEl) {
    savedCountEl.textContent = savedJobsCount;
  }
}

async function loadRecentJobs() {
  try {
    const result = await api.getJobs();
    
    if (result.success && result.jobs) {
      const recentJobsContainer = document.querySelector('.recent-jobs');
      if (recentJobsContainer) {
        recentJobsContainer.innerHTML = result.jobs.slice(0, 5).map(job => `
          <div class="job-item">
            <h4>${job.title || 'Job Title'}</h4>
            <p>${job.company?.name || job.company || 'Company'}</p>
            <a href="job-details.html?id=${job._id}" class="btn btn-sm">View</a>
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
