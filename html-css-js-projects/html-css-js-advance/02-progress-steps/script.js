const progress = document.getElementById('progress');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const circles = document.querySelectorAll('.circle');
const stepTitle = document.getElementById('step-title');
const stepDesc = document.getElementById('step-desc');

const steps = [
  { title: 'Plan Project', desc: 'Define requirements, scope, and tech stack for your build.' },
  { title: 'Build MVP', desc: 'Code the core features. Keep it simple and functional.' },
  { title: 'Test & Debug', desc: 'Find bugs, fix issues, and get feedback from users.' },
  { title: 'Deploy Live', desc: 'Ship to production. Monitor, iterate, and scale.' }
];

let currentActive = 1;

next.addEventListener('click', () => {
  currentActive++;
  if (currentActive > circles.length) {
    currentActive = circles.length;
  }
  update();
});

prev.addEventListener('click', () => {
  currentActive--;
  if (currentActive < 1) {
    currentActive = 1;
  }
  update();
});

function update() {
  circles.forEach((circle, idx) => {
    if (idx < currentActive) {
      circle.classList.add('active');
    } else {
      circle.classList.remove('active');
    }
  });

  const actives = document.querySelectorAll('.active');
  progress.style.width = ((actives.length - 1) / (circles.length - 1)) * 100 + '%';

  if (currentActive === 1) {
    prev.disabled = true;
  } else if (currentActive === circles.length) {
    next.disabled = true;
  } else {
    prev.disabled = false;
    next.disabled = false;
  }

  // Update content
  stepTitle.textContent = steps[currentActive - 1].title;
  stepDesc.textContent = steps[currentActive - 1].desc;
}

console.log('Progress Steps loaded - KarthikCodingSolutions ⚡');