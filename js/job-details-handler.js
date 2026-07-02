// Job Details Handler
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (!protectCandidateRoute()) return;

  // Get job ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  if (jobId) {
    loadJobDetails(jobId);
  } else {
    showError('Job ID not provided');
    setTimeout(() => {
      window.location.href = 'jobs.html';
    }, 2000);
  }

  // Handle apply button
  const applyBtn = document.getElementById('applyBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', handleApply);
  }

  // Handle save button
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSave);
  }
});

async function loadJobDetails(jobId) {
  try {
    showLoading('Loading job details...');
    const result = await api.getJobById(jobId);
    
    if (result.success && result.job) {
      renderJobDetails(result.job);
    } else {
      showError('Job not found');
      setTimeout(() => {
        window.location.href = 'jobs.html';
      }, 2000);
    }
  } catch (error) {
    console.error('Error loading job details:', error);
    showError('Failed to load job details');
  } finally {
    hideLoading();
  }
}

function renderJobDetails(job) {
  // Update breadcrumb
  const breadcrumb = document.querySelector('.breadcrumb span:last-child');
  if (breadcrumb) {
    breadcrumb.textContent = job.title || 'Job Title';
  }

  // Update job title
  const titleEl = document.querySelector('.job-title');
  if (titleEl) {
    titleEl.textContent = job.title || 'Job Title';
  }

  // Update company
  const companyEl = document.querySelector('.company-name');
  if (companyEl) {
    companyEl.textContent = job.company?.name || 'Company';
  }

  // Update location
  const locationEl = document.querySelector('.job-location');
  if (locationEl) {
    locationEl.textContent = job.location || 'Remote';
  }

  // Update job type
  const jobTypeEl = document.querySelector('.job-type');
  if (jobTypeEl) {
    jobTypeEl.textContent = job.jobType || 'Full-time';
  }

  // Update experience
  const experienceEl = document.querySelector('.job-experience');
  if (experienceEl) {
    experienceEl.textContent = job.experience || 'Not specified';
  }

  // Update salary
  const salaryEl = document.querySelector('.job-salary');
  if (salaryEl && job.salary) {
    salaryEl.textContent = `$${job.salary.min || 0} - $${job.salary.max || 0} ${job.salary.currency || 'USD'}/${job.salary.period || 'yearly'}`;
  }

  // Update posted date
  const postedEl = document.querySelector('.posted-date');
  if (postedEl) {
    postedEl.textContent = `Posted ${formatDate(job.createdAt)}`;
  }

  // Update description
  const descriptionEl = document.querySelector('.job-description');
  if (descriptionEl) {
    descriptionEl.textContent = job.description || 'No description provided';
  }

  // Update requirements
  const requirementsEl = document.querySelector('.requirements-list');
  if (requirementsEl && job.requirements) {
    requirementsEl.innerHTML = job.requirements.map(req => `<li>${req}</li>`).join('');
  }

  // Update responsibilities
  const responsibilitiesEl = document.querySelector('.responsibilities-list');
  if (responsibilitiesEl && job.responsibilities) {
    responsibilitiesEl.innerHTML = job.responsibilities.map(resp => `<li>${resp}</li>`).join('');
  }

  // Update skills
  const skillsEl = document.querySelector('.skills-container');
  if (skillsEl && job.skills) {
    skillsEl.innerHTML = job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
  }

  // Update company info
  const companyInfoEl = document.querySelector('.company-info');
  if (companyInfoEl && job.company) {
    companyInfoEl.innerHTML = `
      <div class="company-logo">${job.company.name.substring(0, 2).toUpperCase()}</div>
      <div>
        <h4>${job.company.name}</h4>
        <p>${job.company.industry || 'Technology'}</p>
        ${job.company.website ? `<a href="${job.company.website}" target="_blank" class="btn btn-sm btn-ghost">Visit Website</a>` : ''}
      </div>
    `;
  }
}

async function handleApply() {
  const coverLetter = prompt('Enter your cover letter (optional):');
  
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  try {
    showLoading('Submitting application...');
    const result = await api.applyForJob(jobId, coverLetter || '');
    
    if (result.success) {
      showSuccess('Application submitted successfully');
      // Update button state
      const applyBtn = document.getElementById('applyBtn');
      if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.textContent = 'Applied';
        applyBtn.classList.remove('btn-grad');
        applyBtn.classList.add('btn-ghost');
      }
    } else {
      showError(result.message || 'Failed to submit application');
    }
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Apply error:', error);
  } finally {
    hideLoading();
  }
}

async function handleSave() {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  try {
    const result = await api.saveJob(jobId);
    
    if (result.success) {
      showSuccess('Job saved successfully');
      const saveBtn = document.getElementById('saveBtn');
      if (saveBtn) {
        saveBtn.textContent = 'Saved';
        saveBtn.disabled = true;
      }
    } else {
      showError(result.message || 'Failed to save job');
    }
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Save job error:', error);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function showLoading(message) {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-overlay';
  loadingDiv.id = 'loadingOverlay';
  loadingDiv.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
  loadingDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
  document.body.appendChild(loadingDiv);
}

function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
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
