const emojiOptions = document.querySelectorAll('.emoji-option');
const stars = document.querySelectorAll('.star');
const tags = document.querySelectorAll('.tag');
const comment = document.getElementById('comment');
const charCount = document.getElementById('charCount');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const feedbackCard = document.getElementById('feedbackCard');
const successCard = document.getElementById('successCard');
const submittedRating = document.getElementById('submittedRating');

let selectedRating = 0;
let selectedEmoji = '';
let selectedTags = [];

// Emoji rating
emojiOptions.forEach(option => {
    option.addEventListener('click', () => {
        emojiOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedRating = parseInt(option.dataset.rating);
        selectedEmoji = option.querySelector('.emoji').textContent;
        updateStars(selectedRating);
        checkFormValidity();
    });
});

// Star rating
stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.value);
        updateStars(selectedRating);
        updateEmojis(selectedRating);
        checkFormValidity();
    });

    star.addEventListener('mouseover', () => {
        const value = parseInt(star.dataset.value);
        highlightStars(value);
    });
});

document.getElementById('starRating').addEventListener('mouseleave', () => {
    updateStars(selectedRating);
});

function updateStars(rating) {
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

function highlightStars(rating) {
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

function updateEmojis(rating) {
    emojiOptions.forEach(opt => opt.classList.remove('selected'));
    if (rating > 0) {
        emojiOptions[rating - 1].classList.add('selected');
        selectedEmoji = emojiOptions[rating - 1].querySelector('.emoji').textContent;
    }
}

// Tags
tags.forEach(tag => {
    tag.addEventListener('click', () => {
        tag.classList.toggle('selected');
        const tagValue = tag.dataset.tag;
        if (tag.classList.contains('selected')) {
            selectedTags.push(tagValue);
        } else {
            selectedTags = selectedTags.filter(t => t !== tagValue);
        }
    });
});

// Character count
comment.addEventListener('input', (e) => {
    const length = e.target.value.length;
    charCount.textContent = length;
    if (length > 500) {
        e.target.value = e.target.value.substring(0, 500);
        charCount.textContent = 500;
    }
});

// Check if form is valid
function checkFormValidity() {
    submitBtn.disabled = selectedRating === 0;
}

// Submit
submitBtn.addEventListener('click', async () => {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const feedback = {
        rating: selectedRating,
        emoji: selectedEmoji,
        tags: selectedTags,
        comment: comment.value,
        timestamp: new Date().toISOString()
    };

    console.log('Feedback submitted:', feedback);

    // Show success
    submittedRating.textContent = selectedEmoji.repeat(selectedRating);
    feedbackCard.classList.add('hide');
    successCard.classList.add('show');
});

// Reset
resetBtn.addEventListener('click', () => {
    // Reset form
    selectedRating = 0;
    selectedEmoji = '';
    selectedTags = [];
    comment.value = '';
    charCount.textContent = '0';

    emojiOptions.forEach(opt => opt.classList.remove('selected'));
    stars.forEach(star => star.classList.remove('active'));
    tags.forEach(tag => tag.classList.remove('selected'));

    submitBtn.classList.remove('loading');
    submitBtn.disabled = true;

    successCard.classList.remove('show');
    feedbackCard.classList.remove('hide');
});

// Init
checkFormValidity();