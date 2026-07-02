// Sidebar active state
(function(){
  var links=document.querySelectorAll('.sidebar-nav a:not(.logout)');
  links.forEach(function(link){
    link.addEventListener('click',function(e){
      links.forEach(function(l){l.classList.remove('active');});
      this.classList.add('active');
    });
  });
})();

// Quick action buttons
document.querySelectorAll('.quick-action-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const action = this.querySelector('span').textContent;
    alert(`${action} feature would open here.`);
  });
});

// Review buttons
document.querySelectorAll('.candidate-actions .btn').forEach(btn => {
  btn.addEventListener('click', function() {
    alert('Candidate review panel would open here.');
  });
});
