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
      const stateId = 'state_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const authUrl = `${backendUrl}/api/auth/google?state_id=${stateId}&frontend_url=${encodeURIComponent(frontendUrl)}`;
      
      const width = 500;
      const height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      const popup = window.open(authUrl, 'Google Login', `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`);

      if (!popup) {
        showError('Popup blocked! Please allow popups for Google Sign In.');
        return;
      }

      // Polling interval
      const pollInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollInterval);
        }
        
        fetch(`${backendUrl}/api/auth/google/status/${stateId}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.authenticated) {
              clearInterval(pollInterval);
              if (popup && !popup.closed) {
                popup.close();
              }
              
              const { token, refreshToken, role, completeProfile } = data;
              api.setTokens(token, refreshToken);
              api.getMe().then(result => {
                if (result.success) {
                  api.setCurrentUser(result.user);
                  if (completeProfile) {
                    window.location.href = role === 'candidate' ? 'complete-profile-candidate.html' : 'complete-profile-recruiter.html';
                  } else {
                    window.location.href = role === 'candidate' ? 'candidate-dashboard.html' : 'recruiter-dashboard.html';
                  }
                }
              }).catch(err => {
                showError('Failed to fetch user profile details.');
              });
            } else if (data.success && data.error) {
              clearInterval(pollInterval);
              if (popup && !popup.closed) {
                popup.close();
              }
              const errorMsg = data.error === 'email_exists_use_google_login'
                ? 'An account already exists with this email. Please sign in with Google.'
                : 'Google authentication failed. Please try again.';
              showError(errorMsg);
            }
          })
          .catch(err => {
            console.error('Error polling status:', err);
          });
      }, 1000);
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
