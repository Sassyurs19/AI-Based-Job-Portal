// Consolidated My Applications page script

document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (window.protectCandidateRoute && !protectCandidateRoute()) return;

  // Load applications
  loadApplications();

  // Handle search input
  const searchInput = document.querySelector('.search-filter-bar input') || document.querySelector('.search-field input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }

  // Handle filter dropdown
  const filterSelect = document.querySelector('.search-filter-bar select') || document.querySelector('.filter-field select');
  if (filterSelect) {
    filterSelect.addEventListener('change', handleFilter);
  }
});

async function loadApplications() {
  try {
    const result = await api.getMyApplications();
    
    if (result.success && result.applications) {
      renderApplications(result.applications);
      updateApplicationCount(result.count);
      updateSidebarStats(result.applications);
    }
  } catch (error) {
    console.error('Error loading applications:', error);
    showError('Failed to load applications');
  }
}

function renderApplications(applications) {
  const applicationsContainer = document.querySelector('.applications-list');
  if (!applicationsContainer) return;

  if (applications.length === 0) {
    applicationsContainer.innerHTML = '<div class="no-applications" style="color: var(--muted); text-align: center; padding: 40px;">No applications yet. Start applying to jobs!</div>';
    return;
  }

  applicationsContainer.innerHTML = applications.map(app => {
    const jobTitle = app.job ? app.job.title : 'Software Engineer';
    const company = app.job ? (app.job.company?.name || app.job.company || 'AI Hire Partner') : 'Company';
    const loc = app.job ? app.job.location : 'Remote';
    const salary = app.job ? app.job.salaryRange : '$120k–$150k';
    const match = app.aiScore || 85;

    // Set status classes dynamically
    let statusClass = 'applied';
    if (app.status === 'reviewed') statusClass = 'reviewed';
    if (app.status === 'shortlisted') statusClass = 'shortlisted';
    if (app.status === 'interview') statusClass = 'interview';
    if (app.status === 'accepted' || app.status === 'hired') statusClass = 'accepted';
    if (app.status === 'rejected') statusClass = 'rejected';

    return `
      <article class="application-card gborder">
        <div class="application-card-header">
          <div class="application-card-logo">${company.substring(0, 2).toUpperCase()}</div>
          <div class="application-card-info">
            <h3>${jobTitle}</h3>
            <div class="company">${company}</div>
          </div>
        </div>
        <div class="application-card-meta">
          <div class="application-card-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Applied: ${formatDate(app.createdAt)}
          </div>
          <div class="application-card-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3 8-8"/></svg>
            AI Match: ${match}%
          </div>
          <div class="application-card-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${loc} · ${salary || 'Contract'}
          </div>
        </div>
        <div class="application-card-footer">
          <span class="application-card-status ${statusClass}">
            ${formatStatus(app.status)}
          </span>
          <div class="application-card-actions">
            <a class="btn btn-ghost" href="job-details.html?id=${app.job?._id}">View Details</a>
            ${app.status !== 'rejected' && app.status !== 'hired' ? `
              <button class="btn btn-ghost" style="color:#f87171; border-color:rgba(248,113,113,.3);" onclick="withdrawApplication('${app._id}')">Withdraw</button>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const applicationCards = document.querySelectorAll('.application-card');
  
  applicationCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const company = card.querySelector('.company').textContent.toLowerCase();
    
    if (title.includes(searchTerm) || company.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function handleFilter(e) {
  const status = e.target.value.toLowerCase();
  const applicationCards = document.querySelectorAll('.application-card');
  
  applicationCards.forEach(card => {
    const cardStatusText = card.querySelector('.application-card-status').textContent.trim().toLowerCase();
    
    if (status === 'all' || status === '' || cardStatusText.includes(status) || (status === 'accepted' && cardStatusText.includes('hired'))) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  // Update status card active styling
  document.querySelectorAll('.status-card').forEach(c => c.classList.remove('active'));
  const matchingCard = document.querySelector(`.status-card[data-status="${status}"]`);
  if (matchingCard) {
    matchingCard.classList.add('active');
  } else {
    const allCard = document.querySelector('.status-card[data-status="all"]');
    if (allCard) allCard.classList.add('active');
  }
}

async function withdrawApplication(applicationId) {
  if (!confirm('Are you sure you want to withdraw this application?')) return;

  try {
    const result = await api.withdrawApplication(applicationId);
    if (result.success) {
      showSuccess('Application withdrawn successfully');
      loadApplications();
    } else {
      showError(result.message || 'Failed to withdraw application');
    }
  } catch (error) {
    showError('Failed to withdraw application');
    console.error('Withdraw application error:', error);
  }
}

function updateApplicationCount(count) {
  const countEl = document.querySelector('.application-count');
  if (countEl) {
    countEl.textContent = `${count} application${count !== 1 ? 's' : ''}`;
  }
}

function updateSidebarStats(applications) {
  // Update total applications count in sidebar
  const totalVal = document.querySelector('.stat-item:nth-child(1) .stat-item-value');
  if (totalVal) {
    totalVal.textContent = applications.length;
  }

  // Update interview rate
  const interviewVal = document.querySelector('.stat-item:nth-child(2) .stat-item-value');
  if (interviewVal && applications.length > 0) {
    const interviews = applications.filter(a => a.status === 'interview').length;
    const rate = Math.round((interviews / applications.length) * 100);
    interviewVal.textContent = `${rate}%`;
  }

  // Update average match
  const matchVal = document.querySelector('.stat-item:nth-child(3) .stat-item-value');
  if (matchVal && applications.length > 0) {
    const totalMatch = applications.reduce((sum, a) => sum + (a.aiScore || 85), 0);
    const avg = Math.round(totalMatch / applications.length);
    matchVal.textContent = `${avg}%`;
  }
}

function formatStatus(status) {
  const statusMap = {
    'pending': 'Applied',
    'reviewed': 'Under Review',
    'shortlisted': 'Shortlisted',
    'interview': 'Interview',
    'accepted': 'Accepted',
    'rejected': 'Rejected',
    'hired': 'Hired'
  };
  return statusMap[status] || status;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  successDiv.style.cssText = 'color: #10b981; padding: 12px 24px; background: rgba(30, 41, 59, 0.9); border: 1px solid #10b981; border-radius: 12px; position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-weight: 500; font-family: sans-serif;';
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = 'color: #ef4444; padding: 12px 24px; background: rgba(30, 41, 59, 0.9); border: 1px solid #ef4444; border-radius: 12px; position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-weight: 500; font-family: sans-serif;';
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Make functions globally available
window.withdrawApplication = withdrawApplication;
window.handleFilter = handleFilter;
