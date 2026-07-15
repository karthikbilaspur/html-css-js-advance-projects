const boxes = document.querySelectorAll('.box');

const options = {
  root: null, // viewport
  threshold: 0.2, // 20% of element must be visible
  rootMargin: '0px 0px -50px 0px' // trigger a bit before it fully enters
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    } else {
      entry.target.classList.remove('show'); // remove this line if you want one-time animation
    }
  });
}, options);

boxes.forEach(box => observer.observe(box));