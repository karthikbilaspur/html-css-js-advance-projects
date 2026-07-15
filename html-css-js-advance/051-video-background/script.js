const video = document.getElementById('bgVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const muteBtn = document.getElementById('muteBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const volumeIcon = document.getElementById('volumeIcon');
const muteIcon = document.getElementById('muteIcon');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

// Play/Pause toggle
playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        video.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
});

// Mute toggle
muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    if (video.muted) {
        volumeIcon.style.display = 'none';
        muteIcon.style.display = 'block';
    } else {
        volumeIcon.style.display = 'block';
        muteIcon.style.display = 'none';
    }
});

// Update time display
video.addEventListener('timeupdate', () => {
    const current = formatTime(video.currentTime);
    const duration = formatTime(video.duration);
    currentTimeEl.textContent = current;
    durationEl.textContent = duration;
});

// Format seconds to MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Handle video load metadata
video.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(video.duration);
});

// Handle video end
video.addEventListener('ended', () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        playPauseBtn.click();
    }
    if (e.code === 'KeyM') {
        muteBtn.click();
    }
});

// Pause video when tab is hidden to save resources
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        video.pause();
    } else {
        video.play();
    }
});

// Handle video errors
video.addEventListener('error', () => {
    console.error('Video failed to load');
    document.querySelector('.video-container').style.background = 
        'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920) center/cover';
});

// Autoplay policy handling
video.play().catch(error => {
    console.log('Autoplay prevented:', error);
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
});