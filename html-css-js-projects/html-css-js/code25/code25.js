// JavaScript for Code 25
const display = document.getElementById('display');
const subDisplay = document.getElementById('subDisplay');
const startBtn = document.getElementById('startBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const clearLapsBtn = document.getElementById('clearLapsBtn');
const lapsList = document.getElementById('lapsList');

let startTime = 0;
let elapsedTime = 0;
let animationFrameId = null;
let isRunning = false;
let laps = [];
let lastLapTime = 0;

// Load saved laps
function loadLaps() {
  const saved = localStorage.getItem('stopwatchLaps');
  if (saved) {
    laps = JSON.parse(saved);
    renderLaps();
  }
}

function saveLaps() {
  localStorage.setItem('stopwatchLaps', JSON.stringify(laps));
}

function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor(ms % 1000);

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

function updateDisplay() {
  const currentTime = isRunning ? performance.now() - startTime + elapsedTime : elapsedTime;
  display.textContent = formatTime(currentTime);
  
  if (isRunning) {
    animationFrameId = requestAnimationFrame(updateDisplay);
  }
}

function start() {
  if (!isRunning) {
    isRunning = true;
    startTime = performance.now();
    startBtn.textContent = 'Pause';
    startBtn.classList.add('pause');
    lapBtn.disabled = false;
    display.classList.add('running');
    updateDisplay();
  } else {
    pause();
  }
}

function pause() {
  if (isRunning) {
    isRunning = false;
    elapsedTime += performance.now() - startTime;
    cancelAnimationFrame(animationFrameId);
    startBtn.textContent = 'Start';
    startBtn.classList.remove('pause');
    lapBtn.disabled = true;
    display.classList.remove('running');
  }
}

function reset() {
  isRunning = false;
  cancelAnimationFrame(animationFrameId);
  elapsedTime = 0;
  lastLapTime = 0;
  startTime = 0;
  display.textContent = '00:00:00.000';
  subDisplay.textContent = 'Lap 0';
  startBtn.textContent = 'Start';
  startBtn.classList.remove('pause');
  lapBtn.disabled = true;
  display.classList.remove('running');
}

function lap() {
  if (!isRunning) return;
  
  const currentTime = performance.now() - startTime + elapsedTime;
  const lapTime = currentTime - lastLapTime;
  lastLapTime = currentTime;
  
  laps.unshift({
    number: laps.length + 1,
    time: lapTime,
    total: currentTime
  });
  
  saveLaps();
  renderLaps();
  subDisplay.textContent = `Lap ${laps.length}`;
}

function renderLaps() {
  if (laps.length === 0) {
    lapsList.innerHTML = '<div class="empty-laps">No laps yet. Press Lap to record.</div>';
    return;
  }

  // Find best and worst laps
  const times = laps.map(l => l.time);
  const bestTime = Math.min(...times);
  const worstTime = Math.max(...times);

  lapsList.innerHTML = laps.map((lap, index) => {
    const isBest = lap.time === bestTime && laps.length > 1;
    const isWorst = lap.time === worstTime && laps.length > 1;
    const diff = index < laps.length - 1 ? lap.time - laps[index + 1].time : 0;
    const diffSign = diff >= 0 ? '+' : '';
    
    return `
      <div class="lap-item ${isBest ? 'best' : ''} ${isWorst ? 'worst' : ''}">
        <span class="lap-number">Lap ${lap.number}</span>
        <div>
          <div class="lap-time">${formatTime(lap.time)}</div>
          ${index < laps.length - 1 ? `<div class="lap-diff">${diffSign}${formatTime(Math.abs(diff))}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function clearLaps() {
  laps = [];
  lastLapTime = 0;
  saveLaps();
  renderLaps();
  subDisplay.textContent = 'Lap 0';
}

// Event listeners
startBtn.addEventListener('click', start);
lapBtn.addEventListener('click', lap);
resetBtn.addEventListener('click', reset);
clearLapsBtn.addEventListener('click', clearLaps);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    start();
  } else if (e.code === 'KeyL' && isRunning) {
    e.preventDefault();
    lap();
  } else if (e.code === 'KeyR') {
    e.preventDefault();
    reset();
  }
});

// Init
loadLaps();
renderLaps();