// Candidate Details Handler
document.addEventListener('DOMContentLoaded', async function() {
  // Protect route - only recruiters can view candidate details
  if (window.protectRecruiterRoute && !protectRecruiterRoute()) return;

  const urlParams = new URLSearchParams(window.location.search);
  const candidateId = urlParams.get('id');
  const appId = urlParams.get('appId');

  if (!appId) {
    showError('Application ID is missing.');
    return;
  }

  // Load application and candidate details from API
  try {
    const result = await api.getApplicationById(appId);
    if (result.success && result.application) {
      populateCandidateDetails(result.application, result.analysis);
      setupActionButtons(result.application);
    } else {
      showError(result.message || 'Failed to load candidate details.');
    }
  } catch (error) {
    console.error('Error fetching candidate details:', error);
    showError('An error occurred while loading details.');
  }
});

function populateCandidateDetails(app, analysis) {
  const user = app.applicant;
  if (!user) return;

  // 1. Breadcrumb Name
  const breadcrumbName = document.querySelector('.breadcrumb span:last-child');
  if (breadcrumbName) breadcrumbName.textContent = user.name || 'Candidate';

  // 2. Profile Avatar (Initials)
  const profileAvatar = document.querySelector('.profile-avatar');
  if (profileAvatar) {
    profileAvatar.textContent = user.name ? user.name.substring(0, 2).toUpperCase() : 'CA';
  }

  // 3. Name, Role, Location
  const profileName = document.querySelector('.profile-info h1');
  if (profileName) profileName.textContent = user.name || 'Candidate';

  const profileRole = document.querySelector('.profile-info .role');
  if (profileRole) profileRole.textContent = user.bio ? user.bio.split('\n')[1]?.replace('Preferred Role:', '').trim() || 'Software Engineer' : 'Software Engineer';

  const profileLocation = document.querySelector('.profile-info .location');
  if (profileLocation) {
    profileLocation.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
      ${user.location || 'Remote'}
    `;
  }

  // 4. Contact Info
  const emailLink = document.querySelector('.profile-contact .contact-item:nth-child(1) a');
  if (emailLink) {
    emailLink.setAttribute('href', `mailto:${user.email}`);
    emailLink.textContent = user.email;
  }

  const phoneLink = document.querySelector('.profile-contact .contact-item:nth-child(2) a');
  if (phoneLink) {
    phoneLink.setAttribute('href', `tel:${user.phone || ''}`);
    phoneLink.textContent = user.phone || 'Not specified';
  }

  // 5. Section Cards (Experience, Education, Skills)
  const sections = document.querySelectorAll('.section-card');
  let experienceContainer = null;
  let educationContainer = null;
  let skillsContainer = null;

  sections.forEach(card => {
    const h2 = card.querySelector('h2');
    if (h2) {
      const text = h2.textContent.toLowerCase();
      if (text.includes('experience')) experienceContainer = card;
      else if (text.includes('education')) educationContainer = card;
      else if (text.includes('skills')) skillsContainer = card;
    }
  });

  const formatYear = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).getFullYear();
  };

  // Experience Card
  if (experienceContainer) {
    if (user.experience && user.experience.length > 0) {
      const expHTML = user.experience.map(exp => {
        const iconText = exp.company ? exp.company.substring(0, 2).toUpperCase() : 'CO';
        const period = `${formatYear(exp.startDate)} - ${exp.current ? 'Present' : formatYear(exp.endDate)}`;
        return `
          <div class="experience-item">
            <div class="experience-icon">${iconText}</div>
            <div class="experience-content">
              <h3>${exp.title || 'Engineer'}</h3>
              <div class="company">${exp.company || ''}</div>
              <div class="period">${period}</div>
              <p>${exp.description || ''}</p>
            </div>
          </div>
        `;
      }).join('');
      experienceContainer.innerHTML = '<h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Experience</h2>' + expHTML;
    } else {
      experienceContainer.innerHTML = '<h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Experience</h2><p class="empty-msg">No experience specified</p>';
    }
  }

  // Education Card
  if (educationContainer) {
    if (user.education && user.education.length > 0) {
      const eduHTML = user.education.map(edu => {
        const iconText = edu.degree ? edu.degree.substring(0, 2).toUpperCase() : 'ED';
        const period = `${formatYear(edu.startDate)} - ${formatYear(edu.endDate)}`;
        return `
          <div class="education-item">
            <div class="education-icon">${iconText}</div>
            <div class="education-content">
              <h3>${edu.degree || ''} in ${edu.field || ''}</h3>
              <div class="school">${edu.institution || ''}</div>
              <div class="period">${period}</div>
            </div>
          </div>
        `;
      }).join('');
      educationContainer.innerHTML = '<h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>Education</h2>' + eduHTML;
    } else {
      educationContainer.innerHTML = '<h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>Education</h2><p class="empty-msg">No education specified</p>';
    }
  }

  // Skills Card
  if (skillsContainer) {
    const techSkillsHTML = user.skills && user.skills.length > 0 ? `
      <div class="skill-category">
        <h3>Technical Skills</h3>
        <div class="skill-tags">
          ${user.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>
    ` : '';
    const softSkillsHTML = user.softSkills && user.softSkills.length > 0 ? `
      <div class="skill-category">
        <h3>Soft Skills</h3>
        <div class="skill-tags">
          ${user.softSkills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>
    ` : '';
    
    if (techSkillsHTML || softSkillsHTML) {
      skillsContainer.innerHTML = '<h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17-2 2"/></svg>Skills</h2>' + 
        `<div class="skills-grid">${techSkillsHTML}${softSkillsHTML}</div>`;
    } else {
      skillsContainer.innerHTML = '<h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17-2 2"/></svg>Skills</h2><p class="empty-msg">No skills specified</p>';
    }
  }

  // 6. AI Score and ATS Analysis
  const aiMatchScoreText = document.querySelector('.ai-score:nth-child(1) .ai-score-text');
  const atsScoreText = document.querySelector('.ai-score:nth-child(2) .ai-score-text');
  const aiMatchRing = document.querySelector('.ai-score:nth-child(1) .ai-score-ring-fill');
  const atsRing = document.querySelector('.ai-score:nth-child(2) .ai-score-ring-fill');

  const matchScore = Math.round(app.aiScore || (analysis ? analysis.overallScore : 75));
  const atsScore = analysis ? Math.round(analysis.atsScore) : Math.max(0, matchScore - 10);

  if (aiMatchScoreText) aiMatchScoreText.textContent = `${matchScore}%`;
  if (atsScoreText) atsScoreText.textContent = `${atsScore}%`;

  if (aiMatchRing) {
    const offset = 213.63 * (1 - matchScore / 100);
    aiMatchRing.style.strokeDashoffset = offset;
  }
  if (atsRing) {
    const offset = 213.63 * (1 - atsScore / 100);
    atsRing.style.strokeDashoffset = offset;
  }

  // 7. Skill Gap Analysis
  const matched = (analysis && analysis.sections.skills.matchedSkills) || [];
  const missing = (analysis && analysis.sections.skills.missingSkills) || [];
  let gapHTML = '';

  matched.forEach(skill => {
    gapHTML += `
      <div class="skill-gap-item">
        <span class="skill-gap-name">${skill}</span>
        <div class="skill-gap-bar"><div class="skill-gap-fill high" style="width:100%;"></div></div>
        <span class="skill-gap-value">Matched</span>
      </div>
    `;
  });

  missing.forEach(skill => {
    gapHTML += `
      <div class="skill-gap-item">
        <span class="skill-gap-name">${skill}</span>
        <div class="skill-gap-bar"><div class="skill-gap-fill low" style="width:20%;"></div></div>
        <span class="skill-gap-value">Missing</span>
      </div>
    `;
  });

  if (gapHTML) {
    const gapContainer = document.querySelector('.skill-gap-item')?.parentNode;
    if (gapContainer) gapContainer.innerHTML = gapHTML;
  }

  // 8. Strengths & Weaknesses (Areas for Improvement)
  const h3s = document.querySelectorAll('.ai-analysis-card h3');
  let strengthsContainer = null;
  let weaknessesContainer = null;

  h3s.forEach(h3 => {
    const text = h3.textContent.toLowerCase();
    if (text.includes('strengths')) strengthsContainer = h3.nextElementSibling;
    else if (text.includes('improvement') || text.includes('weakness')) weaknessesContainer = h3.nextElementSibling;
  });

  if (strengthsContainer) {
    const strengthsHTML = matched.slice(0, 3).map(skill => `
      <div class="analysis-item">
        <div class="analysis-item-icon green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3 8-8"/></svg>
        </div>
        <div class="analysis-item-content">
          <h4>Matched Skill: ${skill}</h4>
          <p>Candidate possesses strong competency in ${skill}.</p>
        </div>
      </div>
    `).join('');
    strengthsContainer.innerHTML = strengthsHTML || `
      <div class="analysis-item">
        <div class="analysis-item-icon green">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3 8-8"/></svg>
        </div>
        <div class="analysis-item-content">
          <h4>Complete Education & Experience</h4>
          <p>Resume matches basic criteria and profile details look consistent.</p>
        </div>
      </div>
    `;
  }

  if (weaknessesContainer) {
    const weaknessesHTML = missing.slice(0, 3).map(skill => `
      <div class="analysis-item">
        <div class="analysis-item-icon red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div class="analysis-item-content">
          <h4>Missing Skill: ${skill}</h4>
          <p>Consider evaluating candidate's familiarity with ${skill}.</p>
        </div>
      </div>
    `).join('');
    weaknessesContainer.innerHTML = weaknessesHTML || `
      <div class="analysis-item">
        <div class="analysis-item-icon red">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div class="analysis-item-content">
          <h4>No Gaps Identified</h4>
          <p>No critical missing keywords or skills discovered.</p>
        </div>
      </div>
    `;
  }

  // 9. Recommendations
  const recCards = document.querySelectorAll('.recommendation-card');
  if (recCards.length > 0) {
    const titleEl = recCards[0].querySelector('h3');
    const descEl = recCards[0].querySelector('p');
    
    let rating = 'Highly Recommended';
    if (matchScore < 50) rating = 'Not Recommended';
    else if (matchScore < 70) rating = 'Consider With Evaluation';
    
    if (titleEl) {
      titleEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> ${rating}`;
    }
    if (descEl) {
      descEl.textContent = analysis?.sections?.summary?.feedback || 'Candidate profile shows clear match parameters with the job requirements. Proceed to interview evaluation.';
    }
  }
}

function setupActionButtons(app) {
  const shortlistBtn = document.getElementById('shortlistBtn');
  const rejectBtn = document.getElementById('rejectBtn');
  const scheduleBtn = document.getElementById('scheduleBtn');
  const downloadResumeBtn = document.getElementById('downloadResume');

  // Handle current status rendering
  if (app.status === 'shortlisted') {
    setShortlistedUI(shortlistBtn);
  } else if (app.status === 'rejected') {
    setRejectedUI(rejectBtn);
  }

  // Shortlist action
  if (shortlistBtn) {
    shortlistBtn.addEventListener('click', async function() {
      if (app.status === 'shortlisted') return;
      try {
        const result = await api.updateApplicationStatus(app._id, 'shortlisted');
        if (result.success) {
          app.status = 'shortlisted';
          setShortlistedUI(shortlistBtn);
          resetButtonUI(rejectBtn);
          showSuccess('Candidate shortlisted successfully!');
        } else {
          showError(result.message || 'Failed to shortlist candidate.');
        }
      } catch (err) {
        console.error(err);
        showError('Error updating status.');
      }
    });
  }

  // Reject action
  if (rejectBtn) {
    rejectBtn.addEventListener('click', async function() {
      if (app.status === 'rejected') return;
      if (!confirm('Are you sure you want to reject this candidate?')) return;
      try {
        const result = await api.updateApplicationStatus(app._id, 'rejected');
        if (result.success) {
          app.status = 'rejected';
          setRejectedUI(rejectBtn);
          resetButtonUI(shortlistBtn);
          showSuccess('Candidate rejected successfully.');
        } else {
          showError(result.message || 'Failed to reject candidate.');
        }
      } catch (err) {
        console.error(err);
        showError('Error updating status.');
      }
    });
  }

  // Schedule interview action
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', function() {
      alert(`Interview scheduling modal for ${app.applicant?.name || 'Candidate'} will open here.`);
    });
  }

  // Download Resume action
  if (downloadResumeBtn) {
    downloadResumeBtn.addEventListener('click', function() {
      if (app.resume && app.resume !== 'No resume uploaded') {
        const backendUrl = window.getBackendUrl ? window.getBackendUrl() : 'http://localhost:5000';
        const resumeUrl = app.resume.startsWith('http') ? app.resume : `${backendUrl}/${app.resume}`;
        window.open(resumeUrl, '_blank');
      } else {
        alert('No resume uploaded by this candidate.');
      }
    });
  }
}

