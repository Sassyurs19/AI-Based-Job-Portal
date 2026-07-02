// Admin Users Handler
document.addEventListener('DOMContentLoaded', function() {
  if (!protectAdminRoute()) return;
  loadUsers();
});

async function loadUsers() {
  try {
    const result = await api.getAllUsers();
    if (result.success && result.users) {
      renderUsers(result.users);
    }
  } catch (error) {
    showError('Failed to load users');
  }
}

function renderUsers(users) {
  const container = document.getElementById('usersList');
  if (!container) return;

  container.innerHTML = users.map(user => `
    <div class="application-card gborder">
      <div class="application-header">
        <div class="job-info">
          <h3>${user.name || 'User'}</h3>
          <p class="company">${user.email || ''}</p>
        </div>
        <span class="status status-${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span>
      </div>
      <div class="application-details">
        <span class="applied-date">Role: ${user.role || 'candidate'}</span>
        <span class="location">Joined: ${formatDate(user.createdAt)}</span>
      </div>
      <div class="application-actions">
        <button class="btn btn-sm btn-grad" onclick="toggleUserStatus('${user._id}', ${!user.isActive})">
          ${user.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  `).join('');
}

async function toggleUserStatus(userId, isActive) {
  try {
    const result = await api.updateUserStatus(userId, isActive);
    if (result.success) {
      showSuccess(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } else {
      showError(result.message || 'Failed to update user status');
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

window.toggleUserStatus = toggleUserStatus;
