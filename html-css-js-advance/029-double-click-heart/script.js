const imageContainer = document.getElementById('imageContainer');
const heartOverlay = document.getElementById('heartOverlay');
const likeBtn = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');

let likes = 0;
let isLiked = false;
let clickTimeout = null;
let lastClickTime = 0;
const DOUBLE_CLICK_DELAY = 300;

// Double click/tap detection
imageContainer.addEventListener('click', handleImageClick);
imageContainer.addEventListener('touchend', handleImageClick);

function handleImageClick(e) {
    // Prevent ghost clicks on mobile
    if (e.type === 'touchend') e.preventDefault();
    
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
}

// Button click toggles like/unlike
likeBtn.addEventListener('click', () => {
    if (isLiked) {
        unlikePost();
    } else {
        handleLike();
    }
});

function handleLike(e) {
    if (isLiked) return; // Already liked, ignore double-tap likes
    
    isLiked = true;
    likes++;
    updateLikeCount();

    // Animate button heart
    likeBtn.classList.add('liked');

    // Show center heart burst
    heartOverlay.classList.add('show');
    setTimeout(() => heartOverlay.classList.remove('show'), 800);

    // Create floating hearts
    if (e) {
        createFloatingHeart(e);
        // Add 2-3 extra hearts for effect
        setTimeout(() => createFloatingHeart(e, true), 100);
        setTimeout(() => createFloatingHeart(e, true), 200);
    }
}

function unlikePost() {
    isLiked = false;
    likes = Math.max(0, likes - 1);
    updateLikeCount();
    likeBtn.classList.remove('liked');
}

function updateLikeCount() {
    likeCount.textContent = `${likes} ${likes === 1? 'like' : 'likes'}`;
}

function createFloatingHeart(e, random = false) {
    const rect = imageContainer.getBoundingClientRect();
    let x, y;

    if (random) {
        // Random position near the tap
        x = (e.clientX || e.changedTouches[0].clientX) - rect.left + (Math.random() * 60 - 30);
        y = (e.clientY || e.changedTouches[0].clientY) - rect.top + (Math.random() * 60 - 30);
    } else {
        x = (e.clientX || e.changedTouches[0].clientX) - rect.left;
        y = (e.clientY || e.changedTouches[0].clientY) - rect.top;
    }

    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    heart.textContent = '❤';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    imageContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
}

// Prevent image drag
imageContainer.addEventListener('dragstart', (e) => e.preventDefault());

// Keyboard support: L to like
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'l') {
        isLiked? unlikePost() : handleLike();
    }
});