const themeToggle = document.getElementById('theme-toggle');
const ctaBtn = document.getElementById('cta-btn');
const projectGrid = document.getElementById('project-grid');

// Theme toggle with localStorage
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

// CTA scroll
ctaBtn.addEventListener('click', () => {
  document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
});

// Inject sample projects
const projects = [
  { title: 'Expanding Cards', link: '../001-expanding-cards/index.html' },
  { title: 'Progress Steps', link: '../002-progress-steps/index.html' },
  { title: 'Rotating Nav', link: '../003-rotating-navigation/index.html' }
];

projectGrid.innerHTML = projects.map(p => `
  <div class="project-card">
    <h3>${p.title}</h3>
    <a href="${p.link}" class="btn-primary">View</a>
  </div>
`).join('');