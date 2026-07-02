// Skills tag input functionality with safety checks
function setupSkillsInput(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const input = container.querySelector('.skill-tag-input');
  if (!input) return;
  
  const skills = [];

  input.addEventListener('keydown', function(e) {
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
    
    container.insertBefore(tag, input);
  }

  function removeSkill(skill, tag) {
    const index = skills.indexOf(skill);
    if (index > -1) {
      skills.splice(index, 1);
      tag.remove();
    }
  }
}

setupSkillsInput('techSkillsContainer');
setupSkillsInput('softSkillsContainer');

// Remove buttons
document.querySelectorAll('.remove-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const item = this.closest('.experience-item, .cert-item, .language-item');
    if (item && confirm('Are you sure you want to remove this item?')) {
      item.remove();
    }
  });
});

// Update resume button (Safe binding)
const updateResumeBtn = document.getElementById('updateResumeBtn');
if (updateResumeBtn) {
  updateResumeBtn.addEventListener('click', function() {
    alert('Resume upload modal would open here. Supported formats: PDF, DOC, DOCX');
  });
}

// Add buttons
document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const section = this.closest('.section-card');
    if (section) {
      const h2 = section.querySelector('h2').textContent.trim();
      alert(`Add ${h2} modal/form would open here.`);
    }
  });
});

// Animate completion ring on load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const ring = document.querySelector('.completion-ring-fill');
    if (ring) {
      ring.style.strokeDashoffset = '52.78';
    }
  }, 500);
});
