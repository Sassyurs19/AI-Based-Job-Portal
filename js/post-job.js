// Consolidated Post Job page script

const skills = [];

document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (window.protectRecruiterRoute && !protectRecruiterRoute()) return;

  const skillsContainer = document.getElementById('skillsContainer');
  const skillInput = skillsContainer ? skillsContainer.querySelector('.skill-tag-input') : null;

  if (skillInput) {
    skillInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim()) {
        e.preventDefault();
        addSkill(this.value.trim());
        this.value = '';
      }
    });
  }

  // Recommended skills click
  document.querySelectorAll('.recommended-skill').forEach(skill => {
    skill.addEventListener('click', function() {
      addSkill(this.textContent);
    });
  });

  // Radio option selection
  document.querySelectorAll('.radio-option').forEach(option => {
    option.addEventListener('click', function() {
      const radio = this.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
      }
    });
  });

  // Handle job form submission
  const jobForm = document.getElementById('jobForm');
  if (jobForm) {
    jobForm.addEventListener('submit', handleJobSubmit);
  }

  // Handle edit mode if job ID is in URL
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');
  if (jobId) {
    loadJobForEdit(jobId);
  }
});

function addSkill(skill) {
  if (skills.includes(skill)) return;
  
  skills.push(skill);
  const skillsContainer = document.getElementById('skillsContainer');
  const skillInput = skillsContainer ? skillsContainer.querySelector('.skill-tag-input') : null;
  
  const tag = document.createElement('span');
  tag.className = 'skill-tag';
  tag.innerHTML = `
    ${skill}
    <span class="skill-tag-remove">&times;</span>
  `;
  
  tag.querySelector('.skill-tag-remove').addEventListener('click', function() {
    removeSkill(skill, tag);
  });
  
  if (skillsContainer && skillInput) {
    skillsContainer.insertBefore(tag, skillInput);
  }
}

function removeSkill(skill, tag) {
  const index = skills.indexOf(skill);
  if (index > -1) {
    skills.splice(index, 1);
    tag.remove();
  }
}

async function loadJobForEdit(jobId) {
  try {
    showLoading('Loading job details...');
    const result = await api.getJobById(jobId);
    
    if (result.success && result.job) {
      populateJobForm(result.job);
    } else {
      showError('Job not found');
    }
  } catch (error) {
    console.error('Error loading job:', error);
    showError('Failed to load job details');
  } finally {
    hideLoading();
  }
}

function populateJobForm(job) {
  if (document.getElementById('jobTitle')) document.getElementById('jobTitle').value = job.title || '';
  if (document.getElementById('companyName')) document.getElementById('companyName').value = job.company?.name || '';
  if (document.getElementById('jobLocation')) document.getElementById('jobLocation').value = job.location || '';
  if (document.getElementById('jobDescription')) document.getElementById('jobDescription').value = job.description || '';
  if (document.getElementById('employmentType')) document.getElementById('employmentType').value = job.jobType || 'full-time';
  if (document.getElementById('experienceRequired')) document.getElementById('experienceRequired').value = job.experience || '';
  if (document.getElementById('jobCategory')) document.getElementById('jobCategory').value = job.category || 'other';
  
  if (document.getElementById('deadline') && job.deadline) {
    document.getElementById('deadline').value = new Date(job.deadline).toISOString().substring(0, 10);
  }

  // Work Mode radio
  if (job.workMode) {
    const radio = document.querySelector(`input[name="workMode"][value="${job.workMode}"]`);
    if (radio) {
      radio.checked = true;
      document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('selected'));
      radio.closest('.radio-option')?.classList.add('selected');
    }
  }

  // Salary Range
  if (document.getElementById('salaryRange') && job.salary) {
    document.getElementById('salaryRange').value = `$${job.salary.min}k - $${job.salary.max}k`;
  }

  // Skills
  if (job.skills) {
    job.skills.forEach(skill => addSkill(skill));
  }

  // Requirements and Responsibilities
  if (document.getElementById('jobQualifications') && job.requirements) {
    document.getElementById('jobQualifications').value = job.requirements.join('\n');
  }
  if (document.getElementById('jobResponsibilities') && job.responsibilities) {
    document.getElementById('jobResponsibilities').value = job.responsibilities.join('\n');
  }
}

function parseSalaryRange(val) {
  let min = 0, max = 0;
  const matches = val.replace(/,/g, '').match(/\d+/g);
  if (matches) {
    if (matches.length >= 2) {
      min = parseInt(matches[0]);
      max = parseInt(matches[1]);
    } else if (matches.length === 1) {
      min = parseInt(matches[0]);
      max = min;
    }
    if (!val.toLowerCase().includes('k')) {
      if (min >= 1000) min = Math.round(min / 1000);
      if (max >= 1000) max = Math.round(max / 1000);
    }
  }
  return { min, max, currency: 'USD', period: 'yearly' };
}

async function handleJobSubmit(e) {
  e.preventDefault();

  const formData = {
    title: document.getElementById('jobTitle').value.trim(),
    companyName: document.getElementById('companyName').value.trim(),
    location: document.getElementById('jobLocation').value.trim(),
    description: document.getElementById('jobDescription').value.trim(),
    jobType: document.getElementById('employmentType').value,
    workMode: document.querySelector('input[name="workMode"]:checked')?.value || 'remote',
    salary: parseSalaryRange(document.getElementById('salaryRange').value.trim()),
    skills: skills,
    experience: document.getElementById('experienceRequired').value,
    requirements: document.getElementById('jobQualifications').value.split('\n').map(r => r.trim()).filter(r => r),
    responsibilities: document.getElementById('jobResponsibilities').value.split('\n').map(r => r.trim()).filter(r => r),
    category: document.getElementById('jobCategory').value,
    deadline: document.getElementById('deadline').value
  };

  // Validate required fields
  if (!formData.title || !formData.location || !formData.description) {
    showError('Please fill in all required fields');
    return;
  }

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    let result;
    if (jobId) {
      result = await api.updateJob(jobId, formData);
    } else {
      result = await api.createJob(formData);
    }

    if (result.success) {
      showSuccess(jobId ? 'Job updated successfully' : 'Job posted successfully');
      setTimeout(() => {
        window.location.href = 'recruiter-dashboard.html';
      }, 1500);
    } else {
      showError(result.message || 'Failed to submit job');
    }
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Job submission error:', error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
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

window.addSkill = addSkill;
