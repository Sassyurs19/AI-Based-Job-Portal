// Consolidated Job Details script

document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (window.protectCandidateRoute && !protectCandidateRoute()) return;

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

  // Share button listener
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', handleShare);
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
  const titleEls = document.querySelectorAll('.job-title');
  titleEls.forEach(el => el.textContent = job.title || 'Job Title');

  // Update company
  const companyEls = document.querySelectorAll('.company-name');
  companyEls.forEach(el => el.textContent = job.company?.name || 'Company');

  // Update location
  const locationEls = document.querySelectorAll('.job-location');
  locationEls.forEach(el => el.textContent = job.location || 'Remote');

  // Update job type
  const jobTypeEls = document.querySelectorAll('.job-type');
  jobTypeEls.forEach(el => el.textContent = job.jobType || 'Full-time');

  // Update experience
  const experienceEls = document.querySelectorAll('.job-experience');
  experienceEls.forEach(el => el.textContent = job.experience || 'Not specified');

  // Update salary
  const salaryEls = document.querySelectorAll('.job-salary');
  if (job.salary) {
    const salStr = `$${job.salary.min || 0} - $${job.salary.max || 0} ${job.salary.currency || 'USD'}/${job.salary.period || 'yearly'}`;
    salaryEls.forEach(el => el.textContent = salStr);
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
  const coverLetter = prompt('Enter your cover letter pitch (optional):') || '';
  
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  try {
    showLoading('Submitting application...');
    const result = await api.applyForJob(jobId, coverLetter);
    
    if (result.success) {
      showSuccess('Application submitted successfully');
      const applyBtn = document.getElementById('applyBtn');
      if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.textContent = 'Applied ✓';
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
  const saveBtn = document.getElementById('saveBtn');

  try {
    const isSaved = saveBtn.classList.contains('active') || saveBtn.textContent.includes('Saved');
    if (isSaved) return;

    const result = await api.saveJob(jobId);
    
    if (result.success) {
      showSuccess('Job saved successfully');
      if (saveBtn) {
        saveBtn.textContent = 'Saved ✓';
        saveBtn.classList.add('active');
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

function handleShare() {
  const title = document.querySelector('.job-title')?.textContent || 'Job Opportunity';
  if (navigator.share) {
    navigator.share({
      title: title,
      text: `Check out this job opportunity on AI Hire: ${title}`,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showSuccess('Job details link copied to clipboard!');
    });
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
  loadingDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; color: white;';
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
