// Admin Recruiters Handler
document.addEventListener('DOMContentLoaded', function() {
  if (!protectAdminRoute()) return;
  loadRecruiters();
});

async function loadRecruiters() {
  try {
    const result = await api.getAllRecruiters();
    if (result.success && result.recruiters) {
      renderRecruiters(result.recruiters);
    }
  } catch (error) {
    showError('Failed to load recruiters');
  }
}

function renderRecruiters(recruiters) {
  const container = document.getElementById('recruitersList');
  if (!container) return;

  container.innerHTML = recruiters.map(recruiter => `
    <div class="application-card gborder">
      <div class="application-header">
        <div class="job-info">
          <h3>${recruiter.company?.name || recruiter.user?.name || 'Recruiter'}</h3>
          <p class="company">${recruiter.user?.email || ''}</p>
        </div>
        <span class="status status-${recruiter.isVerified ? 'verified' : 'pending'}">${recruiter.isVerified ? 'Verified' : 'Pending'}</span>
      </div>
      <div class="application-details">
        <span class="applied-date">Industry: ${recruiter.company?.industry || 'Not specified'}</span>
        <span class="location">Joined: ${formatDate(recruiter.createdAt)}</span>
      </div>
      <div class="application-actions">
        ${!recruiter.isVerified ? `<button class="btn btn-sm btn-grad" onclick="verifyRecruiter('${recruiter._id}')">Verify</button>` : ''}
      </div>
    </div>
  `).join('');
}

async function verifyRecruiter(recruiterId) {
  try {
    const result = await api.verifyRecruiter(recruiterId);
    if (result.success) {
      showSuccess('Recruiter verified successfully');
      loadRecruiters();
    } else {
      showError(result.message || 'Failed to verify recruiter');
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

window.verifyRecruiter = verifyRecruiter;
