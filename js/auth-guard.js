// Authentication Guard - Protects routes based on user role
function protectRoute(requiredRole = null) {
  // Check if user is authenticated
  if (!api.isAuthenticated()) {
    window.location.href = getResolvedPath('login.html');
    return false;
  }

  // Check if specific role is required
  if (requiredRole) {
    const userRole = api.getUserRole();
    if (userRole !== requiredRole) {
      // Redirect to appropriate dashboard based on current role
      if (userRole === 'candidate') {
        window.location.href = getResolvedPath('candidate-dashboard.html');
      } else if (userRole === 'recruiter') {
        window.location.href = getResolvedPath('recruiter-dashboard.html');
      } else if (userRole === 'admin') {
        window.location.href = getResolvedPath('admin/admin-dashboard.html');
      } else {
        window.location.href = getResolvedPath('login.html');
      }
      return false;
    }
  }

  return true;
}

// Role-specific guards
function protectCandidateRoute() {
  return protectRoute('candidate');
}

function protectRecruiterRoute() {
  return protectRoute('recruiter');
}

function protectAdminRoute() {
  return protectRoute('admin');
}

// Check authentication and redirect if already logged in
function checkAuthAndRedirect() {
  if (api.isAuthenticated()) {
    const userRole = api.getUserRole();
    if (userRole === 'candidate') {
      window.location.href = getResolvedPath('candidate-dashboard.html');
    } else if (userRole === 'recruiter') {
      window.location.href = getResolvedPath('recruiter-dashboard.html');
    } else if (userRole === 'admin') {
      window.location.href = getResolvedPath('admin/admin-dashboard.html');
    }
  }
}

// Update navbar based on authentication status
function updateNavbar() {
  const navActions = document.querySelector('.nav-actions');
  const panelActions = document.querySelector('.panel-actions');
  
  if (api.isAuthenticated()) {
    const user = api.getCurrentUser();
    const userRole = user ? user.role : api.getUserRole();
    
    let dashboardLink = 'candidate-dashboard.html';
    if (userRole === 'recruiter') {
      dashboardLink = 'recruiter-dashboard.html';
    } else if (userRole === 'admin') {
      dashboardLink = 'admin/admin-dashboard.html';
    }
    
    const resolvedDashLink = getResolvedPath(dashboardLink);
    
    // Update main navbar
    if (navActions) {
      navActions.innerHTML = `
        <a class="btn btn-ghost" href="${resolvedDashLink}">Dashboard</a>
        <button class="btn btn-grad" onclick="handleLogout()">Logout</button>
      `;
    }

    // Update mobile panel
    if (panelActions) {
      panelActions.innerHTML = `
        <a class="btn btn-ghost" href="${resolvedDashLink}">Dashboard</a>
        <button class="btn btn-grad" onclick="handleLogout()">Logout</button>
      `;
    }

    // Update logo links to point to dashboard
    document.querySelectorAll('.logo').forEach(logo => {
      logo.setAttribute('href', resolvedDashLink);
    });

    // Update navbar menu links dynamically
    const navLinks = document.querySelector('.nav-links');
    const panelLinks = document.querySelector('.panel-links');

    if (userRole === 'candidate') {
      const linksHTML = `
        <li><a href="${resolvedDashLink}">Home</a></li>
        <li><a href="${getResolvedPath('jobs.html')}">Jobs</a></li>
        <li><a href="${getResolvedPath('my-applications.html')}">Applications</a></li>
        <li><a href="${getResolvedPath('resume-analysis.html')}">Resume Analysis</a></li>
        <li><a href="${getResolvedPath('candidate-profile.html')}">Profile</a></li>
      `;
      const panelLinksHTML = `
        <a href="${resolvedDashLink}">Home</a>
        <a href="${getResolvedPath('jobs.html')}">Jobs</a>
        <a href="${getResolvedPath('my-applications.html')}">Applications</a>
        <a href="${getResolvedPath('resume-analysis.html')}">Resume Analysis</a>
        <a href="${getResolvedPath('candidate-profile.html')}">Profile</a>
      `;
      if (navLinks) navLinks.innerHTML = linksHTML;
      if (panelLinks) panelLinks.innerHTML = panelLinksHTML;
    } else if (userRole === 'recruiter') {
      const linksHTML = `
        <li><a href="${resolvedDashLink}">Home</a></li>
        <li><a href="${getResolvedPath('post-job.html')}">Post Job</a></li>
        <li><a href="${getResolvedPath('applicants.html')}">Applicants</a></li>
      `;
      const panelLinksHTML = `
        <a href="${resolvedDashLink}">Home</a>
        <a href="${getResolvedPath('post-job.html')}">Post Job</a>
        <a href="${getResolvedPath('applicants.html')}">Applicants</a>
      `;
      if (navLinks) navLinks.innerHTML = linksHTML;
      if (panelLinks) panelLinks.innerHTML = panelLinksHTML;
    } else if (userRole === 'admin') {
      const linksHTML = `
        <li><a href="${resolvedDashLink}">Home</a></li>
        <li><a href="${getResolvedPath('admin/admin-users.html')}">Manage Users</a></li>
        <li><a href="${getResolvedPath('admin/admin-jobs.html')}">Manage Jobs</a></li>
        <li><a href="${getResolvedPath('admin/admin-recruiters.html')}">Manage Recruiters</a></li>
      `;
      const panelLinksHTML = `
        <a href="${resolvedDashLink}">Home</a>
        <a href="${getResolvedPath('admin/admin-users.html')}">Manage Users</a>
        <a href="${getResolvedPath('admin/admin-jobs.html')}">Manage Jobs</a>
        <a href="${getResolvedPath('admin/admin-recruiters.html')}">Manage Recruiters</a>
      `;
      if (navLinks) navLinks.innerHTML = linksHTML;
      if (panelLinks) panelLinks.innerHTML = panelLinksHTML;
    }
  }

  // Set active class on navbar links dynamically matching current page filename
  const currentPath = window.location.pathname;
  let currentFilename = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  if (currentFilename === '') {
    currentFilename = 'index.html';
  }
  if (currentFilename.includes('#')) {
    currentFilename = currentFilename.split('#')[0];
  }
  if (currentFilename.includes('?')) {
    currentFilename = currentFilename.split('?')[0];
  }

  document.querySelectorAll('.nav-links a, .panel-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      let linkFilename = href.substring(href.lastIndexOf('/') + 1);
      if (linkFilename.includes('#')) {
        linkFilename = linkFilename.split('#')[0];
      }
      if (linkFilename.includes('?')) {
        linkFilename = linkFilename.split('?')[0];
      }
      
      if (linkFilename === currentFilename) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    }
  });
}

// Handle logout
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    api.logoutAPI();
  }
}

// Automatically update navbar on load
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
});

// Make functions globally available
window.protectRoute = protectRoute;
window.protectCandidateRoute = protectCandidateRoute;
window.protectRecruiterRoute = protectRecruiterRoute;
window.protectAdminRoute = protectAdminRoute;
window.checkAuthAndRedirect = checkAuthAndRedirect;
window.updateNavbar = updateNavbar;
window.handleLogout = handleLogout;
