const textEl = document.getElementById('text');
const speedEl = document.getElementById('speed');
const speedValueEl = document.getElementById('speedValue');
const pauseBtn = document.getElementById('pauseBtn');

const phrases = [
    'Developer',
    'Designer', 
    'Creator',
    'Problem Solver',
    'Coffee Lover',
    'Open Source Fan',
    'Bangalore Coder'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isPaused = false;
let timeoutId = null;

// Load speed from localStorage
const savedSpeed = localStorage.getItem('typeSpeed');
if (savedSpeed) {
    speedEl.value = savedSpeed;
    speedValueEl.textContent = savedSpeed;
}

let speed = 300 / speedEl.value;

speedEl.addEventListener('input', (e) => {
    speedValueEl.textContent = e.target.value;
    speed = 300 / e.target.value;
    localStorage.setItem('typeSpeed', e.target.value);
});

pauseBtn.addEventListener('click', () => {
    isPaused =!isPaused;
    pauseBtn.textContent = isPaused? '▶' : '⏸';
    pauseBtn.setAttribute('aria-label', isPaused? 'Resume typing' : 'Pause typing');
    textEl.classList.toggle('paused', isPaused);
    if (!isPaused) typeEffect();
});

// Click text to pause/resume too
textEl.addEventListener('click', () => pauseBtn.click());

function typeEffect() {
    if (isPaused) return;
    
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
        textEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        textEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause at end of word
        isDeleting = true;
        timeoutId = setTimeout(typeEffect, 1500);
    } else if (isDeleting && charIndex === 0) {
        // Move to next word
        isDeleting = false;
        phraseIndex++;
        
        if (phraseIndex === phrases.length) {
            phraseIndex = 0;
        }
        
        timeoutId = setTimeout(typeEffect, 500);
    } else {
        // Variable speed: slower for punctuation, faster for deleting
        let typeSpeed = speed;
        if (isDeleting) typeSpeed /= 2;
        
        // Add randomness for human feel
        typeSpeed += Math.random() * 50;
        
        timeoutId = setTimeout(typeEffect, typeSpeed);
    }
}

// Start the effect
typeEffect();

// Keyboard: Space to pause
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        pauseBtn.click();
    }
});