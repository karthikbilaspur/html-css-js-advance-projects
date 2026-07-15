const sounds = [
  { name: 'success', icon: 'fa-circle-check', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_2b28f1e6e8.mp3' },
  { name: 'click', icon: 'fa-computer-mouse', url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_c8c8a73467.mp3' },
  { name: 'error', icon: 'fa-circle-xmark', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_5e69c4d9b5.mp3' },
  { name: 'notify', icon: 'fa-bell', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_9b4f3c4d5a.mp3' },
  { name: 'deploy', icon: 'fa-rocket', url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3' }
];

const buttonsContainer = document.getElementById('buttons');
const audioElements = {};
let currentlyPlaying = null;

// Create audio elements + buttons
sounds.forEach((sound, idx) => {
  // Create audio element
  const audio = new Audio(sound.url);
  audio.preload = 'metadata';
  audioElements[sound.name] = audio;

  // Handle audio events
  audio.addEventListener('play', () => {
    currentlyPlaying = sound.name;
    updateButtonStates();
  });

  audio.addEventListener('ended', () => {
    currentlyPlaying = null;
    updateButtonStates();
  });

  audio.addEventListener('error', () => {
    console.error(`Failed to load: ${sound.name}`);
    const btn = document.querySelector(`[data-sound="${sound.name}"]`);
    if (btn) {
      btn.disabled = true;
      btn.title = 'Audio failed to load';
    }
  });

  // Create button
  const btn = document.createElement('button');
  btn.classList.add('btn');
  btn.setAttribute('data-sound', sound.name);
  btn.setAttribute('aria-label', `Play ${sound.name} sound`);
  btn.innerHTML = `
    <i class="fas ${sound.icon}"></i>
    <span>${sound.name}</span>
  `;

  btn.addEventListener('click', () => playSound(sound.name));
  buttonsContainer.appendChild(btn);
});

// Stop button
const stopBtn = document.createElement('button');
stopBtn.classList.add('btn', 'stop');
stopBtn.setAttribute('aria-label', 'Stop all sounds');
stopBtn.innerHTML = `
  <i class="fas fa-stop"></i>
  <span>Stop</span>
`;
stopBtn.addEventListener('click', stopSounds);
buttonsContainer.appendChild(stopBtn);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;

  const key = e.key;
  if (key >= '1' && key <= '5') {
    const idx = parseInt(key) - 1;
    if (sounds[idx]) playSound(sounds[idx].name);
  } else if (key === '0' || key === ' ') {
    e.preventDefault();
    stopSounds();
  }
});

function playSound(name) {
  stopSounds();
  const audio = audioElements[name];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(err => console.error('Playback failed:', err));
  }
}

function stopSounds() {
  Object.values(audioElements).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  currentlyPlaying = null;
  updateButtonStates();
}

function updateButtonStates() {
  document.querySelectorAll('.btn[data-sound]').forEach(btn => {
    const soundName = btn.getAttribute('data-sound');
    btn.classList.toggle('playing', soundName === currentlyPlaying);
  });
}