// Recruiter Dashboard Handler
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (!protectRecruiterRoute()) return;

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
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'TC';
    avatar.textContent = initials;
  }

  // Update name
  const nameEl = document.querySelector('.sidebar-header h3');
  if (nameEl) {
    nameEl.textContent = user.name || 'Recruiter';
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
    // Load recruiter dashboard stats
    const result = await api.getRecruiterDashboard();
    
    if (result.success) {
      updateDashboardStats(result.stats);
    }

    // Load company profile
    const profileResult = await api.getRecruiterProfile();
    if (profileResult.success && profileResult.recruiter) {
      updateCompanyProfileUI(profileResult.recruiter);
    }

    // Load recent jobs
    loadRecentJobs();

    // Load recent applications
    loadRecentApplications();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showError('Failed to load dashboard data');
  }
}

function updateDashboardStats(data) {
  const cards = document.querySelectorAll('.stat-card');
  if (cards.length >= 4 && data) {
    // Card 1: Active Jobs
    const activeJobsVal = cards[0].querySelector('.value');
    if (activeJobsVal && data.activeJobs !== undefined) activeJobsVal.textContent = data.activeJobs;
    
    // Card 2: Total Applicants
    const totalAppsVal = cards[1].querySelector('.value');
    if (totalAppsVal && data.totalApplications !== undefined) totalAppsVal.textContent = data.totalApplications;
    
    // Card 3: Pending Review
    const pendingAppsLabel = cards[2].querySelector('.label');
    const pendingAppsVal = cards[2].querySelector('.value');
    if (pendingAppsLabel) pendingAppsLabel.textContent = 'Pending Review';
    if (pendingAppsVal && data.pendingApplications !== undefined) pendingAppsVal.textContent = data.pendingApplications;
    
    // Card 4: Total Jobs
    const totalJobsLabel = cards[3].querySelector('.label');
    const totalJobsVal = cards[3].querySelector('.value');
    if (totalJobsLabel) totalJobsLabel.textContent = 'Total Jobs';
    if (totalJobsVal && data.totalJobs !== undefined) totalJobsVal.textContent = data.totalJobs;
  }
}

function updateCompanyProfileUI(recruiter) {
  const company = recruiter.company || {};
  const nameEl = document.querySelector('.company-profile-info h3');
  const descEl = document.querySelector('.company-profile-info p');
  const statsEl = document.querySelector('.company-profile-stats');
  const logoEl = document.querySelector('.company-profile-logo');
  
  if (nameEl) nameEl.textContent = company.name || 'Company Name';
  if (descEl) descEl.textContent = company.description || 'No description provided';
  if (logoEl) {
    logoEl.textContent = company.name ? company.name.substring(0, 2).toUpperCase() : 'CO';
  }
  if (statsEl) {
    statsEl.innerHTML = `
      <span>🏢 ${company.size || 'Not specified'} employees</span>
      <span>🌍 ${company.location || 'Not specified'}</span>
      <span>🚀 Founded ${company.founded || 'N/A'}</span>
    `;
  }
}

async function loadRecentJobs() {
  try {
    const result = await api.getMyJobs();
    
    if (result.success && result.jobs) {
      const recentJobsContainer = document.querySelector('.job-posts-list');
      if (recentJobsContainer) {
        recentJobsContainer.innerHTML = result.jobs.slice(0, 5).map(job => `
          <div class="job-post-item">
            <div class="job-post-logo">${job.title ? job.title.substring(0, 2).toUpperCase() : 'JB'}</div>
            <div class="job-post-info">
              <h4>${job.title || 'Job Title'}</h4>
              <p>Posted ${new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="job-post-meta">
              <span>${job.applicants?.length || 0} applicants</span>
            </div>
            <span class="job-post-status active">${job.status || 'Active'}</span>
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.error('Error loading recent jobs:', error);
  }
}

async function loadRecentApplications() {
  try {
    const jobsResult = await api.getMyJobs();
    
    if (jobsResult.success && jobsResult.jobs.length > 0) {
      // Fetch applications across all recruiter's jobs or the first job
      const firstJobId = jobsResult.jobs[0]._id;
      const appsResult = await api.getJobApplications(firstJobId);
      
      if (appsResult.success && appsResult.applications) {
        const recentAppsContainer = document.querySelector('.applicants-list');
        if (recentAppsContainer) {
          recentAppsContainer.innerHTML = appsResult.applications.slice(0, 5).map(app => `
            <div class="applicant-item" onclick="window.location.href='candidate-details.html?id=${app.applicant?._id}&appId=${app._id}'" style="cursor:pointer;">
              <div class="applicant-avatar">${app.applicant?.name ? app.applicant.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'C'}</div>
              <div class="applicant-info">
                <h4>${app.applicant?.name || 'Candidate'}</h4>
                <p>${app.job?.title || 'Job'}</p>
              </div>
              <div class="applicant-match">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3 8-8"/></svg>
                ${app.score || 85}%
              </div>
            </div>
          `).join('');
        }
      }
    }
  } catch (error) {
    console.error('Error loading recent applications:', error);
  }
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'reviewed': 'Under Review',
    'accepted': 'Accepted',
    'rejected': 'Rejected',
    'interview': 'Interview'
  };
  return statusMap[status] || status;
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
