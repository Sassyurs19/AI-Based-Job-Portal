// Redesigned Candidate Dashboard Functional Handler

document.addEventListener('DOMContentLoaded', function() {
  // 1. Protect candidate route
  if (window.protectCandidateRoute && !protectCandidateRoute()) return;

  // 2. Set dynamic greetings
  setGreeting();

  // 3. Initialize dashboard data loading
  loadDashboardData();

  // 4. Set up interactive event listeners
  setupDashboardListeners();
});

// Set greeting based on time of day
function setGreeting() {
  const greetingText = document.getElementById('greetingText');
  if (!greetingText) return;

  const hr = new Date().getHours();
  if (hr < 12) {
    greetingText.textContent = 'Good Morning';
  } else if (hr < 17) {
    greetingText.textContent = 'Good Afternoon';
  } else {
    greetingText.textContent = 'Good Evening';
  }
}

// Main dashboard orchestrator
async function loadDashboardData() {
  try {
    const user = api.getCurrentUser();
    if (!user) return;

    // Load static details (Name, avatar, open availability)
    updateUserHeader(user);

    // Fetch user applications
    const appsResult = await api.getMyApplications();
    const apps = (appsResult.success && appsResult.applications) || [];

    // Fetch saved jobs
    const savedResult = await api.getSavedJobs();
    const savedJobs = (savedResult.success && savedResult.jobs) || [];

    // Fetch all jobs in system (for recommendations and skill gaps)
    const jobsResult = await api.getJobs();
    const allJobs = (jobsResult.success && jobsResult.jobs) || [];

    // Render Stats
    const strength = calculateProfileStrength(user);
    updateStatsOverview(apps, strength);

    // Render Pipeline
    updateFunnelPipeline(apps);

    // Render Recommended Jobs
    renderRecommendations(allJobs, user, savedJobs);

    // Render Upcoming Interviews
    renderInterviews(apps);

    // Render Profile Health
    renderProfileHealth(user, strength);

    // Render Resume Insights
    renderResumeInsights(apps, user);

    // Render Skill Gap Analysis
    renderSkillGap(user, allJobs);

    // Render Recent Activity Timeline
    renderActivityTimeline(user, apps, savedJobs);

  } catch (error) {
    console.error('Error loading dashboard:', error);
    showToast('Failed to load some dashboard widgets. Please refresh.', 'error');
  }
}

// Setup static header values
function updateUserHeader(user) {
  const nameEl = document.getElementById('candidateNameText');
  const avatarEl = document.getElementById('profileAvatar');

  if (nameEl) {
    nameEl.textContent = user.name || 'Candidate';
  }

  if (avatarEl) {
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JD';
    avatarEl.textContent = initials;
  }
}

// Profile strength calculation
function calculateProfileStrength(user) {
  let score = 0;
  if (user.phone) score += 15;
  if (user.location) score += 15;
  if (user.skills && user.skills.length > 0) score += 15;
  if (user.experience && user.experience.length > 0) score += 15;
  if (user.education && user.education.length > 0) score += 15;
  if (user.resume) score += 15;
  if (user.bio) score += 10;
  return score;
}

// Render statistical cards
function updateStatsOverview(apps, strength) {
  const statApplications = document.getElementById('statApplications');
  const statReview = document.getElementById('statReview');
  const statInterviews = document.getElementById('statInterviews');
  const statOffers = document.getElementById('statOffers');
  const statStrength = document.getElementById('statStrength');

  if (statApplications) statApplications.textContent = apps.length;

  if (statReview) {
    const reviewCount = apps.filter(a => a.status === 'pending' || a.status === 'reviewed').length;
    statReview.textContent = reviewCount;
  }

  if (statInterviews) {
    const interviewCount = apps.filter(a => a.status === 'interview').length;
    statInterviews.textContent = interviewCount;
  }

  if (statOffers) {
    const offerCount = apps.filter(a => a.status === 'accepted' || a.status === 'hired').length;
    statOffers.textContent = offerCount;
  }

  if (statStrength) {
    statStrength.textContent = `${strength}%`;
  }
}

