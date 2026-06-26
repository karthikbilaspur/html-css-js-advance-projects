// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Fade in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('#tribute-info li').forEach(li => {
  li.style.opacity = 0;
  li.style.transform = 'translateY(20px)';
  li.style.transition = 'all 0.5s ease';
  observer.observe(li);
});

console.log('Tribute Page loaded - KarthikCodingSolutions ⚡ Bundle 2 Complete');