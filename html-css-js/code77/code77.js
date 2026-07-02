// JavaScript for Code 77
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const coverImg = document.getElementById('cover');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const trackListEl = document.getElementById('track-list');
const playerEl = document.querySelector('.player');

// Playlist - using royalty-free audio
const playlist = [
    {
        title: 'Lofi Study Beats',
        artist: 'Chill Collective',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'
    },
    {
        title: 'Ambient Dreams',
        artist: 'Nature Sounds',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop'
    },
    {
        title: 'Midnight Jazz',
        artist: 'Smooth Trio',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop'
    },
    {
        title: 'Ocean Waves',
        artist: 'Relaxation',
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        cover: 'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=400&h=400&fit=crop'
    }
];

let currentTrack = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// Format time in MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Load track
function loadTrack(index) {
    const track = playlist[index];
    audio.src = track.src;
    coverImg.src = track.cover;
    titleEl.textContent = track.title;
    artistEl.textContent = track.artist;

    updatePlaylistActive();
}

// Update playlist UI
function updatePlaylistActive() {
    document.querySelectorAll('.track-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === currentTrack);
    });
}

// Play/Pause
function togglePlay() {
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
}

function playTrack() {
    audio.play();
    isPlaying = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playerEl.classList.add('playing');
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    playerEl.classList.remove('playing');
}

// Next/Prev
function nextTrack() {
    if (isShuffle) {
        currentTrack = Math.floor(Math.random() * playlist.length);
    } else {
        currentTrack = (currentTrack + 1) % playlist.length;
    }
    loadTrack(currentTrack);
    if (isPlaying) playTrack();
}

function prevTrack() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
    } else {
        currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrack);
        if (isPlaying) playTrack();
    }
}

// Update progress bar
function updateProgress() {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.value = progressPercent;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
}

// Set progress
function setProgress(e) {
    const width = e.target.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

// Render playlist
function renderPlaylist() {
    trackListEl.innerHTML = playlist.map((track, idx) => `
        <div class="track-item ${idx === currentTrack? 'active' : ''}" data-index="${idx}">
            <img src="${track.cover}" alt="${track.title}">
            <div class="track-item-info">
                <div class="track-item-title">${track.title}</div>
                <div class="track-item-artist">${track.artist}</div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.track-item').forEach(item => {
        item.addEventListener('click', () => {
            currentTrack = parseInt(item.dataset.index);
            loadTrack(currentTrack);
            playTrack();
        });
    });
}

// Event listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);

audio.addEventListener('play', playTrack);
audio.addEventListener('pause', pauseTrack);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.currentTime = 0;
        playTrack();
    } else {
        nextTrack();
    }
});

progress.addEventListener('input', (e) => {
    const time = (e.target.value / 100) * audio.duration;
    audio.currentTime = time;
});

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
});

shuffleBtn.addEventListener('click', () => {
    isShuffle =!isShuffle;
    shuffleBtn.classList.toggle('active');
});

repeatBtn.addEventListener('click', () => {
    isRepeat =!isRepeat;
    repeatBtn.classList.toggle('active');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName!== 'INPUT') {
        e.preventDefault();
        togglePlay();
    }
    if (e.code === 'ArrowRight') nextTrack();
    if (e.code === 'ArrowLeft') prevTrack();
});

// Init
audio.volume = 0.7;
renderPlaylist();
loadTrack(0);