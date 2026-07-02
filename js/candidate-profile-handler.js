// Candidate Profile Handler
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (!protectCandidateRoute()) return;

  // Load user data
  loadUserData();

  // Prevent global form submission to allow modular saving
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
    });
  }

  // Handle avatar upload
  const avatarUpload = document.querySelector('.profile-avatar-upload');
  if (avatarUpload) {
    avatarUpload.addEventListener('click', handleAvatarUpload);
  }

  // Bind change listeners to profile fields
  const saveProfileInfoBtn = document.getElementById('saveProfileInfoBtn');
  const profileFields = ['name', 'phone', 'location', 'bio'];
  profileFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function() {
        if (saveProfileInfoBtn) saveProfileInfoBtn.style.display = 'block';
      });
    }
  });

  // Handle save profile info button
  if (saveProfileInfoBtn) {
    saveProfileInfoBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        bio: document.getElementById('bio').value.trim(),
        location: document.getElementById('location').value.trim()
      };
      
      saveProfileInfoBtn.disabled = true;
      saveProfileInfoBtn.textContent = 'Saving...';
      try {
        const result = await api.updateProfile(formData);
        if (result.success) {
          showSuccess('Profile details saved successfully');
          saveProfileInfoBtn.style.display = 'none';
          loadUserData();
        } else {
          showError(result.message || 'Failed to save profile details');
        }
      } catch (err) {
        showError('An error occurred. Please try again.');
        console.error(err);
      } finally {
        saveProfileInfoBtn.disabled = false;
        saveProfileInfoBtn.textContent = 'Save Profile Info';
      }
    });
  }

  // Handle Edit Education toggling
  const editEduBtn = document.getElementById('editEducationBtn');
  if (editEduBtn) {
    editEduBtn.addEventListener('click', function(e) {
      e.preventDefault();
      isEditingEducation = !isEditingEducation;
      renderEducationList(currentEducationList);
    });
  }

  // Handle add education button
  const addEduBtn = document.getElementById('addEducationBtn');
  const saveEducationBtn = document.getElementById('saveEducationBtn');
  if (addEduBtn) {
    addEduBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const list = gatherEducationFromUI();
      list.push({ degree: '', field: '', institution: '', startDate: '', endDate: '' });
      renderEducationList(list);
    });
  }

  // Handle save education button
  if (saveEducationBtn) {
    saveEducationBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      const education = gatherEducationFromUI();
      
      saveEducationBtn.disabled = true;
      saveEducationBtn.textContent = 'Saving...';
      try {
        const result = await api.updateProfile({ education });
        if (result.success) {
          showSuccess('Education details saved successfully');
          isEditingEducation = false; // Return to read-only descriptive state
          saveEducationBtn.style.display = 'none';
          loadUserData();
        } else {
          showError(result.message || 'Failed to save education details');
        }
      } catch (err) {
        showError('An error occurred. Please try again.');
        console.error(err);
      } finally {
        saveEducationBtn.disabled = false;
        saveEducationBtn.textContent = 'Save Education';
      }
    });
  }

  // Handle Edit Experience toggling
  const editExpBtn = document.getElementById('editExperienceBtn');
  if (editExpBtn) {
    editExpBtn.addEventListener('click', function(e) {
      e.preventDefault();
      isEditingExperience = !isEditingExperience;
      renderExperienceList(currentExperienceList);
    });
  }

  // Handle add experience button
  const addExpBtn = document.getElementById('addExperienceBtn');
  const saveExperienceBtn = document.getElementById('saveExperienceBtn');
  if (addExpBtn) {
    addExpBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const list = gatherExperienceFromUI();
      list.push({ title: '', company: '', startDate: '', endDate: '', current: false, description: '' });
      renderExperienceList(list);
    });
  }

  // Handle save experience button
  if (saveExperienceBtn) {
    saveExperienceBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      const experience = gatherExperienceFromUI();
      
      saveExperienceBtn.disabled = true;
      saveExperienceBtn.textContent = 'Saving...';
      try {
        const result = await api.updateProfile({ experience });
        if (result.success) {
          showSuccess('Experience details saved successfully');
          isEditingExperience = false; // Return to read-only descriptive state
          saveExperienceBtn.style.display = 'none';
          loadUserData();
        } else {
          showError(result.message || 'Failed to save experience details');
        }
      } catch (err) {
        showError('An error occurred. Please try again.');
        console.error(err);
      } finally {
        saveExperienceBtn.disabled = false;
        saveExperienceBtn.textContent = 'Save Experience';
      }
    });
  }

  // Handle Edit Additional toggling
  const editAdditionalBtn = document.getElementById('editAdditionalBtn');
  if (editAdditionalBtn) {
    editAdditionalBtn.addEventListener('click', function(e) {
      e.preventDefault();
      isEditingAdditional = !isEditingAdditional;
      renderAdditionalDetailsList();
    });
  }

  // Handle save additional details button
  const saveAdditionalBtn = document.getElementById('saveAdditionalBtn');
  if (saveAdditionalBtn) {
    saveAdditionalBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      
      const payload = {
        skills: currentSkills,
        softSkills: currentSoftSkills,
        projects: gatherProjectsFromUI(),
        certifications: gatherCertsFromUI(),
        languages: gatherLanguagesFromUI()
      };
      
      saveAdditionalBtn.disabled = true;
      saveAdditionalBtn.textContent = 'Saving...';
      try {
        const result = await api.updateProfile(payload);
        if (result.success) {
          showSuccess('Additional details saved successfully');
          isEditingAdditional = false; // Return to read-only descriptive state
          saveAdditionalBtn.style.display = 'none';
          loadUserData();
        } else {
          showError(result.message || 'Failed to save additional details');
        }
      } catch (err) {
        showError('An error occurred. Please try again.');
        console.error(err);
      } finally {
        saveAdditionalBtn.disabled = false;
        saveAdditionalBtn.textContent = 'Save Additional Details';
      }
    });
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
    const uploadBtn = avatar.querySelector('.profile-avatar-upload');
    avatar.textContent = initials;
    if (uploadBtn) {
      avatar.appendChild(uploadBtn);
    }
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

  // Update professional title (preferred role)
  const titleEl = document.querySelector('.profile-info .title');
  if (titleEl) {
    if (user.bio) {
      const roleMatch = user.bio.match(/Preferred Role:\s*([^.\n]+)/);
      if (roleMatch) {
        titleEl.textContent = roleMatch[1].trim();
      } else {
        titleEl.textContent = user.bio.substring(0, 50) + (user.bio.length > 50 ? '...' : '');
      }
    } else {
      titleEl.textContent = 'Candidate';
    }
  }

  // Update location
  const locationEl = document.querySelector('.profile-info .location');
  if (locationEl) {
    const svgIcon = locationEl.querySelector('svg');
    locationEl.textContent = ' ' + (user.location || 'Not provided');
    if (svgIcon) {
      locationEl.insertBefore(svgIcon, locationEl.firstChild);
    }
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

  // Render dynamic education and experience
  renderEducationList(user.education || []);
  renderExperienceList(user.experience || []);

  // Initialize and render additional details
  currentSkills = user.skills || [];
  currentSoftSkills = user.softSkills || [];
  currentProjects = user.projects || [];
  currentCertifications = user.certifications || [];
  currentLanguages = user.languages || [];
  renderAdditionalDetailsList();
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

// ---------- DUAL STATE TIMELINES (READ-ONLY VS EDIT) ----------
let isEditingEducation = false;
let isEditingExperience = false;
let currentEducationList = [];
let currentExperienceList = [];

const degreeFieldMapping = {
  'SSC (10th)': ['General'],
  'Intermediate (12th)': [
    'MPC (Maths, Physics, Chemistry)',
    'BiPC (Biology, Physics, Chemistry)',
    'CEC (Civics, Economics, Commerce)',
    'HEC (History, Economics, Civics)',
    'Science Stream',
    'Commerce Stream',
    'Arts Stream'
  ],
  'Higher': [
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Machine Learning',
    'Data Science',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration (Finance/Marketing/HR)',
    'Computer Applications (BCA/MCA)',
    'Finance & Accounts',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Arts & Literature'
  ]
};

function getYearOptionsHTML(selectedYear = '') {
  const currentYear = new Date().getFullYear();
  let html = `<option value="">Select Year</option>`;
  for (let y = currentYear + 5; y >= 1980; y--) {
    const selected = y.toString() === selectedYear.toString() ? 'selected' : '';
    html += `<option value="${y}" ${selected}>${y}</option>`;
  }
  return html;
}

function populateFieldDropdown(degreeVal, fieldSelect, selectedFieldVal = '') {
  let fields = [];
  if (degreeVal === 'SSC (10th)') {
    fields = degreeFieldMapping['SSC (10th)'];
  } else if (degreeVal === 'Intermediate (12th)') {
    fields = degreeFieldMapping['Intermediate (12th)'];
  } else if (degreeVal && degreeVal !== 'Other') {
    fields = degreeFieldMapping['Higher'];
  } else {
    fields = degreeFieldMapping['Higher'];
  }

  let optionsHTML = `<option value="">Select Field of Study</option>`;
  fields.forEach(f => {
    const selected = f === selectedFieldVal ? 'selected' : '';
    optionsHTML += `<option value="${f}" ${selected}>${f}</option>`;
  });
  
  const otherSelected = (selectedFieldVal && !fields.includes(selectedFieldVal)) ? 'selected' : '';
  optionsHTML += `<option value="Other" ${otherSelected}>Other...</option>`;
  
  fieldSelect.innerHTML = optionsHTML;
}

// --- EDUCATION TIMELINE ---
function renderEducationList(educationList) {
  if (educationList !== undefined) {
    currentEducationList = educationList || [];
  }
  
  const container = document.getElementById('educationContainer');
  const addEduBtn = document.getElementById('addEducationBtn');
  const saveEducationBtn = document.getElementById('saveEducationBtn');
  const editEducationBtn = document.getElementById('editEducationBtn');
  if (!container) return;

  // Empty state handling
  if (currentEducationList.length === 0 && !isEditingEducation) {
    container.innerHTML = `<p style="color: var(--muted); font-size: 0.9rem; padding: 10px 0;">No education history added yet. Click "Edit" to add one.</p>`;
    if (addEduBtn) addEduBtn.style.display = 'none';
    if (saveEducationBtn) saveEducationBtn.style.display = 'none';
    if (editEducationBtn) {
      editEducationBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 4px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit`;
    }
    return;
  }

  if (!isEditingEducation) {
    // Read-only Mode
    container.innerHTML = currentEducationList.map((edu, index) => createEducationCardReadOnlyHTML(edu, index)).join('');
    if (addEduBtn) addEduBtn.style.display = 'none';
    if (saveEducationBtn) saveEducationBtn.style.display = 'none';
    if (editEducationBtn) {
      editEducationBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 4px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit`;
    }
  } else {
    // Editable Mode
    container.innerHTML = currentEducationList.map((edu, index) => createEducationCardHTML(edu, index)).join('');
    if (addEduBtn) addEduBtn.style.display = 'block';
    if (saveEducationBtn) saveEducationBtn.style.display = 'block';
    if (editEducationBtn) {
      editEducationBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 4px;"><path d="M18 6L6 18M6 6l12 12"/></svg> Cancel`;
    }

    // Bind listeners
    container.querySelectorAll('.education-item-simple').forEach((card, index) => {
      const edu = currentEducationList[index] || {};
      const degreeSelect = card.querySelector('.edu-degree');
      const fieldSelect = card.querySelector('.edu-field');
      const degreeCustom = card.querySelector('.edu-degree-custom');
      const fieldCustom = card.querySelector('.edu-field-custom');
      const instInput = card.querySelector('.edu-institution');

      const degreeVal = degreeSelect.value;
      const initialField = edu.field || '';
      populateFieldDropdown(degreeVal, fieldSelect, initialField);

      if (instInput) {
        if (degreeVal === 'SSC (10th)') {
          instInput.setAttribute('list', 'schoolsList');
        } else if (degreeVal === 'Intermediate (12th)') {
          instInput.setAttribute('list', 'juniorCollegesList');
        } else {
          instInput.setAttribute('list', 'universitiesList');
        }
      }

      const currentFieldsList = degreeVal === 'SSC (10th)' ? degreeFieldMapping['SSC (10th)'] 
                               : degreeVal === 'Intermediate (12th)' ? degreeFieldMapping['Intermediate (12th)'] 
                               : degreeFieldMapping['Higher'];
      const isFieldCustom = initialField && !currentFieldsList.includes(initialField);
      if (isFieldCustom) {
        fieldCustom.value = initialField;
        fieldCustom.style.display = 'block';
      }

      degreeSelect.addEventListener('change', function() {
        const val = this.value;
        if (val === 'Other') {
          degreeCustom.style.display = 'block';
          degreeCustom.value = '';
        } else {
          degreeCustom.style.display = 'none';
        }

        if (instInput) {
          if (val === 'SSC (10th)') {
            instInput.setAttribute('list', 'schoolsList');
          } else if (val === 'Intermediate (12th)') {
            instInput.setAttribute('list', 'juniorCollegesList');
          } else {
            instInput.setAttribute('list', 'universitiesList');
          }
        }

        populateFieldDropdown(val, fieldSelect, '');
        fieldCustom.style.display = 'none';
        fieldCustom.value = '';
      });

      fieldSelect.addEventListener('change', function() {
        if (this.value === 'Other') {
          fieldCustom.style.display = 'block';
          fieldCustom.value = '';
        } else {
          fieldCustom.style.display = 'none';
        }
      });
    });
  }
}

function createEducationCardReadOnlyHTML(edu, index) {
  const getYearFromDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.getFullYear().toString();
  };

  const degree = edu.degree || '';
  const institution = edu.institution || '';
  const field = edu.field || '';
  const startYear = getYearFromDate(edu.startDate);
  const endYear = getYearFromDate(edu.endDate);

  const yearRange = startYear || endYear 
    ? `${startYear || 'N/A'} - ${endYear || 'Present'}`
    : '';

  return `
    <div class="education-item-simple" style="padding: 12px 0; border-bottom: 1px solid var(--glass-border);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
        <div style="flex: 1;">
          <div style="font-size: 0.95rem; color: var(--text); font-weight: 600; margin-bottom: 4px;">
            ${degree} ${field && field !== 'General' ? `in ${field}` : ''}
          </div>
          <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 4px;">
            ${institution}
          </div>
          ${yearRange ? `<div style="font-size: 0.8rem; color: var(--purple); font-weight: 500;">${yearRange}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function createEducationCardHTML(edu, index) {
  const degree = edu.degree || '';
  const institution = edu.institution || '';

  const getYearFromDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.getFullYear().toString();
  };

  const startYear = getYearFromDate(edu.startDate);
  const endYear = getYearFromDate(edu.endDate);

  const stdDegrees = ['SSC (10th)', 'Intermediate (12th)', 'B.Tech', 'B.Sc', 'B.Com', 'B.A.', 'BBA', 'M.Tech', 'MBA', 'MS', 'M.Sc', 'Ph.D'];
  const isDegreeCustom = degree && !stdDegrees.includes(degree);
  const degreeSelectValue = isDegreeCustom ? 'Other' : degree;

  const startYearOptions = getYearOptionsHTML(startYear);
  const endYearOptions = getYearOptionsHTML(endYear);

  const currentDatalistId = degreeSelectValue === 'SSC (10th)' ? 'schoolsList'
                          : degreeSelectValue === 'Intermediate (12th)' ? 'juniorCollegesList'
                          : 'universitiesList';

  return `
    <div class="education-item-simple" data-index="${index}" style="padding: 16px 0; border-bottom: 1px solid var(--glass-border);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="display: block; font-size: 0.75rem; color: var(--muted); margin-bottom: 4px; font-weight: 500;">Degree</label>
              <select class="edu-degree" style="width: 100%; background: rgba(15,23,42,.6); border: 1px solid var(--glass-border); color: var(--text); padding: 8px 12px; border-radius: 8px; font-size: 0.85rem;" required>
                <option value="">Select Degree</option>
                <option value="SSC (10th)" ${degreeSelectValue === 'SSC (10th)' ? 'selected' : ''}>10th Class (SSC / CBSE / ICSE)</option>
                <option value="Intermediate (12th)" ${degreeSelectValue === 'Intermediate (12th)' ? 'selected' : ''}>12th Class / Intermediate (HSC / CBSE)</option>
                <option value="B.Tech" ${degreeSelectValue === 'B.Tech' ? 'selected' : ''}>B.Tech / B.E.</option>
                <option value="B.Sc" ${degreeSelectValue === 'B.Sc' ? 'selected' : ''}>B.Sc.</option>
                <option value="B.Com" ${degreeSelectValue === 'B.Com' ? 'selected' : ''}>B.Com.</option>
                <option value="B.A." ${degreeSelectValue === 'B.A.' ? 'selected' : ''}>B.A.</option>
                <option value="BBA" ${degreeSelectValue === 'BBA' ? 'selected' : ''}>BBA</option>
                <option value="M.Tech" ${degreeSelectValue === 'M.Tech' ? 'selected' : ''}>M.Tech / M.E.</option>
                <option value="MBA" ${degreeSelectValue === 'MBA' ? 'selected' : ''}>MBA</option>
                <option value="MS" ${degreeSelectValue === 'MS' ? 'selected' : ''}>MS</option>
                <option value="M.Sc" ${degreeSelectValue === 'M.Sc' ? 'selected' : ''}>M.Sc.</option>
                <option value="Ph.D" ${degreeSelectValue === 'Ph.D' ? 'selected' : ''}>Ph.D.</option>
                <option value="Other" ${degreeSelectValue === 'Other' ? 'selected' : ''}>Other...</option>
              </select>
              <input type="text" class="edu-degree-custom" style="display: ${degreeSelectValue === 'Other' ? 'block' : 'none'}; width: 100%; margin-top: 4px; background: rgba(15,23,42,.6); border: 1px solid var(--glass-border); color: var(--text); padding: 8px 12px; border-radius: 8px; font-size: 0.85rem;" value="${isDegreeCustom ? degree : ''}" placeholder="Specify Degree" />
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; color: var(--muted); margin-bottom: 4px; font-weight: 500;">Field of Study</label>
              <select class="edu-field" style="width: 100%; background: rgba(15,23,42,.6); border: 1px solid var(--glass-border); color: var(--text); padding: 8px 12px; border-radius: 8px; font-size: 0.85rem;">
                <!-- Dynamic dropdown options loaded via JS -->
              </select>
              <input type="text" class="edu-field-custom" style="display: none; width: 100%; margin-top: 4px; background: rgba(15,23,42,.6); border: 1px solid var(--glass-border); color: var(--text); padding: 8px 12px; border-radius: 8px; font-size: 0.85rem;" value="" placeholder="Specify Field of Study" />
            </div>
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; color: var(--muted); margin-bottom: 4px; font-weight: 500;">Institution</label>
            <input type="text" class="edu-institution" value="${institution}" list="${currentDatalistId}" placeholder="e.g. Stanford University" style="width: 100%; background: rgba(15,23,42,.6); border: 1px solid var(--glass-border); color: var(--text); padding: 8px 12px; border-radius: 8px; font-size: 0.85rem;" required />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="display: block; font-size: 0.75rem; color: var(--muted); margin-bottom: 4px; font-weight: 500;">Start Year</label>
              <select class="edu-start-year" style="width: 100%; background: rgba(15,23,42,.6); border: 1px solid var(--glass-border); color: var(--text); padding: 8px 12px; border-radius: 8px; font-size: 0.85rem;">
                ${startYearOptions}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.75rem; color: var(--muted); margin-bottom: 4px; font-weight: 500;">End Year</label>
              <select class="edu-end-year" style="width: 100%; background: rgba(15,23,42,.6); border: 1px solid var(--glass-border); color: var(--text); padding: 8px 12px; border-radius: 8px; font-size: 0.85rem;">
                ${endYearOptions}
              </select>
            </div>
          </div>
        </div>
        <button class="remove-btn" type="button" onclick="removeEducationItem(${index})" title="Remove Education" style="width: 28px; height: 28px; border-radius: 6px; display: grid; place-items: center; background: rgba(248,113,113,.12); color: #f87171; cursor: pointer; flex: none; border: none; transition: all .2s;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width: 14px; height: 14px;"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  `;
}

