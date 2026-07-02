// JavaScript for Code 80
const piano = document.getElementById('piano');
const octaveDisplay = document.getElementById('octave-display');
const octaveUpBtn = document.getElementById('octave-up');
const octaveDownBtn = document.getElementById('octave-down');
const waveformSelect = document.getElementById('waveform');
const volumeSlider = document.getElementById('volume');
const volumeDisplay = document.getElementById('volume-display');
const sustainCheckbox = document.getElementById('sustain');
const currentNoteEl = document.getElementById('current-note');
const currentFreqEl = document.getElementById('current-freq');

// Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination);
masterGain.gain.value = 0.6;

// Note frequencies for C4 = 261.63 Hz
const NOTES = [
    { note: 'C', key: 'a', isSharp: false },
    { note: 'C#', key: 'w', isSharp: true },
    { note: 'D', key: 's', isSharp: false },
    { note: 'D#', key: 'e', isSharp: true },
    { note: 'E', key: 'd', isSharp: false },
    { note: 'F', key: 'f', isSharp: false },
    { note: 'F#', key: 't', isSharp: true },
    { note: 'G', key: 'g', isSharp: false },
    { note: 'G#', key: 'y', isSharp: true },
    { note: 'A', key: 'h', isSharp: false },
    { note: 'A#', key: 'u', isSharp: true },
    { note: 'B', key: 'j', isSharp: false },
    { note: 'C', key: 'k', isSharp: false },
    { note: 'C#', key: 'o', isSharp: true },
    { note: 'D', key: 'l', isSharp: false },
    { note: 'D#', key: 'p', isSharp: true },
    { note: 'E', key: ';', isSharp: false },
    { note: 'F', key: "'", isSharp: false }
];

let baseOctave = 4;
let activeOscillators = new Map();

// Calculate frequency: A4 = 440Hz
function getFrequency(note, octave) {
    const A4 = 440;
    const noteIndex = {
        'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4,
        'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2
    };
    const semitones = noteIndex[note] + (octave - 4) * 12;
    return A4 * Math.pow(2, semitones / 12);
}

// Create piano keys
function createPiano() {
    piano.innerHTML = '';

    // White keys first
    const whiteKeys = NOTES.filter(n =>!n.isSharp);
    whiteKeys.forEach((noteData, i) => {
        const key = document.createElement('div');
        key.className = 'key white';
        key.dataset.note = noteData.note;
        key.dataset.key = noteData.key;
        key.dataset.octave = noteData.key < 'k'? baseOctave : baseOctave + 1;

        key.innerHTML = `
            <div class="key-label">${noteData.key.toUpperCase()}</div>
            <div class="note-label">${noteData.note}${key.dataset.octave}</div>
        `;

        key.addEventListener('mousedown', () => playNote(noteData.note, parseInt(key.dataset.octave), noteData.key));
        key.addEventListener('mouseup', () => stopNote(noteData.key));
        key.addEventListener('mouseleave', () => stopNote(noteData.key));

        piano.appendChild(key);
    });

    // Black keys
    const blackKeys = NOTES.filter(n => n.isSharp);
    const blackPositions = [0.7, 1.7, 3.7, 4.7, 5.7, 7.7, 8.7];

    blackKeys.forEach((noteData, i) => {
        const key = document.createElement('div');
        key.className = 'key black';
        key.dataset.note = noteData.note;
        key.dataset.key = noteData.key;
        key.dataset.octave = noteData.key < 'o'? baseOctave : baseOctave + 1;

        key.style.left = `${blackPositions[i] * 14.28}%`;

        key.innerHTML = `
            <div class="key-label">${noteData.key.toUpperCase()}</div>
            <div class="note-label">${noteData.note}</div>
        `;

        key.addEventListener('mousedown', () => playNote(noteData.note, parseInt(key.dataset.octave), noteData.key));
        key.addEventListener('mouseup', () => stopNote(noteData.key));
        key.addEventListener('mouseleave', () => stopNote(noteData.key));

        piano.appendChild(key);
    });
}

function playNote(note, octave, key) {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    stopNote(key); // Stop if already playing

    const freq = getFrequency(note, octave);
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = waveformSelect.value;
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);

    // ADSR envelope
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01); // Attack
    gain.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.1); // Decay to sustain

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();

    activeOscillators.set(key, { osc, gain });

    // Visual feedback
    const keyEl = document.querySelector(`[data-key="${key}"]`);
    if (keyEl) keyEl.classList.add('playing');

    // Display
    currentNoteEl.textContent = `${note}${octave}`;
    currentFreqEl.textContent = `${freq.toFixed(2)} Hz`;
}

function stopNote(key) {
    const active = activeOscillators.get(key);
    if (active) {
        const { osc, gain } = active;

        if (sustainCheckbox.checked) {
            gain.gain.cancelScheduledValues(audioContext.currentTime);
            gain.gain.setValueAtTime(gain.gain.value, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            osc.stop(audioContext.currentTime + 0.3);
        } else {
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            osc.stop(audioContext.currentTime + 0.05);
        }

        activeOscillators.delete(key);

        const keyEl = document.querySelector(`[data-key="${key}"]`);
        if (keyEl) keyEl.classList.remove('playing');
    }
}

// Keyboard controls
const pressedKeys = new Set();

document.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    const key = e.key.toLowerCase();

    if (key === 'z') {
        changeOctave(-1);
        return;
    }
    if (key === 'x') {
        changeOctave(1);
        return;
    }

    const noteData = NOTES.find(n => n.key === key);
    if (noteData &&!pressedKeys.has(key)) {
        pressedKeys.add(key);
        const octave = key < 'k' && key < 'o'? baseOctave : baseOctave + 1;
        playNote(noteData.note, octave, key);
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    pressedKeys.delete(key);
    stopNote(key);
});

// Octave controls
function changeOctave(delta) {
    baseOctave = Math.max(2, Math.min(6, baseOctave + delta));
    octaveDisplay.textContent = baseOctave;
    createPiano();
}

octaveUpBtn.addEventListener('click', () => changeOctave(1));
octaveDownBtn.addEventListener('click', () => changeOctave(-1));

// Volume
volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value / 100;
    masterGain.gain.value = vol;
    volumeDisplay.textContent = e.target.value + '%';
});

// Init
createPiano();