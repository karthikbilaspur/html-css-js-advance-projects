// JavaScript for Code 24
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const timerTitle = document.getElementById('timerTitle');
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const status = document.getElementById('status');
const progressBar = document.getElementById('progressBar');
const presetBtns = document.querySelectorAll('.preset-btn');

let intervalId = null;
let totalSeconds = 0;
let remainingSeconds = 0;
let isPaused = false;

const CIRCLE_LENGTH = 754; // 2 * PI * 120

// Load from localStorage
function loadSaved() {
  const saved = localStorage.getItem('timerData');
  if (saved) {
    const data = JSON.parse(saved);
    hoursInput.value = data.hours || 0;
    minutesInput.value = data.minutes || 5;
    secondsInput.value = data.seconds || 0;
    timerTitle.value = data.title || 'Focus Timer';
  }
}

function saveData() {
  localStorage.setItem('timerData', JSON.stringify({
    hours: hoursInput.value,
    minutes: minutesInput.value,
    seconds: secondsInput.value,
    title: timerTitle.value
  }));
}

function updateDisplay() {
  const hrs = Math.floor(remainingSeconds / 3600);
  const mins = Math.floor((remainingSeconds % 3600) / 60);
  const secs = remainingSeconds % 60;
  
  if (hrs > 0) {
    display.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Update progress ring
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const offset = CIRCLE_LENGTH * (1 - progress);
  progressBar.style.strokeDashoffset = offset;

  // Conditional styling
  display.classList.remove('warning', 'danger');
  if (remainingSeconds <= 10 && remainingSeconds > 0) {
    display.classList.add('danger');
  } else if (remainingSeconds <= 30 && remainingSeconds > 0) {
    display.classList.add('warning');
  }

  // Document title
  document.title = `${display.textContent} - ${timerTitle.value}`;
}

function playBeep(frequency = 800, duration = 0.2) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {}
}

function showNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Timer Complete!', {
      body: `${timerTitle.value} is finished`,
      icon: '⏰'
    });
  }
}

function startTimer() {
  if (!isPaused) {
    const hrs = parseInt(hoursInput.value) || 0;
    const mins = parseInt(minutesInput.value) || 0;
    const secs = parseInt(secondsInput.value) || 0;
    totalSeconds = hrs * 3600 + mins * 60 + secs;
    remainingSeconds = totalSeconds;

    if (totalSeconds <= 0) {
      alert('Please set a time greater than 0');
      return;
    }
    saveData();
  }

  isPaused = false;
  status.textContent = 'Running...';
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  hoursInput.disabled = true;
  minutesInput.disabled = true;
  secondsInput.disabled = true;
  timerTitle.disabled = true;

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  intervalId = setInterval(() => {
    remainingSeconds--;
    updateDisplay();

    // Sound alerts
    if (remainingSeconds === 30 || remainingSeconds === 10) {
      playBeep(600, 0.15);
    }

    // Stop at 0
    if (remainingSeconds <= 0) {
      clearInterval(intervalId);
      status.textContent = "Time's up!";
      display.textContent = hrs > 0 ? '00:00:00' : '00:00';
      progressBar.style.strokeDashoffset = 0;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      hoursInput.disabled = false;
      minutesInput.disabled = false;
      secondsInput.disabled = false;
      timerTitle.disabled = false;
      playBeep(1000, 0.5);
      showNotification();
      document.title = "Code 24: Countdown Timer Pro";
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(intervalId);
  isPaused = true;
  status.textContent = 'Paused';
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function resetTimer() {
  clearInterval(intervalId);
  isPaused = false;
  remainingSeconds = 0;
  totalSeconds = 0;
  updateDisplay();
  status.textContent = 'Ready';
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  hoursInput.disabled = false;
  minutesInput.disabled = false;
  secondsInput.disabled = false;
  timerTitle.disabled = false;
  display.classList.remove('warning', 'danger');
  progressBar.style.strokeDashoffset = CIRCLE_LENGTH;
  document.title = "Code 24: Countdown Timer Pro";
}

// Preset buttons
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const mins = parseInt(btn.dataset.min);
    hoursInput.value = 0;
    minutesInput.value = mins;
    secondsInput.value = 0;
    updateInputsToSeconds();
  });
});

function updateInputsToSeconds() {
  const hrs = parseInt(hoursInput.value) || 0;
  const mins = parseInt(minutesInput.value) || 0;
  const secs = parseInt(secondsInput.value) || 0;
  remainingSeconds = hrs * 3600 + mins * 60 + secs;
  totalSeconds = remainingSeconds;
  updateDisplay();
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

[hoursInput, minutesInput, secondsInput].forEach(input => {
  input.addEventListener('input', updateInputsToSeconds);
});

// Init
loadSaved();
updateInputsToSeconds();