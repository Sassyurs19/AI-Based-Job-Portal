// Forgot Password Handler
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('forgotPasswordForm');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const formSuccess = document.getElementById('formSuccess');

  let userEmail = '';

  // Step 1: Send OTP
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    
    if (!email || !isValidEmail(email)) {
      showError('Please enter a valid email address.');
      return;
    }

    const sendOtpBtn = document.getElementById('sendOtpBtn');
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = 'Sending...';

    try {
      const result = await api.forgotPassword(email);
      
      if (result.success) {
        userEmail = email;
        step1.style.display = 'none';
        step2.style.display = 'block';
        showSuccess('Verification code sent to your email.');
      } else {
        showError(result.message || 'Failed to send verification code.');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('Forgot password error:', error);
    } finally {
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = 'Send Verification Code';
    }
  });

  // Step 2: Verify OTP
  document.getElementById('verifyOtpBtn').addEventListener('click', async function() {
    const otp = document.getElementById('otp').value.trim();
    
    if (!otp || otp.length !== 6) {
      showError('Please enter the 6-digit verification code.');
      return;
    }

    const verifyOtpBtn = this;
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = 'Verifying...';

    try {
      const result = await api.verifyOtp(userEmail, otp, 'password-reset');
      
      if (result.success) {
        step2.style.display = 'none';
        step3.style.display = 'block';
        showSuccess('Code verified successfully.');
      } else {
        showError(result.message || 'Invalid verification code.');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.textContent = 'Verify Code';
    }
  });

  // Resend OTP
  document.getElementById('resendOtp').addEventListener('click', async function(e) {
    e.preventDefault();
    
    const resendLink = this;
    resendLink.style.opacity = '0.5';
    resendLink.style.pointerEvents = 'none';

    try {
      const result = await api.forgotPassword(userEmail);
      
      if (result.success) {
        showSuccess('New verification code sent to your email.');
      } else {
        showError(result.message || 'Failed to resend verification code.');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('Resend OTP error:', error);
    } finally {
      setTimeout(() => {
        resendLink.style.opacity = '1';
        resendLink.style.pointerEvents = 'auto';
      }, 30000); // 30 second cooldown
    }
  });

  // Step 3: Reset Password
  document.getElementById('resetPasswordBtn').addEventListener('click', async function() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!newPassword || newPassword.length < 8) {
      showError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    const resetPasswordBtn = this;
    resetPasswordBtn.disabled = true;
    resetPasswordBtn.textContent = 'Resetting...';

    try {
      const result = await api.resetPassword(userEmail, newPassword);
      
      if (result.success) {
        step3.style.display = 'none';
        form.querySelector('.form-actions').style.display = 'none';
        form.querySelector('.form-foot').style.display = 'none';
        formSuccess.classList.add('show');
        formSuccess.style.display = 'block';
      } else {
        showError(result.message || 'Failed to reset password.');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('Reset password error:', error);
    } finally {
      resetPasswordBtn.disabled = false;
      resetPasswordBtn.textContent = 'Reset Password';
    }
  });

  // Back to Step 1
  document.getElementById('backToStep1').addEventListener('click', function(e) {
    e.preventDefault();
    step2.style.display = 'none';
    step1.style.display = 'block';
    document.getElementById('otp').value = '';
  });

  // Back to Step 2
  document.getElementById('backToStep2').addEventListener('click', function(e) {
    e.preventDefault();
    step3.style.display = 'none';
    step2.style.display = 'block';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  });

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

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

  function showSuccess(message) {
    const existingSuccess = form.querySelector('.success-message');
    if (existingSuccess) existingSuccess.remove();

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = 'color: #10b981; font-size: 0.875rem; margin-top: 1rem; text-align: center;';
    form.appendChild(successDiv);

    setTimeout(() => successDiv.remove(), 3000);
  }
});
