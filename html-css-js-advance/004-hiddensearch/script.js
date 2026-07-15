const search = document.getElementById('search');
const btn = document.getElementById('btn');
const input = document.getElementById('input');
const results = document.getElementById('results');

const projectList = [
  'Expanding Cards', 
  'Progress Steps', 
  'Rotating Navigation', 
  'Hidden Search', 
  'Blurry Loading', 
  'Scroll Animation'
];

btn.addEventListener('click', () => {
  search.classList.toggle('active');
  input.focus();
});

input.addEventListener('input', e => {
  const query = e.target.value.toLowerCase().trim();
  
  if (!query) {
    results.innerHTML = '';
    return;
  }
  
  const filtered = projectList.filter(p => p.toLowerCase().includes(query));
  
  results.innerHTML = filtered.length 
    ? filtered.map(p => `<div class="result-item">${p}</div>`).join('')
    : '<div class="result-item">No results found</div>';
});

// Close on ESC or click outside
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    search.classList.remove('active');
    input.value = '';
    results.innerHTML = '';
  }
});

document.addEventListener('click', e => {
  if (!search.contains(e.target)) {
    search.classList.remove('active');
    if (!input.value) results.innerHTML = '';
  }
});