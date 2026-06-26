const counters = document.querySelectorAll('.counter');
const speed = 200; // Lower = faster

const animateCounters = () => {
  counters.forEach(counter => {
    const updateCount = () => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;

      // Calculate increment based on target
      const increment = target / speed;

      if (count < target) {
        // Ceil to avoid infinite loop on small increments
        counter.innerText = Math.ceil(count + increment);
        setTimeout(updateCount, 1);
      } else {
        counter.innerText = target.toLocaleString();
      }
    };

    updateCount();
  });
};

// Use IntersectionObserver to trigger when visible
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      observer.disconnect(); // Run once
    }
  });
}, { threshold: 0.5 });

observer.observe(document.querySelector('.counter-container'));

// Fallback: run on load if already visible
window.addEventListener('load', () => {
  const rect = document.querySelector('.counter-container').getBoundingClientRect();
  if (rect.top < window.innerHeight) {
    animateCounters();
  }
});

console.log('Incrementing Counter loaded - KarthikCodingSolutions ⚡ Bundle 3 Complete');