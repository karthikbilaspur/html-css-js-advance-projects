// Smooth scroll for any internal anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Analytics: track external link clicks
const tributeLink = document.getElementById('tribute-link');
if (tributeLink) {
  tributeLink.addEventListener('click', () => {
    console.log('External link: Wikipedia - Brendan Eich');
  });
}

// Add current year to footer dynamically
const yearEl = document.querySelector('footer p:last-child');
if (yearEl) {
  yearEl.innerHTML = yearEl.innerHTML.replace('2026', new Date().getFullYear());
}