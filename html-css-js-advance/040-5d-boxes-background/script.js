const boxesContainer = document.getElementById('boxes');
const toggleBtn = document.getElementById('toggleBtn');

const BOX_COUNT = window.innerWidth < 768? 40 : 80;
const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
];

let isPaused = false;
let mouseX = 0;
let mouseY = 0;
let rafId = null;
let boxes = [];

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Create boxes
function createBoxes() {
    boxesContainer.innerHTML = '';
    boxes = [];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < BOX_COUNT; i++) {
        const box = document.createElement('div');
        box.classList.add('box');

        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        box.style.left = `${x}%`;
        box.style.top = `${y}%`;

        // Random size
        const size = Math.random() * 40 + 20;
        box.style.width = `${size}px`;
        box.style.height = `${size}px`;

        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];
        box.style.background = color;

        // Random animation delay and duration
        const delay = Math.random() * 20;
        const duration = Math.random() * 10 + 15;
        box.style.animationDelay = `${delay}s`;
        box.style.animationDuration = `${duration}s`;

        // Store base z-depth for parallax calc
        const z = Math.random() * 400 - 200;
        box.style.setProperty('--z', `${z}px`);
        box.dataset.speed = ((i % 5) + 1) * 0.5;

        fragment.appendChild(box);
        boxes.push(box);
    }

    boxesContainer.appendChild(fragment);
}

// Parallax update loop - doesn't kill CSS animation
function updateParallax() {
    if (isPaused || prefersReducedMotion) {
        rafId = requestAnimationFrame(updateParallax);
        return;
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    boxes.forEach((box) => {
        const speed = parseFloat(box.dataset.speed);
        const x = (mouseX - centerX) * speed * 0.05;
        const y = (mouseY - centerY) * speed * 0.05;

        box.style.setProperty('--x', `${x}px`);
        box.style.setProperty('--y', `${y}px`);
    });

    rafId = requestAnimationFrame(updateParallax);
}

// Mouse move - just update coords, RAF handles the rest
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Touch support
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
}, { passive: true });

// Pause/Play toggle
toggleBtn.addEventListener('click', () => {
    isPaused =!isPaused;
    document.body.classList.toggle('paused', isPaused);
    toggleBtn.textContent = isPaused? 'Resume Animation' : 'Pause Animation';
    toggleBtn.setAttribute('aria-pressed', isPaused);
    toggleBtn.setAttribute('aria-label', isPaused? 'Resume animation' : 'Pause animation');
});

// Handle resize - debounce recreation
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const newBoxCount = window.innerWidth < 768? 40 : 80;
        if (newBoxCount!== BOX_COUNT) {
            // Would need to reload or recreate - for now just log
            console.log('Resize detected, reload for optimal box count');
        }
    }, 250);
});

// Init
if (prefersReducedMotion) {
    document.body.classList.add('paused');
    toggleBtn.textContent = 'Animation Disabled';
    toggleBtn.disabled = true;
    createBoxes();
} else {
    createBoxes();
    updateParallax();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
});