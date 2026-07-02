// Admin Jobs Handler
document.addEventListener('DOMContentLoaded', function() {
  if (!protectAdminRoute()) return;
  loadJobs();
});

async function loadJobs() {
  try {
    const result = await api.getAllJobs();
    if (result.success && result.jobs) {
      renderJobs(result.jobs);
    }
  } catch (error) {
    showError('Failed to load jobs');
  }
}

function renderJobs(jobs) {
  const container = document.getElementById('jobsList');
  if (!container) return;

  container.innerHTML = jobs.map(job => `
    <div class="application-card gborder">
      <div class="application-header">
        <div class="job-info">
          <h3>${job.title || 'Job'}</h3>
          <p class="company">${job.company?.name || 'Company'}</p>
        </div>
        <span class="status status-${job.status || 'active'}">${job.status || 'Active'}</span>
      </div>
      <div class="application-details">
        <span class="applied-date">Applications: ${job.applications || 0}</span>
        <span class="location">Posted: ${formatDate(job.createdAt)}</span>
      </div>
      <div class="application-actions">
        <button class="btn btn-sm btn-ghost" onclick="deleteJob('${job._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

async function deleteJob(jobId) {
  if (!confirm('Are you sure you want to delete this job?')) return;

  try {
    const result = await api.deleteJobAdmin(jobId);
    if (result.success) {
      showSuccess('Job deleted successfully');
      loadJobs();
    } else {
      showError(result.message || 'Failed to delete job');
    }
  } catch (error) {
    showError('An error occurred');
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showSuccess(message) {
  const div = document.createElement('div');
  div.textContent = message;
  div.style.cssText = 'color: #10b981; padding: 1rem; margin: 1rem 0; background: #d1fae5; border-radius: 8px; position: fixed; top: 20px; right: 20px; z-index: 1000;';
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function showError(message) {
  const div = document.createElement('div');
  div.textContent = message;
  div.style.cssText = 'color: #ef4444; padding: 1rem; margin: 1rem 0; background: #fee2e2; border-radius: 8px; position: fixed; top: 20px; right: 20px; z-index: 1000;';
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 5000);
}

window.deleteJob = deleteJob;
