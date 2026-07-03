// Consolidated Recruiter Dashboard script

document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (window.protectRecruiterRoute && !protectRecruiterRoute()) return;

  // Initial welcome layout setup
  updateRecruiterHeader();

  // Load dashboard widgets dynamically
  loadDashboardWidgets();
});

function updateRecruiterHeader() {
  const user = api.getCurrentUser();
  if (!user) return;

  const welcomeName = document.getElementById('recruiterCompanyName');
  if (welcomeName) {
    welcomeName.textContent = user.name || 'Recruiter';
  }
}

async function loadDashboardWidgets() {
  try {
    // Fetch dashboard statistics, recent jobs, and recent applications
    const result = await api.getRecruiterDashboard();
    
    if (result.success) {
      updatePipelineFunnel(result.stats);
      populateRecentJobs(result.recentJobs);
      populateRecentApplications(result.recentApplications);
      updateHiringIndex(result.stats);
    }
  } catch (error) {
    console.error('Error loading recruiter dashboard widgets:', error);
  }
}

function updatePipelineFunnel(stats) {
  if (!stats) return;

  const funnelActiveJobs = document.getElementById('funnelActiveJobs');
  const funnelTotalApplicants = document.getElementById('funnelTotalApplicants');
  const funnelShortlisted = document.getElementById('funnelShortlisted');
  const funnelHired = document.getElementById('funnelHired');

  if (funnelActiveJobs) funnelActiveJobs.textContent = stats.activeJobs || 0;
  if (funnelTotalApplicants) funnelTotalApplicants.textContent = stats.totalApplications || 0;
  if (funnelShortlisted) funnelShortlisted.textContent = stats.shortlistedApplications || 0;
  if (funnelHired) funnelHired.textContent = stats.hiredApplications || 0;
}

function updateHiringIndex(stats) {
  if (!stats) return;

  // Compute hiring success index dynamically
  const total = stats.totalApplications || 0;
  const processed = (stats.shortlistedApplications || 0) + (stats.hiredApplications || 0);
  
  let score = 75; // Default fallback index
  if (total > 0) {
    score = Math.round((processed / total) * 100);
    // Smooth to premium range (e.g. 70-98%)
    score = Math.max(70, Math.min(98, score + 15));
  }

  const matchScoreEl = document.querySelector('.match-score');
  if (matchScoreEl) {
    matchScoreEl.textContent = `${score}%`;
  }
}

function populateRecentJobs(jobs) {
  const tbody = document.getElementById('recruiterJobsBody');
  if (!tbody) return;

  if (!jobs || jobs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--muted); padding: 24px;">
          No active job postings. Start hiring by posting a new job!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = jobs.slice(0, 3).map(job => {
    const dateStr = new Date(job.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const applicantCount = job.applicants ? job.applicants.length : 0;
    const statusLabel = job.status === 'active' ? 'Active' : 'Closed';
    const statusClass = job.status === 'active' ? 'status-shortlisted' : 'status-closed';

    return `
      <tr>
        <td><strong>${job.title || 'Job Listing'}</strong></td>
        <td>${dateStr}</td>
        <td>${applicantCount} candidates</td>
        <td><span class="pill-badge ${statusClass}">${statusLabel}</span></td>
      </tr>
    `;
  }).join('');
}

function populateRecentApplications(applications) {
  const container = document.getElementById('recruiterApplicantsContainer');
  if (!container) return;

  if (!applications || applications.length === 0) {
    container.innerHTML = `
      <p style="color: var(--muted); padding: 12px; text-align: center;">
        No candidate applications received yet.
      </p>
    `;
    return;
  }

  container.innerHTML = applications.slice(0, 3).map(app => {
    const candidateName = app.applicant ? app.applicant.name : 'Candidate';
    const initials = candidateName ? candidateName.split(' ').map(n => n[0]).join('').toUpperCase() : 'CA';
    const jobTitle = app.job ? app.job.title : 'Software Engineer';
    const score = app.aiScore || 85;

    return `
      <div class="candidate-row-card gborder" onclick="window.location.href='candidate-details.html?id=${app.applicant?._id}&appId=${app._id}'" style="cursor: pointer;">
        <div class="candidate-row-info">
          <div class="avatar">${initials}</div>
          <div>
            <h4>${candidateName}</h4>
            <span>${jobTitle} · <strong>${score}% Match</strong></span>
          </div>
        </div>
        <div class="candidate-row-actions">
          <button class="btn btn-grad btn-sm">Review Profile</button>
        </div>
      </div>
    `;
  }).join('');
}
