const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const indicator = document.getElementById('indicator');
const content = document.querySelector('.content');

let currentPage = 'home';
let pageScrollPositions = {};

// Calculate and set indicator position
function updateIndicator(index) {
    const activeBtn = navBtns[index];
    const btnRect = activeBtn.getBoundingClientRect();
    const navRect = activeBtn.parentElement.getBoundingClientRect();

    indicator.style.width = `${btnRect.width}px`;
    indicator.style.transform = `translateX(${btnRect.left - navRect.left}px)`;
}

// Switch page
navBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const pageId = btn.dataset.page;
        switchPage(pageId, index, btn);
    });

    // Keyboard support
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && index > 0) {
            navBtns[index - 1].focus();
            navBtns[index - 1].click();
        } else if (e.key === 'ArrowRight' && index < navBtns.length - 1) {
            navBtns[index + 1].focus();
            navBtns[index + 1].click();
        }
    });
});

function switchPage(pageId, index, btnElement) {
    // Save scroll position of current page
    const currentPageEl = document.getElementById(currentPage);
    pageScrollPositions[currentPage] = currentPageEl.scrollTop;

    // Update active nav button
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    btnElement.classList.add('active');
    btnElement.setAttribute('aria-selected', 'true');

    // Move indicator
    updateIndicator(index);

    // Switch page content
    pages.forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    targetPage.classList.add('active');

    // Restore scroll position
    targetPage.scrollTop = pageScrollPositions[pageId] || 0;

    // Focus management for accessibility
    targetPage.focus();
    targetPage.setAttribute('tabindex', '-1');

    currentPage = pageId;

    // Haptic feedback simulation
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

// Swipe support - only on content area, not on buttons
let touchStartX = 0;
let touchEndX = 0;
let isSwiping = false;

content.addEventListener('touchstart', (e) => {
    // Don't swipe if touching a button or input
    if (e.target.closest('button, input,.create-btn,.result-item')) return;
    touchStartX = e.changedTouches[0].screenX;
    isSwiping = true;
}, { passive: true });

content.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    // Prevent scroll if horizontal swipe detected
    const diff = Math.abs(e.changedTouches[0].screenX - touchStartX);
    if (diff > 10) {
        e.preventDefault();
    }
}, { passive: false });

content.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    isSwiping = false;
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) < swipeThreshold) return;

    const currentIndex = Array.from(navBtns).findIndex(btn => btn.dataset.page === currentPage);

    if (diff > 0 && currentIndex < navBtns.length - 1) {
        // Swipe left - next tab
        navBtns[currentIndex + 1].click();
    } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - prev tab
        navBtns[currentIndex - 1].click();
    }
}

// Initialize indicator position on load
window.addEventListener('load', () => {
    updateIndicator(0);
});

window.addEventListener('resize', () => {
    const activeIndex = Array.from(navBtns).findIndex(btn => btn.classList.contains('active'));
    updateIndicator(activeIndex);
});

// Handle reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReducedMotion.matches) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.transition = 'none';
    });
}