window.removeEducationItem = function(index) {
  if (confirm('Are you sure you want to remove this education history item?')) {
    const list = gatherEducationFromUI();
    list.splice(index, 1);
    renderEducationList(list);
  }
};

function gatherEducationFromUI() {
  const education = [];
  document.querySelectorAll('.education-card').forEach(card => {
    const degreeSelect = card.querySelector('.edu-degree');
    const degreeCustomInput = card.querySelector('.edu-degree-custom');
    const fieldSelect = card.querySelector('.edu-field');
    const fieldCustomInput = card.querySelector('.edu-field-custom');
    const institutionInput = card.querySelector('.edu-institution');
    const startYearSelect = card.querySelector('.edu-start-year');
    const endYearSelect = card.querySelector('.edu-end-year');

    if (!degreeSelect) return; // Ignore read-only elements

    let degree = degreeSelect.value;
    if (degree === 'Other' && degreeCustomInput) {
      degree = degreeCustomInput.value.trim();
    }

    let field = fieldSelect.value;
    if (field === 'Other' && fieldCustomInput) {
      field = fieldCustomInput.value.trim();
    }

    const institution = institutionInput ? institutionInput.value.trim() : '';
    const startYear = startYearSelect ? startYearSelect.value : '';
    const endYear = endYearSelect ? endYearSelect.value : '';

    if (degree || institution) {
      education.push({
        degree,
        field,
        institution,
        startDate: startYear ? new Date(`${startYear}-06-01`) : null,
        endDate: endYear ? new Date(`${endYear}-06-01`) : null
      });
    }
  });
  return education;
}

