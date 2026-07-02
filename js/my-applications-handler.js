// My Applications Handler
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (!protectCandidateRoute()) return;

  // Load applications
  loadApplications();

  // Handle search
  const searchInput = document.querySelector('.search-field input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }

  // Handle filter
  const filterSelect = document.querySelector('.filter-field select');
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
    applicationsContainer.innerHTML = '<div class="no-applications">No applications yet. Start applying to jobs!</div>';
    return;
  }

  applicationsContainer.innerHTML = applications.map(app => `
    <div class="application-card gborder">
      <div class="application-header">
        <div class="job-info">
          <h3>${app.job?.title || 'Job Title'}</h3>
          <p class="company">${app.job?.company?.name || 'Company'}</p>
        </div>
        <span class="status status-${app.status}">${formatStatus(app.status)}</span>
      </div>
      <div class="application-details">
        <span class="applied-date">Applied: ${formatDate(app.createdAt)}</span>
        <span class="location">${app.job?.location || 'Remote'}</span>
      </div>
      ${app.coverLetter ? `<div class="cover-letter"><p>${app.coverLetter.substring(0, 150)}${app.coverLetter.length > 150 ? '...' : ''}</p></div>` : ''}
      <div class="application-actions">
        <a href="job-details.html?id=${app.job?._id}" class="btn btn-sm btn-ghost">View Job</a>
        <button class="btn btn-sm btn-ghost" onclick="withdrawApplication('${app._id}')">Withdraw</button>
      </div>
    </div>
  `).join('');
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const applicationCards = document.querySelectorAll('.application-card');
  
  applicationCards.forEach(card => {
    const title = card.querySelector('.job-info h3').textContent.toLowerCase();
    const company = card.querySelector('.job-info p').textContent.toLowerCase();
    
    if (title.includes(searchTerm) || company.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function handleFilter(e) {
  const status = e.target.value;
  const applicationCards = document.querySelectorAll('.application-card');
  
  applicationCards.forEach(card => {
    const cardStatus = card.querySelector('.status').textContent.toLowerCase();
    
    if (status === 'all' || cardStatus.includes(status)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
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

function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'reviewed': 'Under Review',
    'shortlisted': 'Shortlisted',
    'accepted': 'Accepted',
    'rejected': 'Rejected',
    'interview': 'Interview',
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
  successDiv.style.cssText = 'color: #10b981; padding: 1rem; margin: 1rem 0; background: #d1fae5; border-radius: 8px; position: fixed; top: 20px; right: 20px; z-index: 1000;';
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = 'color: #ef4444; padding: 1rem; margin: 1rem 0; background: #fee2e2; border-radius: 8px; position: fixed; top: 20px; right: 20px; z-index: 1000;';
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

window.withdrawApplication = withdrawApplication;
