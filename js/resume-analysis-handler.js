// Resume Analysis Handler
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (window.protectCandidateRoute && !protectCandidateRoute()) return;

  // Setup file upload
  setupFileUpload();

  // Handle job selection for analysis
  const jobSelect = document.getElementById('jobSelect');
  if (jobSelect) {
    loadJobsForAnalysis();
    jobSelect.addEventListener('change', handleJobSelection);
  }

  // Handle analyze button
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleAnalysis);
  }
});

function setupFileUpload() {
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const chooseBtn = uploadZone?.querySelector('.btn-grad');

  if (!uploadZone || !fileInput) return;

  // Click to browse
  if (chooseBtn) {
    chooseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  uploadZone.addEventListener('click', () => fileInput.click());

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  });
}

async function handleFileSelect(file) {
  // Validate file type
  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(file.type) && !/\.(pdf|doc|docx)$/i.test(file.name)) {
    showError('Please upload a PDF, DOC, or DOCX file');
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showError('File size must be less than 5MB');
    return;
  }

  // Show file info in UI
  const uploadZone = document.getElementById('uploadZone');
  if (uploadZone) {
    uploadZone.innerHTML = `
      <div class="file-info" style="display:flex; flex-direction:column; align-items:center; gap:12px; padding:24px;">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#22c55e" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>
        <div>
          <h4 style="margin:0; font-size:1.1rem;">${file.name}</h4>
          <p style="margin:4px 0 0 0; color:var(--muted); font-size:0.9rem;">${(file.size / 1024).toFixed(2)} KB</p>
        </div>
        <button class="btn btn-sm btn-ghost" id="changeFileBtn" style="margin-top:8px;">Change File</button>
      </div>
    `;
    const changeFileBtn = document.getElementById('changeFileBtn');
    if (changeFileBtn) {
      changeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
      });
    }
  }

  // Upload resume
  try {
    showLoading('Uploading resume...');
    const result = await api.uploadResume(file);
    
    if (result.success) {
      showSuccess('Resume uploaded successfully');
      // Enable analysis
      const analyzeBtn = document.getElementById('analyzeBtn');
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
      }
    } else {
      showError(result.message || 'Failed to upload resume');
      resetUpload();
    }
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Upload error:', error);
    resetUpload();
  } finally {
    hideLoading();
  }
}

function resetUpload() {
  const uploadZone = document.getElementById('uploadZone');
  if (uploadZone) {
    uploadZone.innerHTML = `
      <div class="upload-zone-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </div>
      <h3>Upload Your Resume</h3>
      <p>Drag and drop your resume here, or click to browse</p>
      <p style="font-size:.85rem; margin-bottom:16px;">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
      <button class="btn btn-grad">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Choose File
      </button>
      <input type="file" id="fileInput" accept=".pdf,.doc,.docx" style="display:none">
    `;
    setupFileUpload();
  }
}

async function loadJobsForAnalysis() {
  try {
    const result = await api.getJobs();
    
    if (result.success && result.jobs) {
      const jobSelect = document.getElementById('jobSelect');
      if (jobSelect) {
        jobSelect.innerHTML = '<option value="">Select a job to analyze against</option>' +
          result.jobs.map(job => `<option value="${job._id}">${job.title} - ${job.company?.name || 'Company'}</option>`).join('');
      }
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
  }
}

function handleJobSelection(e) {
  const jobId = e.target.value;
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.disabled = !jobId;
  }
}

async function handleAnalysis() {
  const jobSelect = document.getElementById('jobSelect');
  const jobId = jobSelect?.value;

  if (!jobId) {
    showError('Please select a job to analyze against');
    return;
  }

  try {
    showLoading('Analyzing resume...');
    const result = await api.analyzeResume(jobId);
    
    if (result.success) {
      displayAnalysisResults(result.analysis);
    } else {
      showError(result.message || 'Failed to analyze resume');
    }
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Analysis error:', error);
  } finally {
    hideLoading();
  }
}

