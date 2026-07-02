// Set Password Handler
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('setPasswordForm');
  const formSuccess = document.getElementById('formSuccess');

  // Get user info from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId') || localStorage.getItem('pendingUserId');
  const userEmail = urlParams.get('email') || localStorage.getItem('pendingEmail');
  const userRole = urlParams.get('role') || 'candidate';

  if (!userId) {
    window.location.href = 'register.html';
    return;
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!password || password.length < 8) {
      showError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    const setPasswordBtn = document.getElementById('setPasswordBtn');
    setPasswordBtn.disabled = true;
    setPasswordBtn.textContent = 'Setting Password...';

    try {
      const result = await api.setPassword(userId, password);
      
      if (result.success) {
        // Clear pending user data
        localStorage.removeItem('pendingUserId');
        localStorage.removeItem('pendingEmail');
        
        // Redirect to terms & conditions
        const redirectUrl = userRole === 'recruiter' ? 'complete-profile-recruiter.html' : 'complete-profile-candidate.html';
        window.location.href = 'terms-conditions.html?redirect=' + redirectUrl + '&role=' + userRole;
      } else {
        showError(result.message || 'Failed to set password.');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('Set password error:', error);
    } finally {
      setPasswordBtn.disabled = false;
      setPasswordBtn.textContent = 'Set Password';
    }
  });

  function showError(message) {
    const existingError = form.querySelector('.error-message');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 1rem; text-align: center;';
    form.appendChild(errorDiv);

    setTimeout(() => errorDiv.remove(), 5000);
  }
});
