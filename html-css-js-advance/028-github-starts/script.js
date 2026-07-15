const storiesData = [
    {
        username: 'torvalds',
        avatar: 'https://avatars.githubusercontent.com/u/1024025?v=4',
        stories: [
            { type: 'text', content: 'Just merged a new kernel patch 🚀', time: '2h ago' },
            { type: 'image', content: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400', text: 'Coding session at 3am', time: '1h ago' }
        ]
    },
    {
        username: 'gaearon',
        avatar: 'https://avatars.githubusercontent.com/u/810438?v=4',
        stories: [
            { type: 'text', content: 'React 19 RC is out! Check the changelog', time: '5h ago' },
            { type: 'text', content: 'use() hook is pretty cool actually', time: '4h ago' }
        ]
    },
    {
        username: 'sindresorhus',
        avatar: 'https://avatars.githubusercontent.com/u/170270?v=4',
        stories: [
            { type: 'image', content: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400', text: 'Published 3 new npm packages today', time: '8h ago' }
        ]
    },
    {
        username: 'yyx990803',
        avatar: 'https://avatars.githubusercontent.com/u/499550?v=4',
        stories: [
            { type: 'text', content: 'Vue 3.5 performance improvements 🔥', time: '12h ago' },
            { type: 'image', content: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400', text: 'Refactoring the compiler', time: '10h ago' }
        ]
    }
];

const storiesList = document.getElementById('storiesList');
const storyModal = document.getElementById('storyModal');
const closeBtn = document.getElementById('closeBtn');
const storyAvatar = document.getElementById('storyAvatar');
const storyUsername = document.getElementById('storyUsername');
const storyTime = document.getElementById('storyTime');
const storyImage = document.getElementById('storyImage');
const storyText = document.getElementById('storyText');
const progressBar = document.getElementById('progressBar');
const tapLeft = document.getElementById('tapLeft');
const tapRight = document.getElementById('tapRight');

let currentUserIndex = 0;
let currentStoryIndex = 0;
let progressInterval;
let viewedUsers = new Set();
let isPaused = false;

const STORY_DURATION = 3000;

function renderStoriesList() {
    storiesList.innerHTML = '';
    storiesData.forEach((user, index) => {
        const circle = document.createElement('div');
        circle.classList.add('story-circle');
        if (viewedUsers.has(index)) {
            circle.classList.add('viewed');
        }

        circle.innerHTML = `
            <div class="story-avatar-wrapper">
                <img src="${user.avatar}" alt="${user.username}" class="story-avatar-img">
            </div>
            <div class="story-username">${user.username}</div>
        `;

        circle.addEventListener('click', () => openStory(index));
        storiesList.appendChild(circle);
    });
}

function openStory(userIndex) {
    currentUserIndex = userIndex;
    currentStoryIndex = 0;
    storyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    showStory();
}

function showStory() {
    const user = storiesData[currentUserIndex];
    const story = user.stories[currentStoryIndex];

    storyAvatar.src = user.avatar;
    storyUsername.textContent = user.username;
    storyTime.textContent = story.time;

    if (story.type === 'image') {
        storyImage.style.display = 'block';
        storyImage.style.backgroundImage = `url(${story.content})`;
        storyText.textContent = story.text || '';
    } else {
        storyImage.style.display = 'none';
        storyText.textContent = story.content;
    }

    updateProgressBar();
    startProgress();
}

function updateProgressBar() {
    const user = storiesData[currentUserIndex];
    progressBar.innerHTML = '';

    user.stories.forEach((_, index) => {
        const segment = document.createElement('div');
        segment.classList.add('progress-segment');
        if (index < currentStoryIndex) segment.classList.add('completed');
        if (index === currentStoryIndex) segment.classList.add('active');

        const fill = document.createElement('div');
        fill.classList.add('progress-fill');
        segment.appendChild(fill);
        progressBar.appendChild(segment);
    });
}

function startProgress() {
    clearInterval(progressInterval);
    isPaused = false;
    const activeSegment = progressBar.querySelector('.progress-segment.active.progress-fill');
    let width = 0;

    progressInterval = setInterval(() => {
        if (isPaused) return;
        
        width += (100 / (STORY_DURATION / 100));
        if (activeSegment) {
            activeSegment.style.width = `${width}%`;
        }

        if (width >= 100) {
            nextStory();
        }
    }, 100);
}

function pauseProgress() {
    isPaused = true;
}

function resumeProgress() {
    isPaused = false;
}

function nextStory() {
    clearInterval(progressInterval);
    const user = storiesData[currentUserIndex];

    if (currentStoryIndex < user.stories.length - 1) {
        currentStoryIndex++;
        showStory();
    } else {
        nextUser();
    }
}

function prevStory() {
    clearInterval(progressInterval);

    if (currentStoryIndex > 0) {
        currentStoryIndex--;
        showStory();
    } else {
        prevUser();
    }
}

function nextUser() {
    viewedUsers.add(currentUserIndex);

    if (currentUserIndex < storiesData.length - 1) {
        currentUserIndex++;
        currentStoryIndex = 0;
        showStory();
    } else {
        closeStory();
    }
}

function prevUser() {
    if (currentUserIndex > 0) {
        currentUserIndex--;
        currentStoryIndex = storiesData[currentUserIndex].stories.length - 1;
        showStory();
    }
}

function closeStory() {
    clearInterval(progressInterval);
    viewedUsers.add(currentUserIndex);
    storyModal.classList.remove('active');
    document.body.style.overflow = '';
    renderStoriesList();
}

// Event listeners
closeBtn.addEventListener('click', closeStory);
tapLeft.addEventListener('click', prevStory);
tapRight.addEventListener('click', nextStory);

// Pause on hold / mouse down
storyModal.addEventListener('mousedown', pauseProgress);
storyModal.addEventListener('mouseup', resumeProgress);
storyModal.addEventListener('touchstart', pauseProgress);
storyModal.addEventListener('touchend', resumeProgress);

document.addEventListener('keydown', (e) => {
    if (!storyModal.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') prevStory();
    if (e.key === 'ArrowRight') nextStory();
    if (e.key === 'Escape') closeStory();
    if (e.key === ' ') {
        e.preventDefault();
        isPaused? resumeProgress() : pauseProgress();
    }
});

renderStoriesList();