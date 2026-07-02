const toggle = document.getElementById('toggle');
const nav = document.getElementById('nav');

toggle.addEventListener('click', () => nav.classList.toggle('active'));

// Close nav when clicking a link
document.querySelectorAll('nav ul a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('active');
  });
});

// Keyboard: Esc to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    nav.classList.remove('active');
  }
});

console.log('Animated Navigation loaded - KarthikCodingSolutions ⚡');