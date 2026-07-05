// Candidate Registration Handler
document.addEventListener('DOMContentLoaded', function() {
  if (window.checkAuthAndRedirect) {
    checkAuthAndRedirect();
  }
  const form = document.getElementById('regForm');
  if (!form) return;

  // Check for error parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlError = urlParams.get('error');
  if (urlError === 'account_not_found') {
    // We defer showing error slightly to ensure form is fully set up
    setTimeout(() => {
      showError('No account found for this Google email. Please register/create an account first.');
    }, 100);
  }

  let registeredUserId = null;
  let registeredEmail = null;
  let isOTPMode = false;

  // OTP Box functionality
  const otpBoxes = document.querySelectorAll('.premium-otp-box');
  otpBoxes.forEach((box, index) => {
    box.addEventListener('input', function(e) {
      const value = e.target.value;
      if (value.length === 1 && index < otpBoxes.length - 1) {
        otpBoxes[index + 1].focus();
      }
    });

    box.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        otpBoxes[index - 1].focus();
      }
    });

    box.addEventListener('paste', function(e) {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').slice(0, 6);
      pasteData.split('').forEach((char, i) => {
        if (otpBoxes[i]) {
          otpBoxes[i].value = char;
        }
      });
      if (pasteData.length === 6) {
        otpBoxes[5].focus();
      }
    });
  });

  // Get OTP from boxes
  function getOTPFromBoxes() {
    let otp = '';
    otpBoxes.forEach(box => {
      otp += box.value;
    });
    return otp;
  }

  // Clear OTP boxes
  function clearOTPBoxes() {
    otpBoxes.forEach(box => {
      box.value = '';
      box.classList.remove('filled');
    });
    otpBoxes[0].focus();
  }

  // Handle Google signup
  const googleSignupBtn = document.getElementById('googleSignupBtn');
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', function() {
      const backendUrl = window.getBackendUrl ? window.getBackendUrl() : 'http://localhost:5000';
      const frontendUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
      const stateId = 'state_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const authUrl = `${backendUrl}/api/auth/google/signup?role=candidate&state_id=${stateId}&frontend_url=${encodeURIComponent(frontendUrl)}`;
      
      const width = 500;
      const height = 600;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      const popup = window.open(authUrl, 'Google Signup', `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`);

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
            if (data.success && data.authenticated && data.token) {
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

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (isOTPMode) {
      // Handle OTP verification
      await handleOTPVerification();
      return;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const agreeTerms = document.getElementById('agreeTerms');
    
    if (!firstName) {
      showError('Please enter your first name.');
      return;
    }
    
    if (!lastName) {
      showError('Please enter your last name.');
      return;
    }
    
    if (!email || !isValidEmail(email)) {
      showError('Please enter a valid email address.');
      return;
    }

    if (!agreeTerms || !agreeTerms.checked) {
      showError('You must agree to the terms and conditions.');
      const errAgreeTerms = document.getElementById('err-agreeTerms');
      if (errAgreeTerms) errAgreeTerms.style.display = 'block';
      return;
    }

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="premium-spinner"></div>';

    try {
      // Register with name and email (password will be set later)
      const formData = {
        name: `${firstName} ${lastName}`,
        email: email,
        password: 'Temp_password_' + Date.now(), // Temporary password
        role: 'candidate'
      };

      const result = await api.register(formData);

      if (result.success) {
        if (result.requiresVerification) {
          // Switch to OTP verification mode
          registeredUserId = result.userId;
          registeredEmail = email;
          isOTPMode = true;
          
          // Hide form fields, show OTP section
          document.getElementById('formGrid').style.display = 'none';
          document.getElementById('otpSection').style.display = 'block';
          document.getElementById('otpSection').style.animation = 'fadeInUp 0.5s ease';
          submitBtn.textContent = 'Verify Email';
          submitBtn.disabled = false;
          
          // Focus first OTP box
          setTimeout(() => {
            if (otpBoxes.length > 0) otpBoxes[0].focus();
          }, 100);
          
          // Start timer
          startTimer();
        } else {
          // Old flow (without OTP) - redirect to set password
          const userIdVal = result.userId || (result.user && result.user.id);
          localStorage.setItem('pendingUserId', userIdVal);
          localStorage.setItem('pendingEmail', email);
          window.location.href = 'set-password.html?userId=' + userIdVal + '&email=' + email;
        }
      } else {
        if (result.requiresPassword) {
          showError(result.message + ' <a href="forgot-password.html" style="color: #8b5cf6;">Set a password here</a>');
        } else {
          showError(result.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      if (!isOTPMode) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });

  async function handleOTPVerification() {
    const otp = getOTPFromBoxes();

    if (otp.length !== 6) {
      showError('Please enter the complete 6-digit code.');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="premium-spinner"></div>';

    try {
      const result = await api.verifyOTP(registeredUserId, otp, 'email-verification');

      if (result.success) {
        // Store user info for next steps
        localStorage.setItem('pendingUserId', registeredUserId);
        localStorage.setItem('pendingEmail', registeredEmail);
        
        // Show success animation
        document.getElementById('otpSection').style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
        
        // Redirect after delay
        setTimeout(() => {
          window.location.href = 'set-password.html?userId=' + registeredUserId + '&email=' + registeredEmail;
        }, 2000);
      } else {
        showError(result.message || 'Invalid verification code. Please try again.');
        clearOTPBoxes();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verify Email';
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('OTP verification error:', error);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verify Email';
    }
  }

  function startTimer() {
    let timeLeft = 600; // 10 minutes in seconds
    const timerElement = document.getElementById('timer');
    const resendLink = document.getElementById('resendOtp');
    
    if (!timerElement || !resendLink) return;
    
    resendLink.disabled = true;
    resendLink.style.color = 'var(--text-muted)';
    
    const timer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        resendLink.disabled = false;
        resendLink.style.color = '#667eea';
        timerElement.textContent = '0:00';
      }
      
      timeLeft--;
    }, 1000);
  }

  // Handle resend OTP
  const resendOtpLink = document.getElementById('resendOtp');
  if (resendOtpLink) {
    resendOtpLink.addEventListener('click', async function(e) {
      e.preventDefault();
      
      try {
        const result = await api.resendOTP(registeredUserId);
        if (result.success) {
          showSuccess('New verification code sent to your email.');
        } else {
          showError(result.message || 'Failed to resend code. Please try again.');
        }
      } catch (error) {
        showError('An error occurred. Please try again.');
        console.error('Resend OTP error:', error);
      }
    });
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showError(message) {
    const existingError = form.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = message;
    errorDiv.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 1rem; text-align: center;';
    form.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  function showSuccess(message) {
    const existingSuccess = form.querySelector('.success-message');
    if (existingSuccess) {
      existingSuccess.remove();
    }

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = 'color: #10b981; font-size: 0.875rem; margin-top: 1rem; text-align: center;';
    form.appendChild(successDiv);

    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }
});