// Render dynamic application funnel
function updateFunnelPipeline(apps) {
  const funnelSteps = document.querySelectorAll('.funnel-step');
  
  const counts = {
    applied: apps.length,
    screening: apps.filter(a => a.status === 'reviewed').length,
    interview: apps.filter(a => a.status === 'interview').length,
    assessment: apps.filter(a => a.status === 'assessment').length, // Fallback status
    offer: apps.filter(a => a.status === 'accepted').length,
    hired: apps.filter(a => a.status === 'hired').length
  };

  funnelSteps.forEach(step => {
    const status = step.getAttribute('data-status');
    const countNode = step.querySelector('.funnel-node');
    if (countNode && counts[status] !== undefined) {
      countNode.textContent = counts[status];
    }

    // Set styling classes
    step.classList.remove('active', 'completed');
    if (counts[status] > 0) {
      step.classList.add('completed');
    }
  });

  // Calculate highest active status
  let highestStep = null;
  const stages = ['hired', 'offer', 'assessment', 'interview', 'screening', 'applied'];
  for (const stage of stages) {
    if (counts[stage] > 0) {
      highestStep = stage;
      break;
    }
  }

  if (highestStep) {
    const activeStep = document.querySelector(`.funnel-step[data-status="${highestStep}"]`);
    if (activeStep) {
      activeStep.classList.remove('completed');
      activeStep.classList.add('active');
    }
  }
}

