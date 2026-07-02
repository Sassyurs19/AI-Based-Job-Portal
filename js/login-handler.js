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
  }

  // Handle Google login
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', function() {
      const backendUrl = window.getBackendUrl ? window.getBackendUrl() : 'http://localhost:5000';
      const frontendUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
      window.location.href = `${backendUrl}/api/auth/google?frontend_url=${encodeURIComponent(frontendUrl)}`;
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
    const agreeTerms = document.getElementById('agreeTerms');

    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    if (!agreeTerms || !agreeTerms.checked) {
      showError('You must agree to the terms and conditions');
      const errAgreeTerms = document.getElementById('err-agreeTerms');
      if (errAgreeTerms) errAgreeTerms.style.display = 'block';
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
        showError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  });

  // Handle forgot password
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      const email = prompt('Enter your email address:');
      if (email) {
        handleForgotPassword(email);
      }
    });
  }

  function handleForgotPassword(email) {
    setLoading(true);
    api.forgotPassword(email)
      .then(result => {
        if (result.success) {
          alert('Password reset email sent. Please check your inbox.');
        } else {
          showError(result.message || 'Failed to send reset email.');
        }
      })
      .catch(error => {
        showError('An error occurred. Please try again.');
        console.error('Forgot password error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function setLoading(loading) {
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
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 1rem; text-align: center;';
    loginForm.appendChild(errorDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
});
