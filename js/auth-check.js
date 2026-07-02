// Auth Check - Prevents logged-in users from accessing auth pages
// and redirects non-logged-in users from protected pages

function checkAuthAndRedirect() {
  const api = window.api;
  if (!api) return;

  const pathname = window.location.pathname;
  const isAuthPage = pathname.includes('login.html') || 
                     pathname.includes('register.html') ||
                     pathname.includes('candidate-register.html') ||
                     pathname.includes('recruiter-register.html') ||
                     pathname.includes('index.html') ||
                     (pathname.endsWith('/') && !pathname.includes('/admin/') && !pathname.includes('/candidate/') && !pathname.includes('/recruiter/'));

  const isProtectedPage = window.location.pathname.includes('candidate-dashboard.html') ||
                          window.location.pathname.includes('recruiter-dashboard.html') ||
                          window.location.pathname.includes('admin-dashboard.html') ||
                          window.location.pathname.includes('complete-profile-');

  if (isAuthPage && api.isAuthenticated()) {
    // User is logged in but trying to access login/register page
    const role = api.getUserRole();
    if (role === 'candidate') {
      window.location.href = 'candidate-dashboard.html';
    } else if (role === 'recruiter') {
      window.location.href = 'recruiter-dashboard.html';
    } else if (role === 'admin') {
      window.location.href = 'admin/admin-dashboard.html';
    } else {
      window.location.href = 'index.html';
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
