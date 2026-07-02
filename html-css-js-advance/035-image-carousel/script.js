const track = document.getElementById('track');
const slides = Array.from(track.children);
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('dots');
const playPauseBtn = document.getElementById('playPauseBtn');

let currentIndex = 0;
let isPlaying = true;
let autoplayInterval;
const AUTOPLAY_DELAY = 4000;

// Create dots
slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
});

const dots = Array.from(dotsContainer.children);

function updateCarousel() {
    // Move track
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

function nextSlide() {
    currentIndex++;
    if (currentIndex >= slides.length) {
        currentIndex = 0;
    }
    updateCarousel();
}

function prevSlide() {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = slides.length - 1;
    }
    updateCarousel();
}

function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
    resetAutoplay();
}

function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
    isPlaying = true;
    playPauseBtn.textContent = 'Pause';
}

function stopAutoplay() {
    clearInterval(autoplayInterval);
    isPlaying = false;
    playPauseBtn.textContent = 'Play';
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

// Pause on hover
track.addEventListener('mouseenter', stopAutoplay);
track.addEventListener('mouseleave', () => {
    if (isPlaying) startAutoplay();
});

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        nextSlide();
        resetAutoplay();
    }
    if (touchEndX > touchStartX + 50) {
        prevSlide();
        resetAutoplay();
    }
}

// Start autoplay
startAutoplay();