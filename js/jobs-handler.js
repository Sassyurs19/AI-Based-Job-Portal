// Jobs Page Handler
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (!protectCandidateRoute()) return;

  // Load jobs
  loadJobs();

  // Handle search
  const searchBtn = document.querySelector('.search-panel button');
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }

  // Get job ID from URL for job details
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');
  if (jobId) {
    loadJobDetails(jobId);
  }
});

async function loadJobs(params = {}) {
  try {
    const result = await api.getJobs(params);
    
    if (result.success && result.jobs) {
      renderJobs(result.jobs);
      updateJobCount(result.count);
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    showError('Failed to load jobs');
  }
}

function renderJobs(jobs) {
  const jobsContainer = document.querySelector('.jobs-grid');
  if (!jobsContainer) return;

  if (jobs.length === 0) {
    jobsContainer.innerHTML = '<div class="no-jobs">No jobs found</div>';
    return;
  }

  jobsContainer.innerHTML = jobs.map(job => `
    <article class="job-card gborder">
      <div class="job-header">
        <div class="company-logo">${job.company?.name ? job.company.name.substring(0, 2).toUpperCase() : 'CO'}</div>
        <div class="job-info">
          <h3>${job.title || 'Job Title'}</h3>
          <p class="company">${job.company?.name || 'Company'}</p>
        </div>
      </div>
      <div class="job-details">
        <span class="location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
          ${job.location || 'Remote'}
        </span>
        <span class="job-type">${job.jobType || 'Full-time'}</span>
        <span class="experience">${job.experience || 'Not specified'}</span>
      </div>
      <div class="job-tags">
        ${(job.skills || []).slice(0, 3).map(skill => `<span class="tag">${skill}</span>`).join('')}
      </div>
      <div class="job-footer">
        <span class="posted">${formatDate(job.createdAt)}</span>
        <div class="job-actions">
          <button class="btn btn-sm btn-ghost" onclick="saveJob('${job._id}')">Save</button>
          <a href="job-details.html?id=${job._id}" class="btn btn-sm btn-grad">View Details</a>
        </div>
      </div>
    </article>
  `).join('');
}

async function loadJobDetails(jobId) {
  try {
    const result = await api.getJobById(jobId);
    
    if (result.success && result.job) {
      renderJobDetails(result.job);
    } else {
      showError('Job not found');
    }
  } catch (error) {
    console.error('Error loading job details:', error);
    showError('Failed to load job details');
  }
}

function renderJobDetails(job) {
  // Update job details page
  const titleEl = document.querySelector('.job-detail-header h1');
  if (titleEl) titleEl.textContent = job.title || 'Job Title';

  const companyEl = document.querySelector('.job-detail-header .company');
  if (companyEl) companyEl.textContent = job.company?.name || 'Company';

  const descriptionEl = document.querySelector('.job-description');
  if (descriptionEl) descriptionEl.textContent = job.description || '';

  const requirementsEl = document.querySelector('.job-requirements');
  if (requirementsEl && job.requirements) {
    requirementsEl.innerHTML = job.requirements.map(req => `<li>${req}</li>`).join('');
  }

  const responsibilitiesEl = document.querySelector('.job-responsibilities');
  if (responsibilitiesEl && job.responsibilities) {
    responsibilitiesEl.innerHTML = job.responsibilities.map(resp => `<li>${resp}</li>`).join('');
  }

  const skillsEl = document.querySelector('.job-skills');
  if (skillsEl && job.skills) {
    skillsEl.innerHTML = job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
  }

  const salaryEl = document.querySelector('.job-salary');
  if (salaryEl && job.salary) {
    salaryEl.textContent = `$${job.salary.min || 0} - $${job.salary.max || 0} ${job.salary.currency || 'USD'}/${job.salary.period || 'yearly'}`;
  }

  // Setup apply button
  const applyBtn = document.querySelector('.apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => applyForJob(job._id));
  }

  // Setup save button
  const saveBtn = document.querySelector('.save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => saveJob(job._id));
  }
}

function handleSearch() {
  const searchInput = document.querySelector('.search-field input[placeholder="e.g. Data Scientist"]');
  const skillsInput = document.querySelector('.search-field input[placeholder="e.g. Python, ML"]');
  const locationInput = document.querySelector('.search-field input[placeholder="e.g. Remote, SF"]');
  const experienceSelect = document.querySelector('.search-field select');
  const salarySelect = document.querySelectorAll('.search-field select')[1];

  const params = {};
  if (searchInput?.value) params.search = searchInput.value;
  if (skillsInput?.value) params.skills = skillsInput.value;
  if (locationInput?.value) params.location = locationInput.value;
  if (experienceSelect?.value) params.experience = experienceSelect.value;
  if (salarySelect?.value) params.salary = salarySelect.value;

  loadJobs(params);
}

async function saveJob(jobId) {
  try {
    const result = await api.saveJob(jobId);
    
    if (result.success) {
      showSuccess('Job saved successfully');
    } else {
      showError(result.message || 'Failed to save job');
    }
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Save job error:', error);
  }
}

async function applyForJob(jobId) {
  const coverLetter = prompt('Enter your cover letter (optional):');
  
  try {
    const result = await api.applyForJob(jobId, coverLetter || '');
    
    if (result.success) {
      showSuccess('Application submitted successfully');
    } else {
      showError(result.message || 'Failed to submit application');
    }
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Apply job error:', error);
  }
}

function updateJobCount(count) {
  const countEl = document.querySelector('.job-count');
  if (countEl) {
    countEl.textContent = `${count} jobs found`;
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
