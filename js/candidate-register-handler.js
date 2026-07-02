// Candidate Registration Handler
document.addEventListener('DOMContentLoaded', function() {
  if (window.checkAuthAndRedirect) {
    checkAuthAndRedirect();
  }
  const form = document.getElementById('regForm');
  if (!form) return;

  let registeredUserId = null;
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

    if (window.validateCandidateForm && !window.validateCandidateForm()) {
      return;
    }

    // Collect form data
    const formData = {
      name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      password: document.getElementById('password').value,
      role: 'candidate'
    };

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
      const result = await api.register(formData);

      if (result.success) {
        if (result.requiresVerification) {
          // Switch to OTP verification mode
          registeredUserId = result.userId;
          isOTPMode = true;
          
          // Hide form fields, show OTP section
          document.getElementById('formGrid').style.display = 'none';
          document.getElementById('otpSection').style.display = 'block';
          submitBtn.textContent = 'Verify Email';
          submitBtn.disabled = false;
          
          // Show success message
          showSuccess('Account created! Please check your email for the verification code.');
        } else {
          // Old flow (without OTP)
          await completeRegistration();
        }
      } else {
        if (result.requiresPassword) {
          showError(result.message + ' <a href="login.html" style="color: #8b5cf6;">Use Google login</a>');
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

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    try {
      const result = await api.verifyOTP(registeredUserId, otp);

      if (result.success) {
        await completeRegistration();
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

  async function completeRegistration() {
    // Upload resume if selected
    const resumeInput = document.getElementById('resume');
    const resumeFile = resumeInput && resumeInput.files && resumeInput.files[0];
    if (resumeFile) {
      try {
        await api.uploadResume(resumeFile);
      } catch (uploadErr) {
        console.error('Error uploading resume during registration:', uploadErr);
      }
    }

    // Update profile details
    try {
      await api.updateProfile({
        location: document.getElementById('location').value.trim(),
        skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
        bio: `Highest Qualification: ${document.getElementById('qualification').value} from ${document.getElementById('college').value.trim()}.\nPreferred Role: ${document.getElementById('role').value.trim()}.\nExperience: ${document.getElementById('experience').value}.`
      });
    } catch (profileErr) {
      console.error('Error updating profile during registration:', profileErr);
    }

    // Show success message
    var grid = document.getElementById('formGrid'),
        otpSection = document.getElementById('otpSection'),
        actions = form.querySelector('.form-actions'),
        foot = form.querySelector('.form-foot');
    if (grid) grid.style.display = 'none';
    if (otpSection) otpSection.style.display = 'none';
    if (actions) actions.style.display = 'none';
    if (foot) foot.style.display = 'none';

    const successDiv = document.getElementById('formSuccess');
    if (successDiv) {
      successDiv.classList.add('show');
      successDiv.style.display = 'block';
      successDiv.scrollIntoView({behavior: 'auto', block: 'center'});
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

  function showError(message) {
    // Remove existing error
    const existingError = form.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = message;
    errorDiv.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 1rem; text-align: center;';
    form.appendChild(errorDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  function showSuccess(message) {
    // Remove existing success
    const existingSuccess = form.querySelector('.success-message');
    if (existingSuccess) {
      existingSuccess.remove();
    }

    // Add success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = 'color: #10b981; font-size: 0.875rem; margin-top: 1rem; text-align: center;';
    form.appendChild(successDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }
});
