const search = document.getElementById('search');
const btn = document.getElementById('btn');
const input = document.getElementById('input');
const results = document.getElementById('results');

// Sample data for KarthikCodingSolutions
const projects = [
  { title: 'Expanding Cards', desc: 'Flex-based card animation - Project 001' },
  { title: 'Progress Steps', desc: 'Multi-step form UI - Project 002' },
  { title: 'Rotating Navigation', desc: '3D rotate menu effect - Project 003' },
  { title: 'Weather App', desc: 'Vanilla JS + API integration' },
  { title: 'Task Manager', desc: 'CRUD with LocalStorage' },
  { title: 'Portfolio Site', desc: 'Responsive showcase site' }
];

btn.addEventListener('click', () => {
  search.classList.toggle('active');
  input.focus();
});

// Live search
input.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  
  if (query === '') {
    results.innerHTML = '';
    return;
  }
  
  const filtered = projects.filter(project => 
    project.title.toLowerCase().includes(query) || 
    project.desc.toLowerCase().includes(query)
  );
  
  displayResults(filtered);
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && search.classList.contains('active')) {
    search.classList.remove('active');
    input.value = '';
    results.innerHTML = '';
  }
});

function displayResults(items) {
  if (items.length === 0) {
    results.innerHTML = `<div class="result-item"><p>No projects found</p></div>`;
    return;
  }
  
  results.innerHTML = items.map(item => `
    <div class="result-item">
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
    </div>
  `).join('');
}

console.log('Hidden Search loaded - KarthikCodingSolutions ⚡');
