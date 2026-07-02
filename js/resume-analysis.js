// File upload handling
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const analysisResults = document.getElementById('analysisResults');

uploadZone.addEventListener('click', () => fileInput.click());

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
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  if (!file.type.match('application/pdf') && !file.name.match(/\.(doc|docx)$/i)) {
    alert('Please upload a PDF or Word document.');
    return;
  }
  
  uploadSection.innerHTML = `
    <div class="upload-zone" style="border-style:solid;">
      <div class="upload-zone-icon" style="background:rgba(34,197,94,.15); color:#22c55e;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h3>File Uploaded Successfully</h3>
      <p>${file.name}</p>
      <p style="font-size:.85rem; color:#22c55e;">Analyzing your resume...</p>
    </div>
  `;
  
  setTimeout(() => {
    uploadSection.style.display = 'none';
    analysisResults.style.display = 'block';
    animateProgressRing();
  }, 2000);
}

function animateProgressRing() {
  const ring = document.querySelector('.progress-ring-fill');
  const targetOffset = 50;
  ring.style.strokeDashoffset = 377;
  setTimeout(() => {
    ring.style.strokeDashoffset = targetOffset;
  }, 500);
}

// Improve Resume button
document.getElementById('improveBtn').addEventListener('click', function() {
  alert('Resume improvement editor would open here with AI-powered suggestions.');
});

// Upload New Resume button
document.getElementById('uploadNewBtn').addEventListener('click', function() {
  uploadSection.style.display = 'block';
  uploadSection.innerHTML = `
    <div class="upload-zone" id="uploadZone">
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
      <input type="file" id="fileInput" accept=".pdf,.doc,.docx" />
    </div>
  `;
  analysisResults.style.display = 'none';
  
  // Re-attach event listeners
  const newUploadZone = document.getElementById('uploadZone');
  const newFileInput = document.getElementById('fileInput');
  
  newUploadZone.addEventListener('click', () => newFileInput.click());
  
  newUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    newUploadZone.classList.add('dragover');
  });
  
  newUploadZone.addEventListener('dragleave', () => {
    newUploadZone.classList.remove('dragover');
  });
  
  newUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    newUploadZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });
  
  newFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });
});

// Course enroll buttons
document.querySelectorAll('.course-item-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    this.textContent = 'Enrolled ✓';
    this.style.background = 'rgba(34,197,94,.15)';
    this.style.borderColor = 'rgba(34,197,94,.3)';
    this.style.color = '#22c55e';
  });
});

// Job apply buttons
document.querySelectorAll('.job-item-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    window.location.href = 'job-details.html';
  });
});
