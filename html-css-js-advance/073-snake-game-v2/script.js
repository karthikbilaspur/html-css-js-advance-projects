// Game States
const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const finalLevelEl = document.getElementById('finalLevel');

// Screens
const menuScreen = document.getElementById('menuScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');

// Buttons
const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const menuBtn2 = document.getElementById('menuBtn2');
const pauseBtn = document.getElementById('pauseBtn');

// Game Config
const GRID_SIZE = 20;
const BASE_SPEED = 120;
const SPEED_DECREASE_PER_LEVEL = 8;
const POINTS_PER_LEVEL = 50;

let tileCount = 20;
let gameState = GameState.MENU;
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let level = 1;
let highScore = localStorage.getItem('snakeV2HighScore') || 0;
let gameSpeed = BASE_SPEED;
let gameLoopTimeout;

// Touch handling
let touchStartX = 0;
let touchStartY = 0;

highScoreEl.textContent = highScore;

// Responsive Canvas
function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6, 500);
  canvas.width = size;
  canvas.height = size;
  tileCount = Math.floor(size / GRID_SIZE);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game State Management
function setGameState(state) {
  gameState = state;
  menuScreen.style.display = state === GameState.MENU? 'block' : 'none';
  pauseScreen.style.display = state === GameState.PAUSED? 'block' : 'none';
  gameOverScreen.style.display = state === GameState.GAME_OVER? 'block' : 'none';

  if (state === GameState.PLAYING) {
    gameLoop();
  } else {
    clearTimeout(gameLoopTimeout);
  }
}

function initGame() {
  snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
  dx = 0;
  dy = 0;
  score = 0;
  level = 1;
  gameSpeed = BASE_SPEED;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  generateFood();
  clearCanvas();
  drawSnake();
  drawFood();
}

function startGame() {
  initGame();
  setGameState(GameState.PLAYING);
}

function pauseGame() {
  if (gameState === GameState.PLAYING) {
    setGameState(GameState.PAUSED);
  }
}

function resumeGame() {
  if (gameState === GameState.PAUSED) {
    setGameState(GameState.PLAYING);
  }
}

function endGame() {
  setGameState(GameState.GAME_OVER);
  finalScoreEl.textContent = score;
  finalLevelEl.textContent = level;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeV2HighScore', highScore);
    highScoreEl.textContent = highScore;
  }
}

function backToMenu() {
  setGameState(GameState.MENU);
}

// Game Loop
function gameLoop() {
  if (gameState!== GameState.PLAYING) return;

  moveSnake();

  if (checkCollision()) {
    endGame();
    return;
  }

  if (snake[0].x === food.x && snake[0].y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    generateFood();
    checkLevelUp();
  } else {
    snake.pop();
  }

  clearCanvas();
  drawFood();
  drawSnake();

  gameLoopTimeout = setTimeout(gameLoop, gameSpeed);
}

function checkLevelUp() {
  const newLevel = Math.floor(score / POINTS_PER_LEVEL) + 1;
  if (newLevel > level) {
    level = newLevel;
    levelEl.textContent = level;
    gameSpeed = Math.max(50, BASE_SPEED - (level - 1) * SPEED_DECREASE_PER_LEVEL);
  }
}

// Drawing
function clearCanvas() {
  ctx.fillStyle = '#0f3460';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#16213e';
  ctx.lineWidth = 1;
  const actualGridSize = canvas.width / tileCount;
  for (let i = 0; i <= tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * actualGridSize, 0);
    ctx.lineTo(i * actualGridSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * actualGridSize);
    ctx.lineTo(canvas.width, i * actualGridSize);
    ctx.stroke();
  }
}

