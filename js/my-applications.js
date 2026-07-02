// Status card filtering
document.querySelectorAll('.status-card').forEach(card => {
  card.addEventListener('click', function() {
    document.querySelectorAll('.status-card').forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    
    const status = this.dataset.status;
    const applicationCards = document.querySelectorAll('.application-card');
    
    applicationCards.forEach(card => {
      if (status === 'all') {
        card.style.display = 'block';
      } else {
        const cardStatus = card.querySelector('.application-card-status').classList.contains(status);
        card.style.display = cardStatus ? 'block' : 'none';
      }
    });
  });
});

// Withdraw button handling
document.querySelectorAll('.application-card-actions button').forEach(btn => {
  if (btn.textContent.includes('Withdraw')) {
    btn.addEventListener('click', function() {
      if (confirm('Are you sure you want to withdraw this application?')) {
        const card = this.closest('.application-card');
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
        this.textContent = 'Withdrawn';
        this.disabled = true;
      }
    });
  }
});

// Search functionality
document.querySelector('.search-filter-bar input').addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  const applicationCards = document.querySelectorAll('.application-card');
  
  applicationCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    const company = card.querySelector('.company').textContent.toLowerCase();
    
    if (title.includes(searchTerm) || company.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
});

// Status filter dropdown
document.querySelector('.search-filter-bar select').addEventListener('change', function() {
  const status = this.value;
  const applicationCards = document.querySelectorAll('.application-card');
  
  applicationCards.forEach(card => {
    if (status === '') {
      card.style.display = 'block';
    } else {
      const cardStatus = card.querySelector('.application-card-status').classList.contains(status);
      card.style.display = cardStatus ? 'block' : 'none';
    }
  });
  
  // Update status card active state
  document.querySelectorAll('.status-card').forEach(c => c.classList.remove('active'));
  const matchingCard = document.querySelector(`.status-card[data-status="${status}"]`);
  if (matchingCard) {
    matchingCard.classList.add('active');
  } else {
    document.querySelector('.status-card[data-status="all"]').classList.add('active');
  }
});
