const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const indicator = document.getElementById('indicator');

let currentPage = 'home';

// Switch page
navBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const pageId = btn.dataset.page;
        switchPage(pageId, index);
    });
});

function switchPage(pageId, index) {
    // Update active nav button
    navBtns.forEach(btn => btn.classList.remove('active'));
    navBtns[index].classList.add('active');

    // Move indicator
    indicator.style.transform = `translateX(${index * 100}%)`;

    // Switch page content
    pages.forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    targetPage.classList.add('active');

    currentPage = pageId;

    // Haptic feedback simulation
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

// Swipe support
let touchStartX = 0;
let touchEndX = 0;
const content = document.querySelector('.content');

content.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

content.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) < swipeThreshold) return;

    const currentIndex = Array.from(navBtns).findIndex(btn => btn.dataset.page === currentPage);

    if (diff > 0 && currentIndex < navBtns.length - 1) {
        // Swipe left - next tab
        const nextBtn = navBtns[currentIndex + 1];
        switchPage(nextBtn.dataset.page, currentIndex + 1);
    } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - prev tab
        const prevBtn = navBtns[currentIndex - 1];
        switchPage(prevBtn.dataset.page, currentIndex - 1);
    }
}

// Initialize
indicator.style.transform = 'translateX(0%)';