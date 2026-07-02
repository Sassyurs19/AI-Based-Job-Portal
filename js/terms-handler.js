// Terms & Conditions Handler
document.addEventListener('DOMContentLoaded', function() {
  const acceptCheckbox = document.getElementById('acceptTerms');
  const acceptBtn = document.getElementById('acceptBtn');

  // Get redirect URL from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect') || 'complete-profile-candidate.html';
  const userRole = urlParams.get('role') || 'candidate';

  // Enable/disable accept button based on checkbox
  acceptCheckbox.addEventListener('change', function() {
    acceptBtn.disabled = !this.checked;
  });

  // Handle accept button click
  acceptBtn.addEventListener('click', function() {
    if (!acceptCheckbox.checked) return;

    // Store terms acceptance in localStorage
    localStorage.setItem('termsAccepted', 'true');
    localStorage.setItem('termsAcceptedDate', new Date().toISOString());

    // Redirect to the appropriate page
    if (redirectUrl === 'complete-profile-candidate.html') {
      window.location.href = 'complete-profile-candidate.html?role=candidate';
    } else if (redirectUrl === 'complete-profile-recruiter.html') {
      window.location.href = 'complete-profile-recruiter.html?role=recruiter';
    } else {
      window.location.href = redirectUrl;
    }
  });
});
