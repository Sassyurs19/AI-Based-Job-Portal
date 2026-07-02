// Filter chips toggle
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', function() {
    this.classList.toggle('active');
  });
});

// Bookmark toggle
document.querySelectorAll('.bookmark').forEach(btn => {
  btn.addEventListener('click', function() {
    this.classList.toggle('bookmarked');
    const svg = this.querySelector('svg');
    if (this.classList.contains('bookmarked')) {
      svg.setAttribute('fill', 'currentColor');
    } else {
      svg.setAttribute('fill', 'none');
    }
  });
});

// Pagination
document.querySelectorAll('.page-btn:not(.page-nav)').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});
