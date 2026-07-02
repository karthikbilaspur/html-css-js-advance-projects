const textEl = document.getElementById('text');
const speedEl = document.getElementById('speed');
const speedValueEl = document.getElementById('speedValue');

const phrases = [
    'Developer',
    'Designer',
    'Creator',
    'Problem Solver',
    'Coffee Lover',
    'Open Source Fan'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let speed = 300 / speedEl.value;

// Update speed display
speedEl.addEventListener('input', (e) => {
    speedValueEl.textContent = e.target.value;
    speed = 300 / e.target.value;
});

function typeEffect() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        // Remove char
        textEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        // Add char
        textEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    // If word is complete
    if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause at end
        isDeleting = true;
        setTimeout(typeEffect, 1500);
    } else if (isDeleting && charIndex === 0) {
        // Move to next word
        isDeleting = false;
        phraseIndex++;

        // Reset to first phrase
        if (phraseIndex === phrases.length) {
            phraseIndex = 0;
        }

        setTimeout(typeEffect, 500);
    } else {
        // Continue typing/deleting
        const typeSpeed = isDeleting? speed / 2 : speed;
        setTimeout(typeEffect, typeSpeed);
    }
}

// Start the effect
typeEffect();