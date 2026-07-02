// JavaScript for Code 17
const redLight = document.getElementById('redLight');
const yellowLight = document.getElementById('yellowLight');
const greenLight = document.getElementById('greenLight');
const currentState = document.getElementById('currentState');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

let timeoutId = null;
let currentLight = 'red';
let isRunning = false;

const states = {
  red: { next: 'green', duration: 4000 },
  green: { next: 'yellow', duration: 4000 },
  yellow: { next: 'red', duration: 2000 }
};

function updateLights(state) {
  // Turn all lights off
  redLight.classList.remove('active');
  yellowLight.classList.remove('active');
  greenLight.classList.remove('active');

  // Turn current light on
  if (state === 'red') redLight.classList.add('active');
  if (state === 'yellow') yellowLight.classList.add('active');
  if (state === 'green') greenLight.classList.add('active');

  currentState.textContent = state.charAt(0).toUpperCase() + state.slice(1);
}

function cycle() {
  if (!isRunning) return;

  updateLights(currentLight);

  // setTimeout schedules the next state change
  timeoutId = setTimeout(() => {
    currentLight = states[currentLight].next;
    cycle(); // recursive state cycle
  }, states[currentLight].duration);
}

function startCycle() {
  if (isRunning) return;
  isRunning = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  currentLight = 'red';
  cycle();
}

function stopCycle() {
  isRunning = false;
  clearTimeout(timeoutId);
  startBtn.disabled = false;
  stopBtn.disabled = true;
  updateLights('red');
  currentState.textContent = 'Stopped';
}

startBtn.addEventListener('click', startCycle);
stopBtn.addEventListener('click', stopCycle);

// Init with red on
updateLights('red');
stopBtn.disabled = true;