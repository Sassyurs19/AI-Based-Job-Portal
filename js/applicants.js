// Shortlist button handling
document.querySelectorAll('.btn-shortlist').forEach(btn => {
  btn.addEventListener('click', function() {
    const card = this.closest('.candidate-card');
    const status = card.querySelector('.candidate-status');
    
    if (this.textContent === 'Shortlist') {
      this.textContent = 'Shortlisted';
      this.style.background = 'rgba(34,197,94,.25)';
      this.style.borderColor = 'rgba(34,197,94,.5)';
      status.className = 'candidate-status shortlisted';
      status.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3 8-8"/></svg> Shortlisted';
    } else {
      this.textContent = 'Shortlist';
      this.style.background = '';
      this.style.borderColor = '';
      status.className = 'candidate-status reviewed';
      status.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Under Review';
    }
  });
});

// Reject button handling
document.querySelectorAll('.btn-reject').forEach(btn => {
  btn.addEventListener('click', function() {
    if (this.textContent === 'Reject') {
      if (confirm('Are you sure you want to reject this candidate?')) {
        const card = this.closest('.candidate-card');
        const status = card.querySelector('.candidate-status');
        const shortlistBtn = card.querySelector('.btn-shortlist');
        
        this.textContent = 'Rejected';
        this.disabled = true;
        this.style.opacity = '0.5';
        
        status.className = 'candidate-status rejected';
        status.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 6L6 18M6 6l12 12"/></svg> Rejected';
        
        shortlistBtn.disabled = true;
        shortlistBtn.style.opacity = '0.5';
        
        card.style.opacity = '0.7';
      }
    }
  });
});

// Search functionality
document.querySelector('.search-filter-bar input').addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  const candidateCards = document.querySelectorAll('.candidate-card');
  
  candidateCards.forEach(card => {
    const name = card.querySelector('h3').textContent.toLowerCase();
    const skills = Array.from(card.querySelectorAll('.skill-tag')).map(s => s.textContent.toLowerCase()).join(' ');
    
    if (name.includes(searchTerm) || skills.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});

// Filter dropdowns
document.querySelectorAll('.search-filter-bar select').forEach(select => {
  select.addEventListener('change', function() {
    // In production, this would filter candidates based on selection
    console.log('Filter changed:', this.value);
  });
});
