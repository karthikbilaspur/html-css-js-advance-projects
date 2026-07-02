// JavaScript for Code 79
const pads = document.querySelectorAll('.drum-pad');
const volumeSlider = document.getElementById('volume');
const volumeDisplay = document.getElementById('volume-display');
const recordBtn = document.getElementById('record-btn');
const playBtn = document.getElementById('play-btn');
const clearBtn = document.getElementById('clear-btn');
const visualizer = document.getElementById('visualizer');
const recordingInfo = document.getElementById('recording-info');
const recTimeEl = document.getElementById('rec-time');

// Web Audio API setup
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
analyser.connect(audioContext.destination);

const gainNode = audioContext.createGain();
gainNode.connect(analyser);
gainNode.gain.value = 0.7;

// Drum sounds using oscillators - no external files needed
const sounds = {
    kick: () => createKick(),
    snare: () => createSnare(),
    hihat: () => createHiHat(),
    openhat: () => createOpenHat(),
    tom1: () => createTom(150),
    tom2: () => createTom(100),
    crash: () => createCrash(),
    ride: () => createRide(),
    clap: () => createClap(),
    cowbell: () => createCowbell(),
    perc: () => createPerc(),
    bass: () => createBass()
};

// Synthesized drum sounds
function createKick() {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.frequency.setValueAtTime(150, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    gain.gain.setValueAtTime(1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(gainNode);

    osc.start();
    osc.stop(audioContext.currentTime + 0.5);
}

function createSnare() {
    const bufferSize = audioContext.sampleRate * 0.2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(gainNode);

    noise.start();
}

function createHiHat() {
    const bufferSize = audioContext.sampleRate * 0.1;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(gainNode);

    noise.start();
}

function createOpenHat() {
    const bufferSize = audioContext.sampleRate * 0.3;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(gainNode);

    noise.start();
}

function createTom(freq) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioContext.currentTime + 0.3);

    gain.gain.setValueAtTime(0.8, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(gainNode);

    osc.start();
    osc.stop(audioContext.currentTime + 0.3);
}

function createCrash() {
    const bufferSize = audioContext.sampleRate * 1;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.5, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(gainNode);

    noise.start();
}

function createRide() {
    createHiHat();
    setTimeout(() => createHiHat(), 50);
}

function createClap() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createSnare(), i * 10);
    }
}

function createCowbell() {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.frequency.value = 800;
    osc.type = 'square';

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(gainNode);

    osc.start();
    osc.stop(audioContext.currentTime + 0.2);
}

function createPerc() {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.frequency.value = 2000;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.4, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(gainNode);

    osc.start();
    osc.stop(audioContext.currentTime + 0.1);
}

function createBass() {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.frequency.setValueAtTime(50, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.4);

    gain.gain.setValueAtTime(1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(gainNode);

    osc.start();
    osc.stop(audioContext.currentTime + 0.4);
}

// Play sound
function playSound(soundName) {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (sounds[soundName]) {
        sounds[soundName]();
        visualize();
    }
}

// Visual feedback
function triggerPad(key) {
    const pad = document.querySelector(`[data-key="${key}"]`);
    if (pad) {
        pad.classList.add('playing');
        setTimeout(() => pad.classList.remove('playing'), 100);
    }
}

// Keyboard
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const pad = document.querySelector(`[data-key="${key}"]`);

    if (pad &&!e.repeat) {
        const sound = pad.dataset.sound;
        playSound(sound);
        triggerPad(key);

        if (isRecording) {
            recordNote(key, audioContext.currentTime);
        }
    }
});

// Click
pads.forEach(pad => {
    pad.addEventListener('click', () => {
        const sound = pad.dataset.sound;
        const key = pad.dataset.key;
        playSound(sound);
        triggerPad(key);

        if (isRecording) {
            recordNote(key, audioContext.currentTime);
        }
    });
});

// Volume
volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value / 100;
    gainNode.gain.value = vol;
    volumeDisplay.textContent = e.target.value + '%';
});

// Recording
let isRecording = false;
let recording = [];
let recordStartTime = 0;
let recordTimer = null;

recordBtn.addEventListener('click', () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

function startRecording() {
    isRecording = true;
    recording = [];
    recordStartTime = audioContext.currentTime;
    recordBtn.classList.add('recording');
    recordBtn.innerHTML = '<span class="dot"></span> Stop';
    recordingInfo.classList.add('show');
    playBtn.disabled = true;

    recordTimer = setInterval(() => {
        const elapsed = audioContext.currentTime - recordStartTime;
        recTimeEl.textContent = elapsed.toFixed(1) + 's';
    }, 100);
}

function stopRecording() {
    isRecording = false;
    recordBtn.classList.remove('recording');
    recordBtn.innerHTML = '<span class="dot"></span> Record';
    recordingInfo.classList.remove('show');
    clearInterval(recordTimer);

    if (recording.length > 0) {
        playBtn.disabled = false;
    }
}

function recordNote(key, time) {
    recording.push({ key, time: time - recordStartTime });
}

playBtn.addEventListener('click', () => {
    if (recording.length === 0) return;

    playBtn.disabled = true;
    const startPlay = audioContext.currentTime;

    recording.forEach(note => {
        setTimeout(() => {
            const pad = document.querySelector(`[data-key="${note.key}"]`);
            if (pad) {
                playSound(pad.dataset.sound);
                triggerPad(note.key);
            }
        }, note.time * 1000);
    });

    const totalTime = recording[recording.length - 1].time * 1000;
    setTimeout(() => {
        playBtn.disabled = false;
    }, totalTime + 500);
});

clearBtn.addEventListener('click', () => {
    recording = [];
    playBtn.disabled = true;
    if (isRecording) stopRecording();
});

// Visualizer
const canvas = visualizer;
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function visualize() {
    requestAnimationFrame(visualize);

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#e94560');
        gradient.addColorStop(1, '#667eea');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}

visualize();

// Resize canvas
window.addEventListener('resize', () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
});