function setShortlistedUI(btn) {
  if (!btn) return;
  btn.textContent = '✓ Shortlisted';
  btn.style.background = 'rgba(34,197,94,.25)';
  btn.style.borderColor = 'rgba(34,197,94,.5)';
  btn.style.color = '#22c55e';
}

function setRejectedUI(btn) {
  if (!btn) return;
  btn.textContent = '✓ Rejected';
  btn.style.background = 'rgba(239,68,68,.25)';
  btn.style.borderColor = 'rgba(239,68,68,.5)';
  btn.style.color = '#ef4444';
}

function resetButtonUI(btn) {
  if (!btn) return;
  if (btn.id === 'shortlistBtn') {
    btn.textContent = 'Shortlist Candidate';
  } else if (btn.id === 'rejectBtn') {
    btn.textContent = 'Reject Candidate';
  }
  btn.style.background = '';
  btn.style.borderColor = '';
  btn.style.color = '';
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = 'color: #ef4444; padding: 1rem; margin: 1rem 0; background: #fee2e2; border-radius: 8px; position: fixed; top: 20px; right: 20px; z-index: 1000;';
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  successDiv.style.cssText = 'color: #10b981; padding: 1rem; margin: 1rem 0; background: #d1fae5; border-radius: 8px; position: fixed; top: 20px; right: 20px; z-index: 1000;';
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 3000);
}
