const imageContainer = document.getElementById('imageContainer');
const heartOverlay = document.getElementById('heartOverlay');
const likeBtn = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');

let likes = 0;
let clickTimeout = null;
let lastClickTime = 0;
const DOUBLE_CLICK_DELAY = 300;

// Double click detection
imageContainer.addEventListener('click', (e) => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;

    if (timeDiff < DOUBLE_CLICK_DELAY && timeDiff > 0) {
        // Double click detected
        handleLike(e);
        clearTimeout(clickTimeout);
    } else {
        // Wait to see if it's a double click
        clickTimeout = setTimeout(() => {
            // Single click - do nothing
        }, DOUBLE_CLICK_DELAY);
    }

    lastClickTime = currentTime;
});

// Button click also triggers like
likeBtn.addEventListener('click', (e) => {
    handleLike(e);
});

function handleLike(e) {
    likes++;
    updateLikeCount();

    // Animate button heart
    likeBtn.classList.add('liked');
    setTimeout(() => likeBtn.classList.remove('liked'), 300);

    // Show center heart burst
    heartOverlay.classList.add('show');
    setTimeout(() => heartOverlay.classList.remove('show'), 800);

    // Create floating heart at click position
    createFloatingHeart(e);
}

function updateLikeCount() {
    likeCount.textContent = `${likes} ${likes === 1 ? 'like' : 'likes'}`;
}

function createFloatingHeart(e) {
    const rect = imageContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    heart.textContent = '❤️';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    imageContainer.appendChild(heart);

    // Remove after animation
    setTimeout(() => heart.remove(), 1000);
}

// Prevent image drag
imageContainer.addEventListener('dragstart', (e) => e.preventDefault());