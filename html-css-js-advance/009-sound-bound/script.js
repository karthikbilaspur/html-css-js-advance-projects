const sounds = ['success', 'click', 'error', 'notify', 'deploy'];
const buttonsContainer = document.getElementById('buttons');

sounds.forEach(sound => {
  const btn = document.createElement('button');
  btn.classList.add('btn');
  btn.innerText = sound.charAt(0).toUpperCase() + sound.slice(1);

  btn.addEventListener('click', () => {
    stopSongs();
    document.getElementById(sound).play();

    // Visual feedback
    btn.classList.add('playing');
    setTimeout(() => btn.classList.remove('playing'), 500);
  });

  buttonsContainer.appendChild(btn);
});

// Stop button
const stopBtn = document.createElement('button');
stopBtn.classList.add('btn', 'stop');
stopBtn.innerText = 'Stop All';
stopBtn.addEventListener('click', stopSongs);
buttonsContainer.appendChild(stopBtn);

function stopSongs() {
  sounds.forEach(sound => {
    const song = document.getElementById(sound);
    song.pause();
    song.currentTime = 0;
  });
}

// Keyboard support: 1-5 for sounds, 0 for stop
document.addEventListener('keydown', (e) => {
  if (e.key >= '1' && e.key <= '5') {
    const index = parseInt(e.key) - 1;
    if (sounds[index]) {
      stopSongs();
      document.getElementById(sounds[index]).play();
    }
  }
  if (e.key === '0' || e.key === 'Escape') {
    stopSongs();
  }
});

console.log('Sound Board loaded - KarthikCodingSolutions ⚡');