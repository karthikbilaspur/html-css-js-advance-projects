// JavaScript for Code 40
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const clearBtn = document.getElementById('clearBtn');
const voiceSelect = document.getElementById('voiceSelect');
const rateSlider = document.getElementById('rateSlider');
const pitchSlider = document.getElementById('pitchSlider');
const volumeSlider = document.getElementById('volumeSlider');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const volumeValue = document.getElementById('volumeValue');
const speakBtn = document.getElementById('speakBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('statusText');
const progressFill = document.getElementById('progressFill');
const presetBtns = document.querySelectorAll('.preset-btn');

let voices = [];
let utterance = null;
let isPaused = false;

// speechSynthesis API - Load available voices
function loadVoices() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = '';

  voices.forEach((voice, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = `${voice.name} (${voice.lang})`;
    if (voice.default) option.textContent += ' — DEFAULT';
    voiceSelect.appendChild(option);
  });

  // Auto-select a good English voice
  const preferredVoice = voices.findIndex(v => v.lang.startsWith('en') && v.name.includes('Google'));
  if (preferredVoice >= 0) voiceSelect.value = preferredVoice;
}

// Voices load async in Chrome
speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// Update character count
textInput.addEventListener('input', () => {
  charCount.textContent = textInput.value.length;
});

clearBtn.addEventListener('click', () => {
  textInput.value = '';
  charCount.textContent = '0';
});

// Update slider displays
rateSlider.addEventListener('input', (e) => {
  rateValue.textContent = parseFloat(e.target.value).toFixed(1);
});

pitchSlider.addEventListener('input', (e) => {
  pitchValue.textContent = parseFloat(e.target.value).toFixed(1);
});

volumeSlider.addEventListener('input', (e) => {
  volumeValue.textContent = Math.round(e.target.value * 100) + '%';
});

// Speech synthesis functions
function speak() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  const text = textInput.value.trim();
  if (!text) {
    statusText.textContent = 'Please enter text to speak';
    return;
  }

  // Create SpeechSynthesisUtterance
  utterance = new SpeechSynthesisUtterance(text);

  // Set voice
  const selectedVoice = voices[voiceSelect.value];
  if (selectedVoice) utterance.voice = selectedVoice;

  // Set properties: rate, pitch, volume
  utterance.rate = parseFloat(rateSlider.value);
  utterance.pitch = parseFloat(pitchSlider.value);
  utterance.volume = parseFloat(volumeSlider.value);

  // Event handlers
  utterance.onstart = () => {
    statusText.textContent = 'Speaking...';
    speakBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    isPaused = false;
  };

  utterance.onpause = () => {
    statusText.textContent = 'Paused';
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
    isPaused = true;
  };

  utterance.onresume = () => {
    statusText.textContent = 'Speaking...';
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    isPaused = false;
  };

  utterance.onend = () => {
    statusText.textContent = 'Finished';
    speakBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    stopBtn.disabled = true;
    progressFill.style.width = '100%';
    setTimeout(() => {
      progressFill.style.width = '0%';
      statusText.textContent = 'Ready';
    }, 1000);
  };

  utterance.onerror = (e) => {
    statusText.textContent = 'Error: ' + e.error;
    resetButtons();
  };

  // Rough progress tracking
  utterance.onboundary = (e) => {
    const progress = (e.charIndex / text.length) * 100;
    progressFill.style.width = progress + '%';
  };

  // Start speaking
  speechSynthesis.speak(utterance);
}

function pause() {
  if (speechSynthesis.speaking &&!isPaused) {
    speechSynthesis.pause();
  }
}

function resume() {
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
  }
}

function stop() {
  speechSynthesis.cancel();
  resetButtons();
  statusText.textContent = 'Stopped';
  progressFill.style.width = '0%';
}

function resetButtons() {
  speakBtn.disabled = false;
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
  stopBtn.disabled = true;
}

// Event listeners
speakBtn.addEventListener('click', speak);
pauseBtn.addEventListener('click', pause);
resumeBtn.addEventListener('click', resume);
stopBtn.addEventListener('click', stop);

// Preset buttons
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    textInput.value = btn.dataset.text;
    charCount.textContent = textInput.value.length;
  });
});

// Keyboard shortcut: Space to speak/stop
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.ctrlKey) {
    e.preventDefault();
    if (speechSynthesis.speaking) {
      stop();
    } else {
      speak();
    }
  }
});

// Init
charCount.textContent = textInput.value.length;