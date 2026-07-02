// Index Page Handler
document.addEventListener('DOMContentLoaded', function() {
  // Redirect if logged in
  if (window.checkAuthAndRedirect) {
    checkAuthAndRedirect();
  }

  // Update navbar based on auth status
  updateNavbar();

  // Load featured jobs
  loadFeaturedJobs();

  // Handle search form
  const searchForm = document.querySelector('.search');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
});

async function loadFeaturedJobs() {
  try {
    const result = await api.getJobs();
    
    if (result.success && result.jobs) {
      renderFeaturedJobs(result.jobs.slice(0, 6));
    }
  } catch (error) {
    console.error('Error loading featured jobs:', error);
  }
}

function renderFeaturedJobs(jobs) {
  const jobsGrid = document.querySelector('.jobs-grid');
  if (!jobsGrid) return;

  jobsGrid.innerHTML = jobs.map(job => `
    <article class="job gborder">
      <div class="job-top">
        <span class="job-logo">${job.company?.name ? job.company.name.substring(0, 2).toUpperCase() : 'CO'}</span>
        <div>
          <h3>${job.title || 'Job Title'}</h3>
          <div class="co">${job.company?.name || 'Company'} · ${job.location || 'Remote'}</div>
        </div>
      </div>
      <div class="job-meta">
        <span class="chip">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11z"/>
            <circle cx="12" cy="10" r="2.5"/>
          </svg>
          ${job.location || 'Remote'}
        </span>
        ${job.salary ? `<span class="chip salary">$${job.salary.min || 0}k–$${job.salary.max || 0}k</span>` : ''}
      </div>
      <div class="job-tags">
        <span class="tag">${job.jobType || 'Full-time'}</span>
        ${(job.skills || []).slice(0, 2).map(skill => `<span class="tag">${skill}</span>`).join('')}
      </div>
      <div class="job-foot">
        <span class="posted">${formatDate(job.createdAt)}</span>
        <a class="view-role" href="job-details.html?id=${job._id}">
          View Role <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </article>
  `).join('');
}

function handleSearch(e) {
  e.preventDefault();
  const titleInput = document.querySelector('.search input[placeholder="Job title or keyword"]');
  const locationInput = document.querySelector('.search input[placeholder="Location"]');
  
  const params = {};
  if (titleInput?.value) params.search = titleInput.value;
  if (locationInput?.value) params.location = locationInput.value;
  
  // Redirect to jobs page with search params
  const queryString = new URLSearchParams(params).toString();
  window.location.href = `jobs.html${queryString ? '?' + queryString : ''}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
