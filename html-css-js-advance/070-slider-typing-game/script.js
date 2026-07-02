// Array of images with captions for typing game
const slides = [
    { img: 'https://picsum.photos/id/1018/900/400', caption: 'mountain landscape' },
    { img: 'https://picsum.photos/id/1025/900/400', caption: 'cute dog portrait' },
    { img: 'https://picsum.photos/id/1039/900/400', caption: 'forest waterfall' },
    { img: 'https://picsum.photos/id/1043/900/400', caption: 'city skyline night' },
    { img: 'https://picsum.photos/id/1050/900/400', caption: 'ocean beach sunset' },
    { img: 'https://picsum.photos/id/1062/900/400', caption: 'desert sand dunes' },
    { img: 'https://picsum.photos/id/1074/900/400', caption: 'tiger in jungle' }
];

let currentIndex = 0;
let isFadeMode = false;
let autoplay = false;
let autoplayInterval;
let score = 0;
let startTime = null;
let typedChars = 0;
let errors = 0;

const slider = document.getElementById('slider');
const thumbnails = document.getElementById('thumbnails');
const dots = document.getElementById('dots');
const captionTarget = document.getElementById('caption-target');
const typingInput = document.getElementById('typing-input');
const progress = document.getElementById('progress');
const scoreEl = document.getElementById('score');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');

// Init slider
function initSlider() {
    slides.forEach((slide, i) => {
        // Main slide
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';
        if (i === 0) slideDiv.classList.add('active');
        slideDiv.innerHTML = `
            <img src="${slide.img}" alt="${slide.caption}">
            <div class="slide-caption">${slide.caption}</div>
        `;
        slider.appendChild(slideDiv);

        // Thumbnail
        const thumb = document.createElement('div');
        thumb.className = 'thumb';
        if (i === 0) thumb.classList.add('active');
        thumb.innerHTML = `<img src="${slide.img}" alt="">`;
        thumb.addEventListener('click', () => goToSlide(i));
        thumbnails.appendChild(thumb);

        // Dot
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dots.appendChild(dot);
    });

    updateTypingTarget();
}

function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    if (isFadeMode) {
        document.querySelectorAll('.slide').forEach((s, i) => {
            s.classList.toggle('active', i === currentIndex);
        });
    } else {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    // Update active states
    document.querySelectorAll('.thumb').forEach((t, i) => {
        t.classList.toggle('active', i === currentIndex);
    });
    document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentIndex);
    });

    resetTyping();
    updateTypingTarget();
}

function updateTypingTarget() {
    const caption = slides[currentIndex].caption;
    captionTarget.innerHTML = caption.split('').map(char =>
        `<span>${char}</span>`
    ).join('');
}

function resetTyping() {
    typingInput.value = '';
    progress.style.width = '0%';
    typedChars = 0;
    errors = 0;
    startTime = null;
    updateStats();
}

// Typing game logic
typingInput.addEventListener('input', () => {
    const target = slides[currentIndex].caption;
    const typed = typingInput.value;

    if (!startTime && typed.length > 0) startTime = new Date();

    const spans = captionTarget.querySelectorAll('span');
    let correctCount = 0;
    errors = 0;

    spans.forEach((span, i) => {
        const char = typed[i];
        if (char == null) {
            span.className = '';
        } else if (char === span.textContent) {
            span.className = 'correct';
            correctCount++;
        } else {
            span.className = 'incorrect';
            errors++;
        }
    });

    // Current character underline
    if (spans[typed.length]) spans[typed.length].className = 'current';

    // Progress bar
    const progressPercent = typed.length / target.length * 100;
    progress.style.width = `${progressPercent}%`;

    typedChars = typed.length;
    updateStats();

    // Completed
    if (typed === target) {
        score += 10;
        scoreEl.textContent = score;
        setTimeout(() => {
            goToSlide(currentIndex + 1);
        }, 500);
    }
});

function updateStats() {
    if (!startTime || typedChars === 0) {
        wpmEl.textContent = '0';
        accuracyEl.textContent = '100%';
        return;
    }

    const timeElapsed = (new Date() - startTime) / 1000 / 60; // minutes
    const wpm = Math.round(typedChars / 5 / timeElapsed) || 0;
    const accuracy = Math.round((typedChars - errors) / typedChars * 100) || 100;

    wpmEl.textContent = wpm;
    accuracyEl.textContent = `${accuracy}%`;
}

// Controls
document.getElementById('next').onclick = () => goToSlide(currentIndex + 1);
document.getElementById('prev').onclick = () => goToSlide(currentIndex - 1);

document.getElementById('mode-toggle').onclick = (e) => {
    isFadeMode =!isFadeMode;
    e.target.textContent = `Mode: ${isFadeMode? 'Fade' : 'Slide'}`;
    e.target.classList.toggle('active');
    slider.classList.toggle('fade', isFadeMode);
    goToSlide(currentIndex); // Refresh
};

document.getElementById('autoplay-toggle').onclick = (e) => {
    autoplay =!autoplay;
    e.target.textContent = `Autoplay: ${autoplay? 'On' : 'Off'}`;
    e.target.classList.toggle('active');

    if (autoplay) {
        autoplayInterval = setInterval(() => goToSlide(currentIndex + 1), 4000);
    } else {
        clearInterval(autoplayInterval);
    }
};

// Touch swipe
let touchStartX = 0;
slider.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

slider.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) goToSlide(currentIndex + 1);
    if (touchEndX > touchStartX + 50) goToSlide(currentIndex - 1);
});

// Keyboard nav
document.addEventListener('keydown', e => {
    if (document.activeElement === typingInput) return;
    if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
});

initSlider();