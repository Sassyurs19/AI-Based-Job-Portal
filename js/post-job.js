// Skills tag input
const skillsContainer = document.getElementById('skillsContainer');
const skillInput = skillsContainer.querySelector('.skill-tag-input');
const skills = [];

skillInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && this.value.trim()) {
    e.preventDefault();
    addSkill(this.value.trim());
    this.value = '';
  }
});

function addSkill(skill) {
  if (skills.includes(skill)) return;
  
  skills.push(skill);
  const tag = document.createElement('span');
  tag.className = 'skill-tag';
  tag.innerHTML = `
    ${skill}
    <span class="skill-tag-remove">&times;</span>
  `;
  
  tag.querySelector('.skill-tag-remove').addEventListener('click', function() {
    removeSkill(skill, tag);
  });
  
  skillsContainer.insertBefore(tag, skillInput);
}

function removeSkill(skill, tag) {
  const index = skills.indexOf(skill);
  if (index > -1) {
    skills.splice(index, 1);
    tag.remove();
  }
}

// Radio option selection
document.querySelectorAll('.radio-option').forEach(option => {
  option.addEventListener('click', function() {
    const radio = this.querySelector('input[type="radio"]');
    radio.checked = true;
    
    document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('selected'));
    this.classList.add('selected');
  });
});

// Recommended skills click
document.querySelectorAll('.recommended-skill').forEach(skill => {
  skill.addEventListener('click', function() {
    addSkill(this.textContent);
  });
});

// Form submission
document.getElementById('jobForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Job published successfully! Redirecting to dashboard...');
  // In production, this would submit the form data
});

// Save draft
document.getElementById('saveDraftBtn').addEventListener('click', function() {
  alert('Job saved as draft. You can continue editing later.');
});

// Preview job
document.getElementById('previewBtn').addEventListener('click', function() {
  alert('Job preview would open in a modal window.');
});