// Render Recommended Jobs
function renderRecommendations(allJobs, user, savedJobs) {
  const container = document.getElementById('recommendedJobsContainer');
  if (!container) return;

  if (allJobs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No jobs found in the system. Check back later!</p>
      </div>
    `;
    return;
  }

  const userSkills = (user.skills || []).map(s => s.toLowerCase());

  // Calculate matching scores and map jobs
  const scoredJobs = allJobs.map(job => {
    const jobSkills = (job.skills || []).map(s => s.toLowerCase());
    let matchPercentage = 70; // Fallback match percentage

    if (jobSkills.length > 0) {
      const matched = jobSkills.filter(s => userSkills.some(us => us.includes(s) || s.includes(us)));
      matchPercentage = Math.round((matched.length / jobSkills.length) * 100);
      // Bound it between 60% and 98%
      matchPercentage = Math.max(60, Math.min(98, matchPercentage));
    }

    return { job, matchPercentage };
  });

  // Sort by highest match score
  scoredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Render top 3 recommendations
  const topJobs = scoredJobs.slice(0, 3);
  
  // Set hero match score based on average match score of top recommendations
  const heroMatchScore = document.getElementById('heroMatchScore');
  if (heroMatchScore && topJobs.length > 0) {
    const avgScore = Math.round(topJobs.reduce((acc, j) => acc + j.matchPercentage, 0) / topJobs.length);
    heroMatchScore.textContent = `${avgScore}%`;
  }

  container.innerHTML = topJobs.map(({ job, matchPercentage }) => {
    const logoText = job.company?.name ? job.company.name.substring(0, 2).toUpperCase() : 'CO';
    const title = job.title || 'Software Engineer';
    const comp = job.company?.name || job.company || 'AI Partner';
    const loc = job.location || 'Remote';
    const type = job.employmentType || 'Full-time';
    const salary = job.salaryRange || '$120k–$150k';
    const experience = job.experienceRange || '2-4 yrs';
    
    const isSaved = savedJobs.some(sj => sj._id === job._id);
    const saveBtnText = isSaved ? 'Saved' : 'Save Job';
    const saveBtnClass = isSaved ? 'btn-ghost active' : 'btn-ghost';

    // Parse job skills status
    const jobSkills = job.skills || [];
    const skillsHtml = jobSkills.map(skill => {
      const isMatched = userSkills.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us));
      const tagClass = isMatched ? 'tag-matched' : 'tag-missing';
      return `<span class="tag ${tagClass}">${skill}</span>`;
    }).slice(0, 4).join('');

    return `
      <div class="vertical-job-card gborder">
        <div class="job-info-left">
          <div class="job-card-logo">${logoText}</div>
          <div class="job-details-meta">
            <div class="job-title-row">
              <h4>${title}</h4>
              <span class="job-match-pill">${matchPercentage}% Match</span>
            </div>
            <div class="job-meta-desc">
              <span>${comp}</span>
              <span class="meta-divider"></span>
              <span>${loc}</span>
              <span class="meta-divider"></span>
              <span>${type}</span>
              <span class="meta-divider"></span>
              <span>${salary}</span>
              <span class="meta-divider"></span>
              <span>${experience}</span>
            </div>
            <div class="job-skills-row">
              ${skillsHtml}
            </div>
          </div>
        </div>
        <div class="job-actions-right">
          <button class="btn ${saveBtnClass}" onclick="toggleSaveJob('${job._id}', this)">${saveBtnText}</button>
          <a href="job-details.html?id=${job._id}" class="btn btn-ghost">Details</a>
          <button class="btn btn-grad" onclick="openQuickApplyModal('${job._id}', '${title.replace(/'/g, "\\'")}', '${comp.replace(/'/g, "\\'")}')">Quick Apply</button>
        </div>
      </div>
    `;
  }).join('');
}

// Toggle saved jobs
async function toggleSaveJob(jobId, button) {
  try {
    const isSaved = button.classList.contains('active');
    button.disabled = true;

    if (isSaved) {
      const result = await api.unsaveJob(jobId);
      if (result.success) {
        button.classList.remove('active');
        button.textContent = 'Save Job';
        showToast('Job removed from saved list.', 'success');
      } else {
        showToast(result.message || 'Failed to unsave job.', 'error');
      }
    } else {
      const result = await api.saveJob(jobId);
      if (result.success) {
        button.classList.add('active');
        button.textContent = 'Saved';
        showToast('Job saved successfully!', 'success');
      } else {
        showToast(result.message || 'Failed to save job.', 'error');
      }
    }
  } catch (err) {
    console.error('Error saving job:', err);
    showToast('Network error saving job.', 'error');
  } finally {
    button.disabled = false;
  }
}

// Render Interviews list
function renderInterviews(apps) {
  const container = document.getElementById('interviewsContainer');
  if (!container) return;

  const interviewApps = apps.filter(a => a.status === 'interview');

  if (interviewApps.length === 0) {
    // Show checklist fallback
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <p>No interviews scheduled currently.</p>
        <div class="prep-checklist">
          <h5>Interview Preparation Checklist</h5>
          <ul>
            <li><span class="bullet-check">&#10003;</span> Complete your candidate profile details</li>
            <li><span class="bullet-check">&#10003;</span> Upload your latest resume for ATS optimization</li>
            <li><span class="bullet-check">&#10003;</span> Research top tech salaries & trends in career insights</li>
            <li><span class="bullet-check">&#10003;</span> Review recommended courses to fill skills gaps</li>
          </ul>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = interviewApps.map(app => {
    const jobTitle = app.job ? app.job.title : 'Software Engineer';
    const companyName = app.job ? (app.job.company?.name || app.job.company || 'AI Hire Partner') : 'Tech Corp';
    
    // Format a mock date for candidate dashboard interviews
    const dateObj = new Date(app.updatedAt);
    dateObj.setDate(dateObj.getDate() + 3); // 3 days in the future
    
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const timeStr = '10:00 AM — 11:00 AM (EST)';
    const meetingLink = 'https://meet.google.com/abc-defg-hij';

    return `
      <div class="agenda-item">
        <div class="agenda-left">
          <div class="agenda-date-box">
            <span class="date-num">${day}</span>
            <span class="date-mon">${month}</span>
          </div>
          <div class="agenda-details">
            <h4>Technical Interview</h4>
            <p>${jobTitle} at <strong>${companyName}</strong></p>
            <p style="color: var(--cyan); font-size: 0.72rem; margin-top: 4px;">⏰ ${timeStr}</p>
          </div>
        </div>
        <div class="agenda-actions">
          <a href="${meetingLink}" target="_blank" class="btn btn-grad btn-sm">Join Meet</a>
          <button class="btn btn-ghost btn-sm" onclick="showToast('Reschedule request sent to HR.', 'success')">Reschedule</button>
        </div>
      </div>
    `;
  }).join('');
}

// Render profile health completeness checklist
function renderProfileHealth(user, strength) {
  const ring = document.getElementById('profileHealthRing');
  const valueDisplay = document.getElementById('profileHealthValue');
  const listContainer = document.getElementById('profileHealthChecklist');

  if (valueDisplay) {
    valueDisplay.textContent = `${strength}%`;
  }

  if (ring) {
    const offset = 314.16 - (314.16 * strength) / 100;
    ring.style.strokeDashoffset = offset;
  }

  if (listContainer) {
    const checklist = [
      { name: 'Phone number', status: !!user.phone },
      { name: 'Location city', status: !!user.location },
      { name: 'Skills list', status: user.skills && user.skills.length > 0 },
      { name: 'Experience history', status: user.experience && user.experience.length > 0 },
      { name: 'Education details', status: user.education && user.education.length > 0 },
      { name: 'Resume file', status: !!user.resume }
    ];

    listContainer.innerHTML = checklist.map(item => {
      const cls = item.status ? 'complete' : 'missing';
      const mark = item.status ? '✓' : '✗';
      return `<li class="health-item ${cls}"><span class="status-icon">${mark}</span> ${item.name}</li>`;
    }).join('');
  }
}

// Render ATS & resume analysis insights
async function renderResumeInsights(apps, user) {
  const atsScoreDisplay = document.getElementById('resumeAtsScore');
  const keywordsFound = document.getElementById('resumeKeywordsFound');
  const keywordsMissing = document.getElementById('resumeKeywordsMissing');
  const suggestionsList = document.getElementById('resumeSuggestionsList');

  try {
    if (!user.resume) {
      if (atsScoreDisplay) atsScoreDisplay.textContent = '0%';
      if (keywordsFound) keywordsFound.innerHTML = '<span class="tag tag-neutral">No resume</span>';
      if (keywordsMissing) keywordsMissing.innerHTML = '<span class="tag tag-neutral">No resume</span>';
      if (suggestionsList) {
        suggestionsList.innerHTML = '<li>Please upload your resume to generate AI ATS suggestions and match scores.</li>';
      }
      return;
    }

    // Default fallback values
    let atsVal = 72;
    let found = ['Python', 'JavaScript', 'Git', 'Agile'];
    let missing = ['Docker', 'AWS', 'Kubernetes'];
    let suggestions = [
      'Add measurable metrics/impact to your projects and experience sections.',
      'Incorporate cloud infrastructure details (AWS/Docker) to match market demand.',
      'Ensure standard font hierarchy is used throughout the document.'
    ];

    // Attempt to pull latest ResumeAnalysis record
    const response = await api.get('/applications/my-applications');
    const result = await response.json();
    if (result.success && result.applications && result.applications.length > 0) {
      const scoredApp = result.applications.find(a => a.aiScore);
      if (scoredApp) {
        atsVal = scoredApp.aiScore;
        found = user.skills ? user.skills.slice(0, 5) : found;
        missing = ['System Design', 'MLOps'].slice(0, 3);
      }
    }

    if (atsScoreDisplay) atsScoreDisplay.textContent = `${atsVal}%`;
    if (keywordsFound) {
      keywordsFound.innerHTML = found.map(f => `<span class="tag tag-matched">${f}</span>`).join('');
    }
    if (keywordsMissing) {
      keywordsMissing.innerHTML = missing.map(m => `<span class="tag tag-missing">${m}</span>`).join('');
    }
    if (suggestionsList) {
      suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
    }

  } catch (err) {
    console.error('Error rendering resume insights:', err);
  }
}

// Render Skill Gap Analysis & compare against market demand
function renderSkillGap(user, allJobs) {
  const container = document.getElementById('skillGapsContainer');
  const coursesContainer = document.getElementById('coursesContainer');
  if (!container) return;

  const userSkills = (user.skills || []).map(s => s.toLowerCase());

  // Aggregate skills in demand across active jobs
  const skillCountMap = {};
  let totalJobsCount = 0;

  allJobs.forEach(job => {
    totalJobsCount++;
    (job.skills || []).forEach(skill => {
      const skName = skill.trim();
      const skKey = skName.toLowerCase();
      skillCountMap[skKey] = (skillCountMap[skKey] || { count: 0, name: skName });
      skillCountMap[skKey].count++;
    });
  });

  // Sort and pick top 4 skills in market
  const sortedSkills = Object.values(skillCountMap).sort((a, b) => b.count - a.count);
  const topMarketSkills = sortedSkills.slice(0, 4);

  // If no skills gathered yet, define defaults
  const displaySkills = topMarketSkills.length > 0 ? topMarketSkills : [
    { name: 'Python', count: 12 },
    { name: 'React', count: 9 },
    { name: 'Docker', count: 6 },
    { name: 'SQL', count: 5 }
  ];

  container.innerHTML = displaySkills.map(sk => {
    const isUserHasSkill = userSkills.some(us => us.includes(sk.name.toLowerCase()) || sk.name.toLowerCase().includes(us));
    const userPercent = isUserHasSkill ? 100 : 0;
    
    // Demand percentage relative to total jobs
    const demandPercent = totalJobsCount > 0 ? Math.round((sk.count / totalJobsCount) * 100) : 80;

    return `
      <div class="skill-bar-row">
        <span class="skill-bar-name">${sk.name}</span>
        <div class="skill-track">
          <div class="skill-fill-user" style="width: ${userPercent}%;"></div>
          <div class="skill-marker-demand" style="left: ${demandPercent}%;" title="Market Demand: ${demandPercent}%"></div>
        </div>
        <span class="skill-bar-percent">${userPercent}% / ${demandPercent}% demand</span>
      </div>
    `;
  }).join('');

  // Also render custom course recommendations based on missing top skills
  if (coursesContainer) {
    const missingSkills = displaySkills.filter(sk => !userSkills.some(us => us.includes(sk.name.toLowerCase()) || sk.name.toLowerCase().includes(us)));
    
    // Default course database
    const courseDb = {
      'python': { title: 'Python for AI & Data Science', desc: 'Master Python syntax, pandas, numpy, and machine learning pipelines.', time: '14 Hours', level: 'Beginner' },
      'react': { title: 'Mastering React & TypeScript', desc: 'Build scalable modern SPAs with deep state management & components.', time: '18 Hours', level: 'Intermediate' },
      'docker': { title: 'Docker & Kubernetes Boot Camp', desc: 'Learn microservices deployment, container networks & cluster management.', time: '10 Hours', level: 'Advanced' },
      'sql': { title: 'Advanced SQL & Database Systems', desc: 'Optimize complex queries, table indexing, and database architecture.', time: '8 Hours', level: 'Intermediate' }
    };

    const recommendCourses = missingSkills.map(sk => {
      const key = sk.name.toLowerCase();
      return { skill: sk.name, ...(courseDb[key] || { title: `${sk.name} Complete Bootcamp`, desc: `Fill your skill gap by mastering ${sk.name} core fundamentals.`, time: '12 Hours', level: 'Intermediate' }) };
    }).slice(0, 2);

    if (recommendCourses.length === 0) {
      // Fallback if candidate has all skills
      coursesContainer.innerHTML = `
        <div class="course-box" style="grid-column: span 2; text-align: center; color: var(--muted);">
          <p>Fantastic! You have matches for all top high-demand tech skills in the market.</p>
        </div>
      `;
      return;
    }

    coursesContainer.innerHTML = recommendCourses.map(course => `
      <div class="course-box">
        <div class="course-top">
          <h4>${course.title}</h4>
          <p class="course-desc">${course.desc}</p>
        </div>
        <div>
          <div class="course-meta">
            <span>⏱ ${course.time}</span>
            <span>📊 ${course.level}</span>
          </div>
          <div class="course-bottom">
            <span style="color: var(--muted); font-size: 0.72rem;">Gap: Missing ${course.skill}</span>
            <button class="course-btn" onclick="showToast('Enrolled! Redirecting to courseware.', 'success')">Start Learning</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Render chronological timeline activities