function displayAnalysisResults(analysis) {
  const analysisResults = document.getElementById('analysisResults');
  const uploadSection = document.getElementById('uploadSection');
  const pageHeader = document.querySelector('.page-header');
  if (!analysisResults || !uploadSection) return;

  // Hide upload section and header
  uploadSection.style.display = 'none';
  if (pageHeader) pageHeader.style.display = 'none';
  analysisResults.style.display = 'grid';

  // Format skills
  const matched = analysis.sections?.skills?.matchedSkills || [];
  const missing = analysis.sections?.skills?.missingSkills || [];

  // Re-populate the main grid
  analysisResults.innerHTML = `
    <!-- Main Content -->
    <div class="resume-main">
      <!-- Resume Preview -->
      <div class="resume-preview-card">
        <div class="resume-preview-header">
          <h2>Resume Analysis Results</h2>
          <div class="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Analysis Complete
          </div>
        </div>
        <div class="resume-preview-content">
          <h3 style="font-size:1.2rem; margin-bottom:8px;">${api.getCurrentUser()?.name || 'User Profile'}</h3>
          <p style="margin-bottom:4px; color:var(--muted);">${api.getCurrentUser()?.email || ''} · ${api.getCurrentUser()?.phone || 'No phone provided'}</p>
          <p style="margin-top:12px; font-weight:500;">AI Summary Feedback:</p>
          <p style="color:var(--muted);">${analysis.sections?.summary?.feedback || 'Analysis completed successfully.'}</p>
        </div>
      </div>

      <!-- Scores -->
      <div class="scores-grid">
        <div class="score-card">
          <div class="score-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>
          </div>
          <div class="label">ATS Score</div>
          <div class="value ats">${analysis.atsScore || 0}%</div>
          <div class="desc">${analysis.atsScore > 80 ? 'Excellent optimization' : 'Needs optimization'}</div>
        </div>
        <div class="score-card">
          <div class="score-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17-2 2"/></svg>
          </div>
          <div class="label">AI Match Score</div>
          <div class="value match">${analysis.overallScore || 0}%</div>
          <div class="desc">${analysis.overallScore > 75 ? 'Highly competitive' : 'Moderate match'}</div>
        </div>
      </div>

      <!-- Skills -->
      <div class="skills-section">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17-2 2"/></svg>
          Skills Analysis
        </h2>
        <div class="skills-grid">
          <div class="skills-card">
            <h3>Skills Found (${matched.length})</h3>
            <div class="skills-list">
              ${matched.length > 0 ? matched.map(s => `<span class="skill-tag">${s}</span>`).join('') : '<span style="color:var(--muted)">None identified</span>'}
            </div>
          </div>
          <div class="skills-card">
            <h3>Missing Skills (${missing.length})</h3>
            <div class="skills-list">
              ${missing.length > 0 ? missing.map(s => `<span class="skill-tag missing">${s}</span>`).join('') : '<span style="color:var(--muted)">None identified</span>'}
            </div>
          </div>
        </div>
      </div>

      <!-- Strengths -->
      <div class="analysis-card">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="green"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Feedback Sections
        </h2>
        <div class="analysis-list">
          <div class="analysis-item">
            <div class="analysis-item-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3 8-8"/></svg>
            </div>
            <div class="analysis-item-content">
              <h4>Experience Alignment</h4>
              <p>${analysis.sections?.experience?.feedback || 'Experience validation passed.'}</p>
            </div>
          </div>
          <div class="analysis-item">
            <div class="analysis-item-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3 8-8"/></svg>
            </div>
            <div class="analysis-item-content">
              <h4>Education Relevance</h4>
              <p>${analysis.sections?.education?.feedback || 'Education validation passed.'}</p>
            </div>
          </div>
          <div class="analysis-item">
            <div class="analysis-item-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3 8-8"/></svg>
            </div>
            <div class="analysis-item-content">
              <h4>Formatting & ATS Friendliness</h4>
              <p>${analysis.sections?.formatting?.feedback || 'Good resume formatting.'}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Suggestions -->
      <div class="suggestions-card">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          AI Recommendations
        </h2>
        ${(analysis.recommendations || []).map(rec => `
          <div class="suggestion-item">
            <div class="suggestion-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <div class="suggestion-item-content">
              <h4>Optimization Tip</h4>
              <p>${rec}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Recommended Jobs -->
      <div class="jobs-card" id="recommendedJobsCard">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="2.5"/><circle cx="5" cy="6" r="1.8"/><circle cx="19" cy="6" r="1.8"/><circle cx="5" cy="18" r="1.8"/><circle cx="19" cy="18" r="1.8"/><path d="M6.6 7 10 11M17.4 7 14 11M6.6 17 10 13M17.4 17 14 13"/></svg>
          Recommended Jobs
        </h2>
        <div id="jobsRecommendationList">Loading recommended jobs...</div>
      </div>

      <!-- Action Buttons -->
      <div class="actions-section">
        <button class="btn btn-grad" id="improveBtn">Improve Resume</button>
        <button class="btn btn-ghost" id="uploadNewBtn">Upload New Resume</button>
      </div>
    </div>

    <!-- Sidebar -->
    <aside class="resume-sidebar">
      <!-- Overall Score Card -->
      <div class="sidebar-card">
        <h3>Overall Score</h3>
        <div class="progress-ring">
          <svg width="120" height="120">
            <circle class="progress-ring-bg" cx="60" cy="60" r="52"/>
            <circle class="progress-ring-fill" cx="60" cy="60" r="52" stroke-dasharray="326.73" stroke-dashoffset="326.73"/>
          </svg>
          <div class="progress-ring-text">${analysis.overallScore || 0}%</div>
        </div>
        <div class="stats-list">
          <div class="stat-item">
            <span class="stat-item-label">Skills Found</span>
            <span class="stat-item-value">${matched.length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-item-label">Missing Skills</span>
            <span class="stat-item-value">${missing.length}</span>
          </div>
        </div>
      </div>

      <!-- Quick Tips -->
      <div class="sidebar-card">
        <h3>Quick Tips</h3>
        <div class="analysis-list">
          <div class="analysis-item" style="padding:10px;">
            <div class="analysis-item-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 2v7h7"/></svg>
            </div>
            <div class="analysis-item-content">
              <h4 style="font-size:.85rem;">Keep it concise</h4>
              <p style="font-size:.78rem;">Aim for 1-2 pages maximum</p>
            </div>
          </div>
          <div class="analysis-item" style="padding:10px;">
            <div class="analysis-item-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <div class="analysis-item-content">
              <h4 style="font-size:.85rem;">Use action verbs</h4>
              <p style="font-size:.78rem;">Start bullets with strong verbs</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  `;

  // Animate progress ring
  const ring = document.querySelector('.progress-ring-fill');
  if (ring) {
    const score = analysis.overallScore || 0;
    const offset = ((100 - score) / 100) * 326.73;
    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
    }, 500);
  }

  // Bind actions
  const improveBtn = document.getElementById('improveBtn');
  if (improveBtn) {
    improveBtn.addEventListener('click', () => {
      alert('Resume improvement tips: focus on adding missing technical skills listed above.');
    });
  }

  const uploadNewBtn = document.getElementById('uploadNewBtn');
  if (uploadNewBtn) {
    uploadNewBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }

  // Load recommended jobs dynamically
  loadRecommendedJobs();
}

async function loadRecommendedJobs() {
  const container = document.getElementById('jobsRecommendationList');
  if (!container) return;

  try {
    const result = await api.getJobs();
    if (result.success && result.jobs) {
      if (result.jobs.length === 0) {
        container.innerHTML = '<p style="color:var(--muted)">No jobs matching your profile found.</p>';
        return;
      }
      container.innerHTML = result.jobs.slice(0, 3).map(job => `
        <div class="job-item" style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:16px; margin-bottom:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
          <div class="job-item-content" style="flex:1;">
            <h4 style="margin:0; font-size:1rem; font-weight:600;">${job.title || 'Job Title'}</h4>
            <p style="margin:4px 0; font-size:0.875rem; color:var(--muted);">${job.company?.name || 'Company'} · ${job.location || 'Remote'}</p>
            <span style="font-size:0.75rem; color:var(--muted); font-weight:500;">Salary: ${job.salary ? '$' + job.salary.min + 'k - $' + job.salary.max + 'k' : 'Not specified'}</span>
          </div>
          <button class="btn btn-sm btn-grad" onclick="window.location.href='job-details.html?id=${job._id}'" style="margin-left:16px;">View</button>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p style="color:var(--muted)">Unable to load recommended jobs.</p>';
    }
  } catch (err) {
    console.error('Error loading recommendations:', err);
    container.innerHTML = '<p style="color:var(--muted)">Error loading jobs.</p>';
  }
}

// Helpers
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