// --- EXPERIENCE TIMELINE ---
function renderExperienceList(experienceList) {
  if (experienceList !== undefined) {
    currentExperienceList = experienceList || [];
  }

  const container = document.getElementById('experienceContainer');
  const addExpBtn = document.getElementById('addExperienceBtn');
  const saveExperienceBtn = document.getElementById('saveExperienceBtn');
  const editExperienceBtn = document.getElementById('editExperienceBtn');
  if (!container) return;

  // Empty state handling
  if (currentExperienceList.length === 0 && !isEditingExperience) {
    container.innerHTML = `<p style="color: var(--muted); font-size: 0.9rem; padding: 10px 0;">No experience history added yet. Click "Edit" to add one.</p>`;
    if (addExpBtn) addExpBtn.style.display = 'none';
    if (saveExperienceBtn) saveExperienceBtn.style.display = 'none';
    if (editExperienceBtn) {
      editExperienceBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 4px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit`;
    }
    return;
  }

  if (!isEditingExperience) {
    // Read-only Mode
    container.innerHTML = currentExperienceList.map((exp, index) => createExperienceCardReadOnlyHTML(exp, index)).join('');
    if (addExpBtn) addExpBtn.style.display = 'none';
    if (saveExperienceBtn) saveExperienceBtn.style.display = 'none';
    if (editExperienceBtn) {
      editExperienceBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 4px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit`;
    }
  } else {
    // Editable Mode
    container.innerHTML = currentExperienceList.map((exp, index) => createExperienceCardHTML(exp, index)).join('');
    if (addExpBtn) addExpBtn.style.display = 'block';
    if (saveExperienceBtn) saveExperienceBtn.style.display = 'block';
    if (editExperienceBtn) {
      editExperienceBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; margin-right: 4px;"><path d="M18 6L6 18M6 6l12 12"/></svg> Cancel`;
    }

    // Bind listeners
    container.querySelectorAll('.experience-card').forEach(card => {
      const titleInput = card.querySelector('.exp-title');
      const badge = card.querySelector('.experience-badge');
      if (titleInput && badge) {
        titleInput.addEventListener('input', function() {
          const val = this.value.trim();
          let initials = 'EXP';
          if (val) {
            const parts = val.split(' ');
            if (parts.length >= 2) {
              initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            } else if (parts.length === 1) {
              initials = parts[0].substring(0, 2).toUpperCase();
            }
          }
          badge.textContent = initials;
        });
      }
    });
  }
}

