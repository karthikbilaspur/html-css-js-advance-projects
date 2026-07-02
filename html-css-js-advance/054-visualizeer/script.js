// Demo playlist with royalty-free tracks
const playlist = [
    {
        title: "Summer Nights",
        artist: "Lofi Collective",
        album: "Chill Vibes",
        url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
        duration: "2:30"
    },
    {
        title: "Midnight Drive",
        artist: "Synth Wave",
        album: "Neon Dreams",
        url: "https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3",
        duration: "3:15"
    },
    {
        title: "Ocean Breeze",
        artist: "Nature Sounds",
        album: "Ambient",
        url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_8f0d3a1e2d.mp3",
        duration: "4:02"
    },
    {
        title: "Urban Echo",
        artist: "Beat Maker",
        album: "City Life",
        url: "https://cdn.pixabay.com/download/audio/2023/01/06/audio_59c8d5a6d3.mp3",
        duration: "2:48"
    }
];

// DOM Elements
const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const songAlbum = document.getElementById('songAlbum');
const albumArt = document.getElementById('albumArt');
const playlistEl = document.getElementById('playlist');
const playlistCount = document.getElementById('playlistCount');
const visualizer = document.getElementById('visualizer');

// State
let currentTrack = 0;
let isShuffled = false;
let isRepeating = false;
let audioContext, analyser, dataArray, bufferLength;
let animationId;

// Canvas setup
const canvas = visualizer;
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth * 2;
canvas.height = canvas.offsetHeight * 2;

// Init
function init() {
    renderPlaylist();
    loadTrack(currentTrack);
    audio.volume = 0.7;
    setupAudioContext();
}

function setupAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

function loadTrack(index) {
    const track = playlist[index];
    audio.src = track.url;
    songTitle.textContent = track.title;
    songArtist.textContent = track.artist;
    songAlbum.textContent = track.album;

    // Update playlist UI
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    // Generate random gradient for album art
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ];
    albumArt.style.background = gradients[index % gradients.length];
}

function playTrack() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    audio.play();
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    drawVisualizer();
}

function pauseTrack() {
    audio.pause();
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    cancelAnimationFrame(animationId);
}

function nextTrack() {
    if (isShuffled) {
        currentTrack = Math.floor(Math.random() * playlist.length);
    } else {
        currentTrack = (currentTrack + 1) % playlist.length;
    }
    loadTrack(currentTrack);
    playTrack();
}

function prevTrack() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
    } else {
        currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrack);
        playTrack();
    }
}

function renderPlaylist() {
    playlistEl.innerHTML = playlist.map((track, index) => `
        <div class="playlist-item ${index === currentTrack? 'active' : ''}" data-index="${index}">
            <div class="playlist-item-cover">🎵</div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${track.title}</div>
                <div class="playlist-item-artist">${track.artist}</div>
            </div>
            <div class="playlist-item-duration">${track.duration}</div>
        </div>
    `).join('');

    playlistCount.textContent = `${playlist.length} songs`;

    document.querySelectorAll('.playlist-item').forEach(item => {
        item.addEventListener('click', () => {
            currentTrack = parseInt(item.dataset.index);
            loadTrack(currentTrack);
            playTrack();
        });
    });
}

function drawVisualizer() {
    animationId = requestAnimationFrame(drawVisualizer);

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        const r = 102 + (dataArray[i] / 255) * 100;
        const g = 126 + (dataArray[i] / 255) * 50;
        const b = 234;

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}

// Event Listeners
playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        playTrack();
    } else {
        pauseTrack();
    }
});

nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

shuffleBtn.addEventListener('click', () => {
    isShuffled =!isShuffled;
    shuffleBtn.classList.toggle('active');
});

repeatBtn.addEventListener('click', () => {
    isRepeating =!isRepeating;
    repeatBtn.classList.toggle('active');
});

audio.addEventListener('ended', () => {
    if (isRepeating) {
        audio.currentTime = 0;
        playTrack();
    } else {
        nextTrack();
    }
});

audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${progress}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
});

volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    audio.volume = volume;
    volumeValue.textContent = `${e.target.value}%`;
});

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName!== 'INPUT') {
        e.preventDefault();
        playPauseBtn.click();
    }
    if (e.code === 'ArrowRight') nextTrack();
    if (e.code === 'ArrowLeft') prevTrack();
});

// Start
init();