function drawSnake() {
  const actualGridSize = canvas.width / tileCount;
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0? '#00d9ff' : '#00b8d4';
    ctx.fillRect(
      segment.x * actualGridSize + 1,
      segment.y * actualGridSize + 1,
      actualGridSize - 2,
      actualGridSize - 2
    );

    if (index === 0) {
      ctx.fillStyle = '#1a1a2e';
      const eyeSize = actualGridSize * 0.15;
      const eyeOffset = actualGridSize * 0.25;
      ctx.fillRect(
        segment.x * actualGridSize + eyeOffset,
        segment.y * actualGridSize + eyeOffset,
        eyeSize
      );
      ctx.fillRect(
        segment.x * actualGridSize + actualGridSize - eyeOffset - eyeSize,
        segment.y * actualGridSize + eyeOffset,
        eyeSize,
        eyeSize
      );
    }
  });
}

function drawFood() {
  const actualGridSize = canvas.width / tileCount;
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(
    food.x * actualGridSize + actualGridSize / 2,
    food.y * actualGridSize + actualGridSize / 2,
    actualGridSize / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// Game Logic
function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };

  for (let segment of snake) {
    if (segment.x === food.x && segment.y === food.y) {
      generateFood();
      return;
    }
  }
}

function checkCollision() {
  const head = snake[0];

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    return true;
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }

  return false;
}

function changeDirection(newDx, newDy) {
  if (gameState!== GameState.PLAYING) return;
  if (dx === 0 && dy === 0) return;
  if (dx === -newDx && dy === -newDy) return; // Prevent reverse

  dx = newDx;
  dy = newDy;
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
  if (gameState === GameState.MENU && e.key === ' ') {
    startGame();
    return;
  }

  if (e.key === ' ') {
    e.preventDefault();
    if (gameState === GameState.PLAYING) pauseGame();
    else if (gameState === GameState.PAUSED) resumeGame();
    return;
  }

  if (gameState!== GameState.PLAYING) return;

  if (dx === 0 && dy === 0) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { dx = 0; dy = -1; }
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { dx = 0; dy = 1; }
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { dx = -1; dy = 0; }
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { dx = 1; dy = 0; }
    return;
  }

  if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && dy!== 1) changeDirection(0, -1);
  else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && dy!== -1) changeDirection(0, 1);
  else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && dx!== 1) changeDirection(-1, 0);
  else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && dx!== -1) changeDirection(1, 0);
});

// Touch Swipe Controls
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  if (gameState!== GameState.PLAYING) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  const minSwipe = 30;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (Math.abs(diffX) > minSwipe) {
      if (diffX > 0 && dx!== -1) changeDirection(1, 0);
      else if (diffX < 0 && dx!== 1) changeDirection(-1, 0);
    }
  } else {
    if (Math.abs(diffY) > minSwipe) {
      if (diffY > 0 && dy!== -1) changeDirection(0, 1);
      else if (diffY < 0 && dy!== 1) changeDirection(0, -1);
    }
  }
}, { passive: false });

// Mobile D-Pad Controls
document.querySelectorAll('.dpad-btn').forEach(btn => {
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const dir = btn.dataset.dir;
    if (dx === 0 && dy === 0) {
      if (dir === 'up') { dx = 0; dy = -1; }
      else if (dir === 'down') { dx = 0; dy = 1; }
      else if (dir === 'left') { dx = -1; dy = 0; }
      else if (dir === 'right') { dx = 1; dy = 0; }
    } else {
      if (dir === 'up' && dy!== 1) changeDirection(0, -1);
      else if (dir === 'down' && dy!== -1) changeDirection(0, 1);
      else if (dir === 'left' && dx!== 1) changeDirection(-1, 0);
      else if (dir === 'right' && dx!== -1) changeDirection(1, 0);
    }
  });
});

// Button Events
startBtn.addEventListener('click', startGame);
resumeBtn.addEventListener('click', resumeGame);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', backToMenu);
menuBtn2.addEventListener('click', backToMenu);
pauseBtn.addEventListener('click', pauseGame);

// Init
setGameState(GameState.MENU);
initGame();