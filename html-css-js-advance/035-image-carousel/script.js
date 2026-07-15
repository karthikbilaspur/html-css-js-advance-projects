const track = document.getElementById('track');
const slides = Array.from(track.children);
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('dots');
const playPauseBtn = document.getElementById('playPauseBtn');

let currentIndex = 0;
let isPlaying = false;
let autoplayInterval;
const AUTOPLAY_DELAY = 4000;

// Create dots with proper accessibility
slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${index + 1}: ${slide.querySelector('h3').textContent}`);
    if (index === 0) {
        dot.classList.add('active');
        dot.setAttribute('aria-selected', 'true');
    } else {
        dot.setAttribute('aria-selected', 'false');
    }
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
});

const dots = Array.from(dotsContainer.children);

function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, index) => {
        const isActive = index === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive);
    });

    // Update slide aria
    slides.forEach((slide, index) => {
        slide.setAttribute('aria-hidden', index!== currentIndex);
    });
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
}

function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
    resetAutoplay();
}

function startAutoplay() {
    if (autoplayInterval) clearInterval(autoplayInterval);
    autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
    isPlaying = true;
    playPauseBtn.textContent = 'Pause';
    playPauseBtn.setAttribute('aria-label', 'Pause autoplay');
}

function stopAutoplay() {
    clearInterval(autoplayInterval);
    isPlaying = false;
    playPauseBtn.textContent = 'Play';
    playPauseBtn.setAttribute('aria-label', 'Start autoplay');
}

function resetAutoplay() {
    if (isPlaying) {
        clearInterval(autoplayInterval);
        startAutoplay();
    }
}

// Event listeners
nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoplay();
});

prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoplay();
});

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        stopAutoplay();
    } else {
        startAutoplay();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevSlide();
        resetAutoplay();
    }
    if (e.key === 'ArrowRight') {
        nextSlide();
        resetAutoplay();
    }
});

// Pause on hover/focus
const carousel = document.querySelector('.carousel');
carousel.addEventListener('mouseenter', () => {
    if (isPlaying) clearInterval(autoplayInterval);
});
carousel.addEventListener('mouseleave', () => {
    if (isPlaying) startAutoplay();
});
carousel.addEventListener('focusin', () => {
    if (isPlaying) clearInterval(autoplayInterval);
});
carousel.addEventListener('focusout', () => {
    if (isPlaying) startAutoplay();
});

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;
let isSwiping = false;

track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    isSwiping = true;
}, { passive: true });

track.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    const currentX = e.changedTouches[0].screenX;
    const diff = currentX - touchStartX;
    // Prevent vertical scroll if horizontal swipe
    if (Math.abs(diff) > 10) {
        e.preventDefault();
    }
}, { passive: false });

track.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    isSwiping = false;
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchEndX - touchStartX;

    if (diff < -swipeThreshold) {
        nextSlide();
        resetAutoplay();
    }
    if (diff > swipeThreshold) {
        prevSlide();
        resetAutoplay();
    }
}

// Init
slides.forEach((slide, index) => {
    slide.setAttribute('aria-hidden', index!== 0);
});
updateCarousel();
startAutoplay();