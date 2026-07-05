// Auth Check - Prevents logged-in users from accessing auth pages
// and redirects non-logged-in users from protected pages

function checkAuthAndRedirect() {
  const api = window.api;
  if (!api) return;

  const pathname = window.location.pathname.toLowerCase();
  
  // Extract just the filename from the path
  const filename = pathname.substring(pathname.lastIndexOf('/') + 1) || 'index.html';

  // Pages that should redirect authenticated users to their dashboard
  const authPages = [
    'login.html',
    'register.html',
    'candidate-register.html',
    'recruiter-register.html'
  ];

  // Pages that should be accessible regardless of auth status
  const neutralPages = [
    'forgot-password.html',
    'set-password.html',
    'auth-callback.html',
    'terms-conditions.html',
    'index.html'
  ];

  // Pages that require authentication
  const protectedPages = [
    'candidate-dashboard.html',
    'recruiter-dashboard.html',
    'admin-dashboard.html',
    'complete-profile-candidate.html',
    'complete-profile-recruiter.html',
    'candidate-profile.html',
    'my-applications.html',
    'resume-analysis.html',
    'post-job.html',
    'applicants.html'
  ];

  const isAuthPage = authPages.includes(filename);
  const isNeutralPage = neutralPages.includes(filename);
  const isProtectedPage = protectedPages.includes(filename);

  if (isAuthPage && api.isAuthenticated()) {
    // User is logged in but trying to access login/register page
    const role = api.getUserRole();
    if (role === 'candidate') {
      window.location.href = 'candidate-dashboard.html';
    } else if (role === 'recruiter') {
      window.location.href = 'recruiter-dashboard.html';
    } else if (role === 'admin') {
      window.location.href = 'admin/admin-dashboard.html';
    }
    return true; // Redirected
  }

  if (isProtectedPage && !api.isAuthenticated()) {
    // User is not logged in but trying to access protected page
    window.location.href = 'login.html';
    return true; // Redirected
  }

  return false; // No redirect needed
}

// Export for use in other files
window.checkAuthAndRedirect = checkAuthAndRedirect;

// Auto-run on page load
document.addEventListener('DOMContentLoaded', function() {
  checkAuthAndRedirect();
});
