// Login Handler
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('regForm') || document.querySelector('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitButton = loginForm ? loginForm.querySelector('button[type="submit"]') : null;
  const forgotPasswordLink = document.querySelector('.forgot');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const githubLoginBtn = document.getElementById('githubLoginBtn');

  if (!loginForm) return;

  // Check for Google login/signup errors from URL redirect
  const urlParams = new URLSearchParams(window.location.search);
  const urlError = urlParams.get('error');
  if (urlError === 'email_exists_use_google_login') {
    showError('An account already exists with this email. Please sign in with Google.');
  } else if (urlError === 'google_auth_failed') {
    showError('Google authentication failed. Please try again.');
  } else if (urlError === 'account_not_found') {
    showError('No account found with this email. Please register first.');
  }

  // Handle Google login — same-tab redirect flow
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', function() {
      const backendUrl = window.getBackendUrl ? window.getBackendUrl() : 'http://localhost:5000';
      const frontendUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
      const authUrl = `${backendUrl}/api/auth/google?frontend_url=${encodeURIComponent(frontendUrl)}`;
      window.location.href = authUrl;
    });
  }

  // Handle GitHub login (placeholder - not implemented yet)
  if (githubLoginBtn) {
    githubLoginBtn.addEventListener('click', function() {
      showError('GitHub login coming soon!');
    });
  }

  // Handle form submission
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    // Show loading state
    setLoading(true);

    try {
      const result = await api.login(email, password);

      if (result.success) {
        // Redirect based on role
        const role = result.user.role;
        if (role === 'candidate') {
          window.location.href = 'candidate-dashboard.html';
        } else if (role === 'recruiter') {
          window.location.href = 'recruiter-dashboard.html';
        } else if (role === 'admin') {
          window.location.href = 'admin/admin-dashboard.html';
        }
      } else {
        // Show descriptive error messages
        if (result.requiresPassword) {
          showError('No password set for this account. <a href="forgot-password.html" style="color: #8b5cf6;">Set a password</a> or use Google login.');
        } else {
          showError(result.message || 'Login failed. Please check your credentials and try again.');
        }
      }
    } catch (error) {
      showError('Unable to connect to the server. Please check your internet connection and try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  });

  // Handle forgot password links via default navigation to forgot-password.html

  function setLoading(loading) {
    if (!submitButton) return;
    if (loading) {
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';
      submitButton.classList.add('loading');
    } else {
      submitButton.disabled = false;
      submitButton.textContent = 'Sign In';
      submitButton.classList.remove('loading');
    }
  }

  function showError(message) {
    // Remove existing error
    const existingError = loginForm.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = message;
    errorDiv.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 1rem; text-align: center; padding: 0.75rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.2);';
    loginForm.appendChild(errorDiv);

    // Auto remove after 8 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 8000);
  }
});