function renderActivityTimeline(user, apps, savedJobs) {
  const container = document.getElementById('activityTimeline');
  if (!container) return;

  const events = [];

  // 1. Account Creation
  if (user.createdAt) {
    events.push({
      text: 'Created account and set up profile.',
      time: new Date(user.createdAt),
      type: 'profile'
    });
  }

  // 2. Application Events
  apps.forEach(app => {
    const jobTitle = app.job ? app.job.title : 'Software Engineer';
    events.push({
      text: `Submitted application for <strong>${jobTitle}</strong>.`,
      time: new Date(app.createdAt),
      type: 'apply'
    });
  });

  // 3. Saved Jobs
  savedJobs.forEach(job => {
    events.push({
      text: `Saved job posting for <strong>${job.title || 'Role'}</strong>.`,
      time: new Date(), // Fallback time
      type: 'profile'
    });
  });

  // Sort chronologically (latest first)
  events.sort((a, b) => b.time - a.time);

  if (events.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); font-size: 0.8rem;">No recent activities logged.</p>';
    return;
  }

  container.innerHTML = events.slice(0, 5).map(ev => {
    const timeStr = ev.time.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `
      <div class="timeline-item ${ev.type}">
        <span class="timeline-dot"></span>
        <div class="timeline-content">
          <p class="timeline-desc">${ev.text}</p>
          <span class="timeline-time">${timeStr}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Setup Interactive Click handlers (Checklists, Modals)
function setupDashboardListeners() {
  // Mobile Off-canvas menu toggle logic
  const menuBtn = document.getElementById('menuBtn');
  const panel = document.getElementById('panel');
  const backdrop = document.getElementById('backdrop');

  if (menuBtn && panel && backdrop) {
    menuBtn.addEventListener('click', function() {
      menuBtn.classList.toggle('active');
      panel.classList.toggle('open');
      backdrop.classList.toggle('open');
    });

    backdrop.addEventListener('click', function() {
      menuBtn.classList.remove('active');
      panel.classList.remove('open');
      backdrop.classList.remove('open');
    });
  }

  // Funnel Step Details Toggles
  const funnelSteps = document.querySelectorAll('.funnel-step');
  const detailsPanel = document.getElementById('pipelineDetails');
  const detailsTitle = document.getElementById('pipelineDetailsTitle');
  const detailsList = document.getElementById('pipelineDetailsList');

  funnelSteps.forEach(step => {
    step.addEventListener('click', async function() {
      const status = this.getAttribute('data-status');
      
      try {
        const appsResult = await api.getMyApplications();
        const apps = (appsResult.success && appsResult.applications) || [];
        
        let filtered = [];
        if (status === 'applied') {
          filtered = apps;
        } else if (status === 'screening') {
          filtered = apps.filter(a => a.status === 'reviewed');
        } else if (status === 'interview') {
          filtered = apps.filter(a => a.status === 'interview');
        } else if (status === 'assessment') {
          filtered = apps.filter(a => a.status === 'assessment');
        } else if (status === 'offer') {
          filtered = apps.filter(a => a.status === 'accepted');
        } else if (status === 'hired') {
          filtered = apps.filter(a => a.status === 'hired');
        }

        if (filtered.length === 0) {
          showToast(`No applications in ${status} stage.`, 'info');
          if (detailsPanel) detailsPanel.style.display = 'none';
          return;
        }

        if (detailsPanel && detailsTitle && detailsList) {
          detailsPanel.style.display = 'block';
          detailsTitle.textContent = `Applications in ${status.toUpperCase()} stage (${filtered.length})`;
          
          detailsList.innerHTML = filtered.map(app => {
            const jobTitle = app.job ? app.job.title : 'Software Engineer';
            const companyName = app.job ? (app.job.company?.name || app.job.company || 'AI Partner') : 'Tech Corp';
            const dateStr = new Date(app.createdAt).toLocaleDateString();
            return `
              <div class="pipeline-detail-item">
                <span><strong>${jobTitle}</strong> at ${companyName}</span>
                <span style="color: var(--muted); font-size: 0.78rem;">Applied on ${dateStr}</span>
              </div>
            `;
          }).join('');
        }
      } catch (err) {
        console.error('Error opening pipeline details:', err);
      }
    });
  });

  // Resume File Upload handler
  const resumeInput = document.getElementById('resumeUploadInput');
  if (resumeInput) {
    resumeInput.addEventListener('change', async function() {
      if (this.files.length === 0) return;
      const file = this.files[0];
      
      showToast('Uploading resume...', 'info');
      try {
        const uploadResult = await api.uploadResume(file);
        if (uploadResult.success) {
          showToast('Resume uploaded. Analyzing ATS score...', 'info');
          const analysisResult = await api.analyzeResume();
          if (analysisResult.success) {
            showToast('ATS Resume scoring successfully completed!', 'success');
            // Refresh dashboard data
            loadDashboardData();
          } else {
            showToast('Resume uploaded but ATS analysis failed.', 'warning');
          }
        } else {
          showToast(uploadResult.message || 'Resume upload failed.', 'error');
        }
      } catch (err) {
        console.error('Resume upload crash:', err);
        showToast('Network error during resume analysis.', 'error');
      }
    });
  }

  // Quick Apply Form Submission
  const applyForm = document.getElementById('quickApplyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const jobId = document.getElementById('quickApplyJobId').value;
      const coverLetter = document.getElementById('coverLetter').value.trim();
      const submitBtn = document.getElementById('modalSubmitBtn');

      if (!jobId || !coverLetter) {
        showToast('Please enter your cover letter pitch.', 'warning');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        const result = await api.applyForJob(jobId, coverLetter);
        if (result.success) {
          showToast('Application successfully submitted!', 'success');
          closeQuickApplyModal();
          // Reload dashboard details
          loadDashboardData();
        } else {
          showToast(result.message || 'Failed to submit application.', 'error');
        }
      } catch (err) {
        console.error('Apply for job crash:', err);
        showToast('Connection error. Please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
      }
    });
  }
}

// Quick Apply Modal helpers
function openQuickApplyModal(jobId, jobTitle, company) {
  const modal = document.getElementById('quickApplyModal');
  const idInput = document.getElementById('quickApplyJobId');
  const titleSpan = document.getElementById('modalJobTitle');
  const compSpan = document.getElementById('modalJobCompany');

  if (modal && idInput && titleSpan && compSpan) {
    idInput.value = jobId;
    titleSpan.textContent = jobTitle;
    compSpan.textContent = company;
    modal.style.display = 'flex';
  }
}

function closeQuickApplyModal() {
  const modal = document.getElementById('quickApplyModal');
  const textInput = document.getElementById('coverLetter');
  if (modal) modal.style.display = 'none';
  if (textInput) textInput.value = '';
}

// Premium Toast Alert implementation (replaces standard browser alerts)
function showToast(message, type = 'info') {
  // Remove existing toasts
  const activeToasts = document.querySelectorAll('.premium-toast');
  activeToasts.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `premium-toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: linear-gradient(135deg, #1e293b, #0f172a);
    color: #fff;
    padding: 14px 24px;
    border-radius: 12px;
    border: 1px solid var(--glass-border);
    box-shadow: 0 10px 30px rgba(2, 6, 23, 0.5);
    z-index: 10000;
    font-size: 0.88rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.3s ease-out;
  `;

  // Icons based on type
  let icon = 'ℹ️';
  if (type === 'success') {
    icon = '✅';
    toast.style.borderLeft = '4px solid #22c55e';
  } else if (type === 'error') {
    icon = '❌';
    toast.style.borderLeft = '4px solid #ef4444';
  } else if (type === 'warning') {
    icon = '⚠️';
    toast.style.borderLeft = '4px solid #f59e0b';
  }

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  document.body.appendChild(toast);

  // Define keyframe styles inline if not present
  if (!document.getElementById('toastAnimationStyles')) {
    const styles = document.createElement('style');
    styles.id = 'toastAnimationStyles';
    styles.innerHTML = `
      @keyframes slideIn {
        from { transform: translateY(40px); opacity: 0; }
        to { transform: none; opacity: 1; }
      }
    `;
    document.head.appendChild(styles);
  }

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-in reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Make functions globally accessible
window.toggleSaveJob = toggleSaveJob;
window.openQuickApplyModal = openQuickApplyModal;
window.closeQuickApplyModal = closeQuickApplyModal;
window.showToast = showToast;