function createExperienceCardReadOnlyHTML(exp, index) {
  const getYearFromDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.getFullYear().toString();
  };

  const title = exp.title || '';
  const company = exp.company || '';
  const startYear = getYearFromDate(exp.startDate);
  const endYear = getYearFromDate(exp.endDate);
  const description = exp.description || '';

  const yearRange = startYear || endYear 
    ? `${startYear || 'N/A'} - ${endYear || 'Present'}`
    : '';

  let badgeText = 'EXP';
  if (title) {
    const parts = title.split(' ');
    if (parts.length >= 2) {
      badgeText = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1) {
      badgeText = title.substring(0, 2).toUpperCase();
    }
  }

  return `
    <div class="experience-card read-only" style="padding: 16px 20px;">
      <div class="experience-badge">${badgeText}</div>
      <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px;">
        <h4 style="margin: 0; font-size: 1.05rem; color: var(--text); font-weight: 600;">
          ${title}
        </h4>
        <div style="color: var(--muted); font-size: 0.88rem; font-weight: 500;">
          ${company}
        </div>
        ${yearRange ? `<div style="font-size: 0.82rem; color: var(--purple); font-weight: 600; text-transform: uppercase; margin-top: 4px;">${yearRange}</div>` : ''}
        ${description ? `<p style="margin: 8px 0 0; font-size: 0.85rem; color: var(--muted); line-height: 1.5; white-space: pre-line;">${description}</p>` : ''}
      </div>
    </div>
  `;
}

