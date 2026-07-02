// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

let currentTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('theme', currentTheme);
  themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
});

// CTA Button
document.getElementById('cta-btn').addEventListener('click', () => {
  document.getElementById('projects').scrollIntoView();
});

// Dynamic Projects
const projects = [
  { title: 'Portfolio Site', desc: 'Responsive personal site with dark mode' },
  { title: 'Weather App', desc: 'Vanilla JS + OpenWeather API' },
  { title: 'Task Manager', desc: 'LocalStorage CRUD app' }
];

const projectGrid = document.getElementById('project-grid');
projects.forEach(project => {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h3>${project.title}</h3><p>${project.desc}</p>`;
  projectGrid.appendChild(card);
});

console.log('KarthikCodingSolutions boilerplate loaded ⚡');