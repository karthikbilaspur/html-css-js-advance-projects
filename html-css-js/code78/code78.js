// JavaScript for Code 78
const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const loopBtn = document.getElementById('loop-btn');
const progressBar = document.getElementById('progress');
const seekBar = document.getElementById('seek-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume');
const playlistEl = document.getElementById('playlist');
const coverImg = document.getElementById('cover');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const trackCountEl = document.getElementById('track-count');

// Array of tracks - using royalty-free demo URLs
const tracks = [
    {
        title: "Summer Vibes",
        artist: "Audio Lib",
        src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
        cover: "https://picsum.photos/400/400?random=1",
        duration: "2:45"
    },
    {
        title: "Chill Abstract",
        artist: "Sound Gallery",
        src: "https://cdn.pixabay.com/download/audio/2022/08/03/audio_54ca749c2e.mp3",
        cover: "https://picsum.photos/400/400?random=2",
        duration: "3:12"
    },
    {
        title: "Electronic Dreams",
        artist: "Music Hive",
        src: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946a25c4c5.mp3",
        cover: "https://picsum.photos/400/400?random=3",
        duration: "2:58"
    },
    {
        title: "Night City",
        artist: "Urban Beats",
        src: "https://cdn.pixabay.com/download/audio/2023/05/18/audio_91b53f89c9.mp3",
        cover: "https://picsum.photos/400/400?random=4",
        duration: "3:24"
    },
    {
        title: "Peaceful Morning",
        artist: "Nature Sounds",
        src: "https://cdn.pixabay.com/download/audio/2022/11/22/audio_55ad2f67c8.mp3",
        cover: "https://picsum.photos/400/400?random=5",
        duration: "4:01"
    }
];

let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isLoop = false;
let shuffledIndices = [];

// Initialize
function init() {
    renderPlaylist();
    loadTrack(currentTrackIndex);
    audio.volume = 0.7;
}

function renderPlaylist() {
    playlistEl.innerHTML = '';
    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === currentTrackIndex) item.classList.add('active');

        item.innerHTML = `
            <img src="${track.cover}" alt="${track.title}">
            <div class="track-details">
                <h4>${track.title}</h4>
                <p>${track.artist}</p>
            </div>
            <div class="track-duration">${track.duration}</div>
        `;

        item.addEventListener('click', () => {
            loadTrack(index);
            playAudio();
        });

        playlistEl.appendChild(item);
    });

    trackCountEl.textContent = `${tracks.length} tracks`;
}

function loadTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];

    audio.src = track.src;
    coverImg.src = track.cover;
    titleEl.textContent = track.title;
    artistEl.textContent = track.artist;

    // Update playlist UI
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
}

function playAudio() {
    audio.play();
    isPlaying = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseAudio() {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function togglePlay() {
    isPlaying? pauseAudio() : playAudio();
}

function nextTrack() {
    if (isShuffle) {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * tracks.length);
        } while (nextIndex === currentTrackIndex && tracks.length > 1);
        currentTrackIndex = nextIndex;
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    }

    loadTrack(currentTrackIndex);
    if (isPlaying) playAudio();
}

function prevTrack() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) playAudio();
    }
}

function toggleShuffle() {
    isShuffle =!isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
}

function toggleLoop() {
    isLoop =!isLoop;
    loopBtn.classList.toggle('active', isLoop);
    audio.loop = isLoop;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateProgress() {
    const { currentTime, duration } = audio;
    const percent = (currentTime / duration) * 100;

    progressBar.style.width = `${percent}%`;
    seekBar.value = percent;

    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent = formatTime(duration);
}

// Event listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
shuffleBtn.addEventListener('click', toggleShuffle);
loopBtn.addEventListener('click', toggleLoop);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', updateProgress);
audio.addEventListener('ended', () => {
    if (!isLoop) nextTrack();
});

seekBar.addEventListener('input', (e) => {
    const percent = e.target.value;
    audio.currentTime = (percent / 100) * audio.duration;
});

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
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
init();