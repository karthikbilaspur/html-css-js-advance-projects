// Game States
const GameState = {
  IDLE: 'IDLE',
  SHOWING: 'SHOWING',
  WAITING: 'WAITING',
  GAME_OVER: 'GAME_OVER'
};

// Audio frequencies for each color
const TONES = {
  green: 329.63, // E4
  red: 261.63, // C4
  yellow: 220, // A3
  blue: 164.81 // E3
};

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const buttons = {
  green: document.getElementById('green'),
  red: document.getElementById('red'),
  yellow: document.getElementById('yellow'),
  blue: document.getElementById('blue')
};

const levelEl = document.getElementById('level');
const highScoreEl = document.getElementById('highScore');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startBtn');

const gameOverScreen = document.getElementById('gameOverScreen');
const finalLevelEl = document.getElementById('finalLevel');
const finalBestEl = document.getElementById('finalBest');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');

// Game Variables
let gameState = GameState.IDLE;
let sequence = [];
let playerSequence = [];
let level = 0;
let highScore = parseInt(localStorage.getItem('simonHighScore') || '0');
let isPlaying = false;

// Audio Context
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTone(color, duration = 400) {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.value = TONES[color];

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration / 1000);
}

highScoreEl.textContent = highScore;

// State Management
function setGameState(state) {
  gameState = state;
  gameOverScreen.style.display = state === GameState.GAME_OVER? 'block' : 'none';

  Object.values(buttons).forEach(btn => {
    btn.classList.toggle('disabled', state!== GameState.WAITING);
  });

  if (state === GameState.SHOWING) {
    statusEl.textContent = 'WATCH';
    statusEl.classList.add('playing');
  } else if (state === GameState.WAITING) {
    statusEl.textContent = 'YOUR TURN';
    statusEl.classList.remove('playing');
  } else {
    statusEl.textContent = 'SIMON';
    statusEl.classList.remove('playing');
  }
}

function startGame() {
  initAudio();
  sequence = [];
  playerSequence = [];
  level = 0;
  isPlaying = true;
  startBtn.style.display = 'none';
  nextRound();
}

function nextRound() {
  level++;
  levelEl.textContent = level;
  playerSequence = [];

  // Add new color to sequence
  const colors = Object.keys(buttons);
  sequence.push(colors[Math.floor(Math.random() * colors.length)]);

  setGameState(GameState.SHOWING);
  showSequence();
}

// Show sequence using setTimeout chains
function showSequence() {
  let i = 0;
  const showNext = () => {
    if (i >= sequence.length) {
      setTimeout(() => {
        setGameState(GameState.WAITING);
      }, 300);
      return;
    }

    const color = sequence[i];
    flashButton(color);

    i++;
    setTimeout(showNext, 600);
  };

  setTimeout(showNext, 800);
}

function flashButton(color) {
  const btn = buttons[color];
  btn.classList.add('active');
  playTone(color);

  setTimeout(() => {
    btn.classList.remove('active');
  }, 400);
}

// Input validation - compare arrays
function handlePlayerInput(color) {
  if (gameState!== GameState.WAITING) return;

  flashButton(color);
  playerSequence.push(color);

  // Check if current input matches sequence
  const index = playerSequence.length - 1;
  if (playerSequence[index]!== sequence[index]) {
    gameOver();
    return;
  }

  // Check if round complete
  if (playerSequence.length === sequence.length) {
    setGameState(GameState.IDLE);
    setTimeout(() => {
      nextRound();
    }, 1000);
  }
}

function gameOver() {
  setGameState(GameState.GAME_OVER);
  isPlaying = false;
  startBtn.style.display = 'block';

  playTone('red', 800);
  setTimeout(() => playTone('red', 800), 200);

  if (level - 1 > highScore) {
    highScore = level - 1;
    localStorage.setItem('simonHighScore', highScore);
    highScoreEl.textContent = highScore;
  }

  finalLevelEl.textContent = level - 1;
  finalBestEl.textContent = highScore;
}

// Input handlers
Object.entries(buttons).forEach(([color, btn]) => {
  btn.addEventListener('click', () => handlePlayerInput(color));
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (gameState!== GameState.WAITING) return;

  const keyMap = {
    'q': 'green',
    'w': 'red',
    'a': 'yellow',
    's': 'blue'
  };

  const color = keyMap[e.key.toLowerCase()];
  if (color) {
    e.preventDefault();
    handlePlayerInput(color);
  }
});

// Touch support
Object.entries(buttons).forEach(([color, btn]) => {
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === GameState.WAITING) {
      handlePlayerInput(color);
    }
  }, { passive: false });
});

// Button events
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => {
  setGameState(GameState.IDLE);
  startBtn.style.display = 'block';
});

// Init
setGameState(GameState.IDLE);