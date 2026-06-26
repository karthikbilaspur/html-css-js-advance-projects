const boxesContainer = document.getElementById('boxes');
const toggleBtn = document.getElementById('toggleBtn');

const BOX_COUNT = 80;
const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
];

let isPaused = false;

// Create boxes
function createBoxes() {
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

        // Random depth
        const z = Math.random() * 400 - 200;
        box.style.transform = `translateZ(${z}px)`;

        boxesContainer.appendChild(box);
    }
}

// Parallax effect on mouse move
document.addEventListener('mousemove', (e) => {
    if (isPaused) return;

    const boxes = document.querySelectorAll('.box');
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    boxes.forEach((box, index) => {
        const speed = (index % 5 + 1) * 0.5;
        const x = mouseX * speed * 50;
        const y = mouseY * speed * 50;

        box.style.transform = `translateX(${x}px) translateY(${y}px) rotateX(${y}deg) rotateY(${x}deg)`;
    });
});

// Pause/Play toggle
toggleBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    document.body.classList.toggle('paused', isPaused);
    toggleBtn.textContent = isPaused ? 'Resume Animation' : 'Pause Animation';
});

// Reset positions when mouse leaves
document.addEventListener('mouseleave', () => {
    if (isPaused) return;

    const boxes = document.querySelectorAll('.box');
    boxes.forEach(box => {
        box.style.transform = '';
    });
});

// Init
createBoxes();