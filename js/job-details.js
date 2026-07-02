// Save button toggle
document.getElementById('saveBtn').addEventListener('click', function() {
  this.classList.toggle('saved');
  const svg = this.querySelector('svg');
  if (this.classList.contains('saved')) {
    svg.setAttribute('fill', 'currentColor');
  } else {
    svg.setAttribute('fill', 'none');
  }
});

// Sidebar save button toggle
document.getElementById('sidebarSaveBtn').addEventListener('click', function() {
  this.textContent = this.textContent === 'Save Job' ? 'Saved ✓' : 'Save Job';
  this.classList.toggle('btn-grad');
  this.classList.toggle('btn-ghost');
  
  // Sync with header save button
  const headerSaveBtn = document.getElementById('saveBtn');
  if (this.textContent === 'Saved ✓') {
    headerSaveBtn.classList.add('saved');
    headerSaveBtn.querySelector('svg').setAttribute('fill', 'currentColor');
  } else {
    headerSaveBtn.classList.remove('saved');
    headerSaveBtn.querySelector('svg').setAttribute('fill', 'none');
  }
});

// Share button
document.getElementById('shareBtn').addEventListener('click', function() {
  if (navigator.share) {
    navigator.share({
      title: 'Senior ML Engineer at OpenAI',
      text: 'Check out this job opportunity on AI Hire',
      url: window.location.href
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
      setTimeout(() => {
        this.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
      }, 2000);
    });
  }
});
