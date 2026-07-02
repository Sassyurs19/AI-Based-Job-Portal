// Shortlist button
document.getElementById('shortlistBtn').addEventListener('click', function() {
  if (this.textContent === 'Shortlist Candidate') {
    this.textContent = '✓ Shortlisted';
    this.style.background = 'rgba(34,197,94,.25)';
    this.style.borderColor = 'rgba(34,197,94,.5)';
    this.style.color = '#22c55e';
  } else {
    this.textContent = 'Shortlist Candidate';
    this.style.background = '';
    this.style.borderColor = '';
    this.style.color = '';
  }
});

// Schedule interview button
document.getElementById('scheduleBtn').addEventListener('click', function() {
  alert('Interview scheduling modal would open here with calendar integration.');
});

// Reject button
document.getElementById('rejectBtn').addEventListener('click', function() {
  if (confirm('Are you sure you want to reject this candidate? This action cannot be undone.')) {
    alert('Candidate rejected successfully. Redirecting to applicants list...');
    // In production, this would redirect to applicants page
  }
});

// Download resume
document.getElementById('downloadResume').addEventListener('click', function() {
  alert('Resume download would start here. File: john_doe_resume.pdf');
});

// Animate skill gap bars on load
document.addEventListener('DOMContentLoaded', function() {
  // Protect route
  if (window.protectRecruiterRoute && !protectRecruiterRoute()) return;

  const bars = document.querySelectorAll('.skill-gap-fill');
  bars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0';
    setTimeout(() => {
      bar.style.width = width;
    }, 300);
  });
});
