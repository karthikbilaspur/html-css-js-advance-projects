const progress = document.getElementById('progress');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const circles = document.querySelectorAll('.circle');
const stepTitle = document.getElementById('step-title');
const stepDesc = document.getElementById('step-desc');

const steps = [
  { title: 'Plan Project', desc: 'Define requirements, scope, and tech stack for your build.' },
  { title: 'Design UI', desc: 'Create wireframes and mockups in Figma or Pen & Paper.' },
  { title: 'Code Build', desc: 'Write HTML, CSS, and JavaScript to bring designs to life.' },
  { title: 'Deploy Live', desc: 'Push to GitHub Pages, Vercel, or Netlify for the world to see.' }
];

let currentActive = 1;

function update() {
  circles.forEach((circle, idx) => {
    const stepNum = idx + 1;
    const isActive = stepNum <= currentActive;
    circle.classList.toggle('active', isActive);
    
    if (stepNum === currentActive) {
      circle.setAttribute('aria-current', 'step');
    } else {
      circle.removeAttribute('aria-current');
    }
  });

  const activeCircles = document.querySelectorAll('.circle.active');
  progress.style.width = ((activeCircles.length - 1) / (circles.length - 1)) * 100 + '%';

  prev.disabled = currentActive === 1;
  next.disabled = currentActive === circles.length;
  
  stepTitle.textContent = steps[currentActive - 1].title;
  stepDesc.textContent = steps[currentActive - 1].desc;
}

next.addEventListener('click', () => {
  currentActive++;
  if (currentActive > circles.length) currentActive = circles.length;
  update();
});

prev.addEventListener('click', () => {
  currentActive--;
  if (currentActive < 1) currentActive = 1;
  update();
});

// Allow clicking circles to jump to step
circles.forEach((circle, idx) => {
  circle.addEventListener('click', () => {
    currentActive = idx + 1;
    update();
  });
});

// Initialize
update();