function createExperienceCardHTML(exp, index) {
  const getYearFromDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.getFullYear().toString();
  };

  const title = exp.title || '';
  const company = exp.company || '';
  const startYear = getYearFromDate(exp.startDate);
  const endYear = getYearFromDate(exp.endDate);
  const description = exp.description || '';

  const startYearOptions = getYearOptionsHTML(startYear);
  const endYearOptions = getYearOptionsHTML(endYear);

  let badgeText = 'EXP';
  if (title) {
    const parts = title.split(' ');
    if (parts.length >= 2) {
      badgeText = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1) {
      badgeText = title.substring(0, 2).toUpperCase();
    }
  }

  return `
    <div class="experience-card" data-index="${index}">
      <div class="experience-badge">${badgeText}</div>
      <div class="experience-content-grid">
        <div class="experience-field">
          <label>Job Title</label>
          <input type="text" class="exp-title" value="${title}" placeholder="e.g. Senior Software Engineer" required />
        </div>
        <div class="experience-field">
          <label>Company</label>
          <input type="text" class="exp-company" value="${company}" placeholder="e.g. Google" required />
        </div>
        <div class="experience-field">
          <label>Start Year</label>
          <select class="exp-start-year select-input">
            ${startYearOptions}
          </select>
        </div>
        <div class="experience-field">
          <label>End Year (leave blank if current)</label>
          <select class="exp-end-year select-input">
            ${endYearOptions}
          </select>
        </div>
        <div class="experience-field full-width">
          <label>Description & Achievements</label>
          <textarea class="exp-description" placeholder="Describe your responsibilities, key achievements, and technologies used...">${description}</textarea>
        </div>
      </div>
      <button class="remove-btn" type="button" onclick="removeExperienceItem(${index})" title="Remove Experience">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  `;
}

window.removeExperienceItem = function(index) {
  if (confirm('Are you sure you want to remove this experience item?')) {
    const list = gatherExperienceFromUI();
    list.splice(index, 1);
    renderExperienceList(list);
  }
};

function gatherExperienceFromUI() {
  const experience = [];
  document.querySelectorAll('.experience-card').forEach(card => {
    const titleInput = card.querySelector('.exp-title');
    const companyInput = card.querySelector('.exp-company');
    const startYearSelect = card.querySelector('.exp-start-year');
    const endYearSelect = card.querySelector('.exp-end-year');
    const descriptionInput = card.querySelector('.exp-description');

    if (!titleInput) return; // Ignore read-only elements

    const title = titleInput.value.trim();
    const company = companyInput ? companyInput.value.trim() : '';
    const startYear = startYearSelect ? startYearSelect.value : '';
    const endYear = endYearSelect ? endYearSelect.value : '';
    const description = descriptionInput ? descriptionInput.value.trim() : '';

    if (title || company) {
      experience.push({
        title,
        company,
        startDate: startYear ? new Date(`${startYear}-06-01`) : null,
        endDate: endYear ? new Date(`${endYear}-06-01`) : null,
        current: !endYear,
        description
      });
    }
  });
  return experience;
}


