// Candidate Registration Handler
document.addEventListener('DOMContentLoaded', function() {
  if (window.checkAuthAndRedirect) {
    checkAuthAndRedirect();
  }
  const form = document.getElementById('regForm');
  if (!form) return;

  let registeredUserId = null;
  let registeredEmail = null;
  let isOTPMode = false;

  // Handle Google signup
  const googleSignupBtn = document.getElementById('googleSignupBtn');
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', function() {
      window.location.href = 'http://localhost:5000/api/auth/google/signup';
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
    submitBtn.textContent = 'Sending verification code...';

    try {
      // Register with name and email (password will be set later)
      const formData = {
        name: `${firstName} ${lastName}`,
        email: email,
        password: 'temp_password_' + Date.now(), // Temporary password
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
          submitBtn.textContent = 'Verify Email';
          submitBtn.disabled = false;
          
          // Show success message
          showSuccess('Account created! Please check your email for the verification code.');
        } else {
          // Old flow (without OTP) - redirect to set password
          localStorage.setItem('pendingUserId', result.user.id);
          localStorage.setItem('pendingEmail', email);
          window.location.href = 'set-password.html?userId=' + result.user.id + '&email=' + email;
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
    const otpInput = document.getElementById('otp');
    const otp = otpInput.value.trim();

    if (!otp || otp.length !== 6) {
      showError('Please enter the 6-digit verification code.');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    try {
      const result = await api.verifyOTP(registeredUserId, otp, 'email-verification');

      if (result.success) {
        // Store user info for next steps
        localStorage.setItem('pendingUserId', registeredUserId);
        localStorage.setItem('pendingEmail', registeredEmail);
        
        // Redirect to set password page
        window.location.href = 'set-password.html?userId=' + registeredUserId + '&email=' + registeredEmail;
      } else {
        showError(result.message || 'Invalid verification code. Please try again.');
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
