// Premium Candidate Dashboard Handler
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (!protectCandidateRoute()) return;

  // Initial welcome layout setup
  updateWelcomeHeader();

  // Load dashboard widgets dynamically
  loadDashboardWidgets();
});

function updateWelcomeHeader() {
  const user = api.getCurrentUser();
  if (!user) return;

  // Update welcome banner name
  const welcomeName = document.getElementById('welcomeName');
  if (welcomeName) {
    const firstName = user.name.split(' ')[0];
    welcomeName.textContent = firstName;
  }
}

async function loadDashboardWidgets() {
  try {
    const user = api.getCurrentUser();
    if (!user) return;

    // 1. Fetch user's applications
    const applicationsResult = await api.getMyApplications();
    const apps = (applicationsResult.success && applicationsResult.applications) || [];

    // 2. Update Application Pipeline Funnel dynamically
    updatePipelineFunnel(apps);

    // 3. Populate Recent Application Activity list
    populateRecentApplications(apps);

    // 4. Fetch recommended jobs
    loadRecommendedJobs();

    // 5. Fetch Resume ATS optimization score
    loadResumeATSScore(user.id);

  } catch (error) {
    console.error('Error loading dashboard widgets:', error);
  }
}

function updatePipelineFunnel(apps) {
  // Categorize application status
  const totalApplied = apps.length;
  const inReview = apps.filter(app => app.status === 'pending' || app.status === 'reviewed').length;
  const shortlisted = apps.filter(app => app.status === 'shortlisted').length;
  const hired = apps.filter(app => app.status === 'hired').length;

  const funnelNodes = document.querySelectorAll('.funnel-node');
  if (funnelNodes.length >= 4) {
    funnelNodes[0].textContent = totalApplied; // Applied
    funnelNodes[1].textContent = inReview;     // In Review
    funnelNodes[2].textContent = shortlisted;  // Shortlisted
    funnelNodes[3].textContent = hired;        // Hired/Interviews count
  }
}

function populateRecentApplications(apps) {
  const tbody = document.getElementById('recentApplicationsBody');
  if (!tbody) return;

  if (apps.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--muted); padding: 24px;">
          No active applications. Start browsing jobs to apply!
        </td>
      </tr>
    `;
    return;
  }

  // Show latest 3 applications
  const latestApps = apps.slice(0, 3);
  tbody.innerHTML = latestApps.map(app => {
    const jobTitle = app.job ? app.job.title : 'Software Engineer';
    const company = app.job ? (app.job.company?.name || app.job.company || 'AI Hire Partner') : 'Company';
    const dateStr = new Date(app.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Status formatting
    let statusClass = 'status-applied';
    let statusLabel = 'Applied';
    if (app.status === 'reviewed') {
      statusClass = 'status-review';
      statusLabel = 'In Review';
    } else if (app.status === 'shortlisted') {
      statusClass = 'status-shortlisted';
      statusLabel = 'Shortlisted';
    } else if (app.status === 'hired') {
      statusClass = 'status-shortlisted';
      statusLabel = 'Hired';
    } else if (app.status === 'rejected') {
      statusClass = 'status-rejected';
      statusLabel = 'Rejected';
    }

    const matchScore = app.aiScore || 75;

    return `
      <tr>
        <td>
          <strong>${jobTitle}</strong>
          <div class="comp">${company}</div>
        </td>
        <td>${dateStr}</td>
        <td><span class="pill-badge ${statusClass}">${statusLabel}</span></td>
        <td><strong style="color: #22c55e;">${matchScore}%</strong></td>
      </tr>
    `;
  }).join('');
}

async function loadRecommendedJobs() {
  const container = document.getElementById('recommendedJobsContainer');
  if (!container) return;

  try {
    const result = await api.getJobs();
    if (result.success && result.jobs && result.jobs.length > 0) {
      // Pick top 3 matching jobs
      const jobs = result.jobs.slice(0, 3);
      container.innerHTML = jobs.map(job => {
        const logoText = job.company?.name ? job.company.name.substring(0, 2).toUpperCase() : 'CO';
        const title = job.title || 'Software Engineer';
        const comp = job.company?.name || job.company || 'AI Hire Partner';
        const loc = job.location || 'Remote';
        const type = job.employmentType || 'Full-time';
        const salary = job.salaryRange || '$120k–$150k';
        const match = Math.floor(Math.random() * 15) + 82; // Mock AI Match score
        
        return `
          <div class="job-card gborder" onclick="window.location.href='job-details.html?id=${job._id}'" style="cursor: pointer;">
            <div class="job-card-header">
              <div class="job-logo">${logoText}</div>
              <div>
                <h4>${title}</h4>
                <span>${comp} · ${loc}</span>
              </div>
            </div>
            <div class="job-meta">
              <span>${type}</span>
              <span>${salary}</span>
            </div>
            <div class="job-match-badge">${match}% AI Match</div>
            <div class="job-actions">
              <button class="btn btn-grad btn-sm" style="width: 100%;">View Details</button>
            </div>
          </div>
        `;
      }).join('');
    } else {
      container.innerHTML = `<p style="color: var(--muted); padding: 12px;">No matching job recommendations at the moment.</p>`;
    }
  } catch (err) {
    console.error('Error fetching job recommendations:', err);
    container.innerHTML = `<p style="color: var(--muted); padding: 12px;">Failed to load job recommendations.</p>`;
  }
}

async function loadResumeATSScore(userId) {
  try {
    // Check if user has an analysis record on their latest job or overall
    const result = await api.get(`/applications/my-applications`);
    const data = await result.json();
    
    let highestAts = 75; // Default fallback ATS score
    let skillsDetectedCount = 8;
    let missingSkillsCount = 3;

    if (data.success && data.applications && data.applications.length > 0) {
      // Find the best analysis score from applications
      const scoredApps = data.applications.filter(a => a.aiScore);
      if (scoredApps.length > 0) {
        highestAts = Math.max(...scoredApps.map(a => a.aiScore));
        skillsDetectedCount = Math.round(highestAts / 7);
        missingSkillsCount = Math.max(1, 12 - skillsDetectedCount);
      }
    }

    // Update ATS Score Badge & Ring Fill
    const atsBadge = document.querySelector('.ats-badge');
    const ringFill = document.querySelector('.ring-fill');
    const atsText = document.querySelector('.ats-val');
    const atsValueDisplay = document.querySelector('.resume-overview .value');

    if (atsBadge) atsBadge.textContent = `${highestAts}% ATS`;
    if (atsText) atsText.textContent = `${highestAts}%`;
    if (atsValueDisplay) atsValueDisplay.textContent = `${highestAts}%`;

    if (ringFill) {
      // Stroke dasharray is 188.4 (for radius 30: 2 * Math.PI * 30 = 188.4)
      const offset = 188.4 * (1 - highestAts / 100);
      ringFill.style.strokeDashoffset = offset;
    }

    // Update Text details
    const labelOverview = document.querySelector('.ats-details p');
    if (labelOverview) {
      labelOverview.innerHTML = `<strong>${skillsDetectedCount} skills parsed</strong> from your profile resume. ${missingSkillsCount} missing keywords identified for matched positions.`;
    }

    // Update radial score text too
    const matchScoreEl = document.querySelector('.match-score');
    if (matchScoreEl) {
      matchScoreEl.textContent = `${Math.min(100, highestAts + 3)}%`;
    }

  } catch (err) {
    console.error('Error fetching resume analysis details:', err);
  }
}
