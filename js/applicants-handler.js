// Applicants Handler
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (!protectRecruiterRoute()) return;

  // Load jobs for selection
  loadJobs();

  // Handle job selection
  const jobSelect = document.getElementById('jobSelect');
  if (jobSelect) {
    jobSelect.addEventListener('change', handleJobSelection);
  }

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

async function loadJobs() {
  try {
    const result = await api.getMyJobs();
    
    if (result.success && result.jobs) {
      const jobSelect = document.getElementById('jobSelect');
      if (jobSelect) {
        jobSelect.innerHTML = '<option value="">All Jobs</option>' +
          result.jobs.map(job => `<option value="${job._id}">${job.title}</option>`).join('');
      }

      // Load applicants for first job if available
      if (result.jobs.length > 0) {
        loadApplicants(result.jobs[0]._id);
      }
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    showError('Failed to load jobs');
  }
}

async function loadApplicants(jobId) {
  try {
    const result = await api.getJobApplications(jobId);
    
    if (result.success && result.applications) {
      renderApplicants(result.applications);
      updateApplicantCount(result.count);
    }
  } catch (error) {
    console.error('Error loading applicants:', error);
    showError('Failed to load applicants');
  }
}

function renderApplicants(applications) {
  const applicantsContainer = document.querySelector('.applicants-list');
  if (!applicantsContainer) return;

  if (applications.length === 0) {
    applicantsContainer.innerHTML = '<div class="no-applications">No applicants yet for this job</div>';
    return;
  }

  applicantsContainer.innerHTML = applications.map(app => `
    <div class="applicant-card gborder">
      <div class="applicant-header">
        <div class="applicant-avatar">${app.applicant?.name ? app.applicant.name.substring(0, 2).toUpperCase() : 'CA'}</div>
        <div class="applicant-info">
          <h3>${app.applicant?.name || 'Candidate'}</h3>
          <p class="email">${app.applicant?.email || ''}</p>
          <p class="applied-date">Applied: ${formatDate(app.createdAt)}</p>
        </div>
        <span class="status status-${app.status}">${formatStatus(app.status)}</span>
      </div>
      <div class="applicant-details">
        <div class="detail-item">
          <span class="label">Experience:</span>
          <span>${app.applicant?.experience && app.applicant.experience.length > 0 ? app.applicant.experience[0].title + ' at ' + app.applicant.experience[0].company : 'Not specified'}</span>
        </div>
        <div class="detail-item">
          <span class="label">Location:</span>
          <span>${app.applicant?.location || 'Not specified'}</span>
        </div>
        <div class="detail-item">
          <span class="label">Skills:</span>
          <div class="skills">
            ${(app.applicant?.skills || []).slice(0, 5).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
      </div>
      ${app.coverLetter ? `<div class="cover-letter"><h4>Cover Letter</h4><p>${app.coverLetter.substring(0, 200)}${app.coverLetter.length > 200 ? '...' : ''}</p></div>` : ''}
      <div class="applicant-actions">
        <button class="btn btn-sm btn-ghost" onclick="viewCandidate('${app.applicant?._id}', '${app._id}')">View full profile</button>
        <button class="btn btn-sm btn-grad" onclick="acceptApplication('${app._id}')">Accept</button>
        <button class="btn btn-sm btn-ghost" onclick="rejectApplication('${app._id}')">Reject</button>
      </div>
    </div>
  `).join('');
}

function handleJobSelection(e) {
  const jobId = e.target.value;
  if (jobId) {
    loadApplicants(jobId);
  } else {
    // Load all applicants across all jobs
    loadAllApplicants();
  }
}

async function loadAllApplicants() {
  try {
    const jobsResult = await api.getMyJobs();
    
    if (jobsResult.success && jobsResult.jobs.length > 0) {
      const allApplications = [];
      
      for (const job of jobsResult.jobs) {
        const appsResult = await api.getJobApplications(job._id);
        if (appsResult.success && appsResult.applications) {
          allApplications.push(...appsResult.applications);
        }
      }
      
      renderApplicants(allApplications);
      updateApplicantCount(allApplications.length);
    }
  } catch (error) {
    console.error('Error loading all applicants:', error);
  }
}

function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const applicantCards = document.querySelectorAll('.applicant-card');
  
  applicantCards.forEach(card => {
    const name = card.querySelector('.applicant-info h3').textContent.toLowerCase();
    const email = card.querySelector('.applicant-info p.email').textContent.toLowerCase();
    const skills = card.querySelector('.skills').textContent.toLowerCase();
    
    if (name.includes(searchTerm) || email.includes(searchTerm) || skills.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function handleFilter(e) {
  const status = e.target.value;
  const applicantCards = document.querySelectorAll('.applicant-card');
  
  applicantCards.forEach(card => {
    const cardStatus = card.querySelector('.status').textContent.toLowerCase();
    
    if (status === 'all' || cardStatus.includes(status)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

async function acceptApplication(applicationId) {
  if (!confirm('Are you sure you want to shortlist this application?')) return;

  try {
    const result = await api.updateApplicationStatus(applicationId, 'shortlisted');
    
    if (result.success) {
      showSuccess('Application shortlisted');
      // Reload applicants
      const jobSelect = document.getElementById('jobSelect');
      if (jobSelect && jobSelect.value) {
        loadApplicants(jobSelect.value);
      } else {
        loadAllApplicants();
      }
    } else {
      showError(result.message || 'Failed to shortlist application');
    }
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Accept application error:', error);
  }
}

async function rejectApplication(applicationId) {
  if (!confirm('Are you sure you want to reject this application?')) return;

  try {
    const result = await api.updateApplicationStatus(applicationId, 'rejected');
    
    if (result.success) {
      showSuccess('Application rejected');
      // Reload applicants
      const jobSelect = document.getElementById('jobSelect');
      if (jobSelect && jobSelect.value) {
        loadApplicants(jobSelect.value);
      } else {
        loadAllApplicants();
      }
    } else {
      showError(result.message || 'Failed to reject application');
    }
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Reject application error:', error);
  }
}

function viewCandidate(candidateId, appId) {
  window.location.href = `candidate-details.html?id=${candidateId}&appId=${appId}`;
}

function updateApplicantCount(count) {
  const countEl = document.querySelector('.applicant-count');
  if (countEl) {
    countEl.textContent = `${count} applicant${count !== 1 ? 's' : ''}`;
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

window.viewCandidate = viewCandidate;
window.acceptApplication = acceptApplication;
window.rejectApplication = rejectApplication;
