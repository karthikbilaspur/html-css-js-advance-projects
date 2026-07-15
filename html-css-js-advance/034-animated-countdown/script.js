const nums = document.querySelectorAll('.nums span');
const counter = document.querySelector('.counter');
const finalMessage = document.querySelector('.final');
const replayBtn = document.getElementById('replay');

let isAnimating = false;

// Attach listeners once, not on every runAnimation call
nums.forEach((num, idx) => {
    num.addEventListener('animationend', (e) => {
        if (!isAnimating) return;

        if (e.animationName === 'goIn' && idx!== nums.length - 1) {
            num.classList.remove('in');
            num.classList.add('out');
        } else if (e.animationName === 'goOut' && num.nextElementSibling) {
            num.nextElementSibling.classList.add('in');
        } else if (e.animationName === 'goOut' && idx === nums.length - 1) {
            showFinal();
        }
    });
});

function showFinal() {
    counter.classList.add('hide');
    finalMessage.classList.add('show');
    isAnimating = false;
}

function runAnimation() {
    if (isAnimating) return;
    isAnimating = true;

    // Start with first number
    nums[0].classList.add('in');
}

function resetDOM() {
    isAnimating = false;
    counter.classList.remove('hide');
    finalMessage.classList.remove('show');

    nums.forEach((num) => {
        num.classList.remove('in', 'out');
    });
}

replayBtn.addEventListener('click', () => {
    resetDOM();
    // Small delay to allow DOM to reset before starting animation
    setTimeout(runAnimation, 50);
});

// Handle reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
    // Skip animation, just show final
    counter.style.display = 'none';
    finalMessage.classList.add('show');
} else {
    // Start on load
    runAnimation();
}

// Keyboard support for replay
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        if (finalMessage.classList.contains('show')) {
            replayBtn.click();
        }
    }
});