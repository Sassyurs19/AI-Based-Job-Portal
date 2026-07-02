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
  
  if (!navActions || !panelActions) return;

  if (api.isAuthenticated()) {
    const user = api.getCurrentUser();
    const userRole = user ? user.role : null;
    
    // Update main navbar
    if (userRole === 'candidate') {
      navActions.innerHTML = `
        <a class="btn btn-ghost" href="${getResolvedPath('candidate-dashboard.html')}">Dashboard</a>
        <button class="btn btn-grad" onclick="handleLogout()">Logout</button>
      `;
    } else if (userRole === 'recruiter') {
      navActions.innerHTML = `
        <a class="btn btn-ghost" href="${getResolvedPath('recruiter-dashboard.html')}">Dashboard</a>
        <button class="btn btn-grad" onclick="handleLogout()">Logout</button>
      `;
    } else if (userRole === 'admin') {
      navActions.innerHTML = `
        <a class="btn btn-ghost" href="${getResolvedPath('admin/admin-dashboard.html')}">Dashboard</a>
        <button class="btn btn-grad" onclick="handleLogout()">Logout</button>
      `;
    }

    // Update mobile panel
    let dashboardLink = `${userRole}-dashboard.html`;
    if (userRole === 'admin') {
      dashboardLink = 'admin/admin-dashboard.html';
    }
    panelActions.innerHTML = `
      <a class="btn btn-ghost" href="${getResolvedPath(dashboardLink)}">Dashboard</a>
      <button class="btn btn-grad" onclick="handleLogout()">Logout</button>
    `;
  }
}

// Handle logout
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    api.logoutAPI();
  }
}

// Make functions globally available
window.protectRoute = protectRoute;
window.protectCandidateRoute = protectCandidateRoute;
window.protectRecruiterRoute = protectRecruiterRoute;
window.protectAdminRoute = protectAdminRoute;
window.checkAuthAndRedirect = checkAuthAndRedirect;
window.updateNavbar = updateNavbar;
window.handleLogout = handleLogout;
