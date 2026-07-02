// Candidate Profile Handler
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (!protectCandidateRoute()) return;

  // Load user data
  loadUserData();

  // Handle profile update form
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }

  // Handle avatar upload
  const avatarUpload = document.querySelector('.profile-avatar-upload');
  if (avatarUpload) {
    avatarUpload.addEventListener('click', handleAvatarUpload);
  }
});

async function loadUserData() {
  try {
    const result = await api.getMe();
    
    if (result.success && result.user) {
      updateProfileUI(result.user);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    showError('Failed to load profile data');
  }
}

function updateProfileUI(user) {
  // Update avatar
  const avatar = document.querySelector('.profile-avatar');
  if (avatar) {
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JD';
    avatar.textContent = initials;
  }

  // Update name
  const nameEl = document.querySelector('.profile-info h1');
  if (nameEl) {
    nameEl.textContent = user.name || 'Candidate';
  }

  // Update email
  const emailEl = document.querySelector('.profile-info .email');
  if (emailEl) {
    emailEl.textContent = user.email || '';
  }

  // Update phone
  const phoneEl = document.querySelector('.profile-info .phone');
  if (phoneEl) {
    phoneEl.textContent = user.phone || 'Not provided';
  }

  // Update bio
  const bioEl = document.querySelector('.profile-info .bio');
  if (bioEl) {
    bioEl.textContent = user.bio || 'No bio provided';
  }

  // Update location
  const locationEl = document.querySelector('.profile-info .location');
  if (locationEl) {
    locationEl.textContent = user.location || 'Not provided';
  }

  // Update skills
  const skillsEl = document.querySelector('.skills-container');
  if (skillsEl && user.skills) {
    skillsEl.innerHTML = user.skills.map(skill => `
      <span class="skill-tag">${skill}</span>
    `).join('');
  }

  // Populate form fields
  const nameInput = document.getElementById('name');
  if (nameInput) nameInput.value = user.name || '';

  const emailInput = document.getElementById('email');
  if (emailInput) emailInput.value = user.email || '';

  const phoneInput = document.getElementById('phone');
  if (phoneInput) phoneInput.value = user.phone || '';

  const bioInput = document.getElementById('bio');
  if (bioInput) bioInput.value = user.bio || '';

  const locationInput = document.getElementById('location');
  if (locationInput) locationInput.value = user.location || '';
}

async function handleProfileUpdate(e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    bio: document.getElementById('bio').value.trim(),
    location: document.getElementById('location').value.trim()
  };

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const result = await api.updateProfile(formData);

    if (result.success) {
      showSuccess('Profile updated successfully');
      loadUserData(); // Reload to show updated data
    } else {
      showError(result.message || 'Failed to update profile');
    }
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Profile update error:', error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function handleAvatarUpload() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await api.upload('/auth/profile/avatar', file, 'avatar');
      
      if (result.success) {
        showSuccess('Avatar uploaded successfully');
        loadUserData();
      } else {
        showError(result.message || 'Failed to upload avatar');
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
      console.error('Avatar upload error:', error);
    }
  });

  input.click();
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  successDiv.style.cssText = 'color: #10b981; padding: 1rem; margin: 1rem 0; background: #d1fae5; border-radius: 8px;';
  
  const profileMain = document.querySelector('.profile-main');
  if (profileMain) {
    profileMain.insertBefore(successDiv, profileMain.firstChild);
    
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = 'color: #ef4444; padding: 1rem; margin: 1rem 0; background: #fee2e2; border-radius: 8px;';
  
  const profileMain = document.querySelector('.profile-main');
  if (profileMain) {
    profileMain.insertBefore(errorDiv, profileMain.firstChild);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}
