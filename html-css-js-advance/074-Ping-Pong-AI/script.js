// Game States
const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER'
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const playerScoreEl = document.getElementById('playerScore');
const cpuScoreEl = document.getElementById('cpuScore');
const menuScreen = document.getElementById('menuScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const winnerText = document.getElementById('winnerText');
const finalScoreEl = document.getElementById('finalScore');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');

// Game Constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PADDLE_SPEED = 8;
const BALL_BASE_SPEED = 5;
const MAX_BALL_SPEED = 12;
const WIN_SCORE = 7;
const AI_REACTION = 0.75; // 0-1, higher = harder AI

// Game Variables
let gameState = GameState.MENU;
let canvasWidth = 800;
let canvasHeight = 500;

let player = { x: 0, y: 0, score: 0, dy: 0 };
let cpu = { x: 0, y: 0, score: 0 };
let ball = { x: 0, y: 0, dx: 0, dy: 0, speed: BALL_BASE_SPEED };

let lastTime = 0;
let animationId = null;

// Responsive Canvas
function resizeCanvas() {
  const maxWidth = Math.min(window.innerWidth * 0.95, 800);
  const maxHeight = Math.min(window.innerHeight * 0.7, 500);
  const aspect = 8 / 5;

  if (maxWidth / aspect <= maxHeight) {
    canvasWidth = maxWidth;
    canvasHeight = maxWidth / aspect;
  } else {
    canvasHeight = maxHeight;
    canvasWidth = maxHeight * aspect;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Reset positions
  player.x = 20;
  player.y = canvasHeight / 2 - PADDLE_HEIGHT / 2;
  cpu.x = canvasWidth - 20 - PADDLE_WIDTH;
  cpu.y = canvasHeight / 2 - PADDLE_HEIGHT / 2;
  resetBall();
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game State Management
function setGameState(state) {
  gameState = state;
  menuScreen.style.display = state === GameState.MENU? 'block' : 'none';
  gameOverScreen.style.display = state === GameState.GAME_OVER? 'block' : 'none';

  if (state === GameState.PLAYING) {
    lastTime = performance.now();
    gameLoop(lastTime);
  } else {
    cancelAnimationFrame(animationId);
  }
}

function startGame() {
  player.score = 0;
  cpu.score = 0;
  updateScore();
  resetBall();
  setGameState(GameState.PLAYING);
}

function endGame(winner) {
  setGameState(GameState.GAME_OVER);
  winnerText.textContent = winner === 'player'? 'You Win!' : 'CPU Wins!';
  finalScoreEl.textContent = `${player.score} - ${cpu.score}`;
}

function resetBall() {
  ball.x = canvasWidth / 2;
  ball.y = canvasHeight / 2;
  ball.speed = BALL_BASE_SPEED;

  // Random angle between -45 and 45 degrees, left or right
  const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
  const direction = Math.random() > 0.5? 1 : -1;
  ball.dx = Math.cos(angle) * ball.speed * direction;
  ball.dy = Math.sin(angle) * ball.speed;
}

// Game Loop using requestAnimationFrame
function gameLoop(currentTime) {
  if (gameState!== GameState.PLAYING) return;

  const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to 60fps
  lastTime = currentTime;

  update(deltaTime);
  draw();

  animationId = requestAnimationFrame(gameLoop);
}

// Update Game Logic
function update(dt) {
  // Move player
  player.y += player.dy * dt;
  player.y = Math.max(0, Math.min(canvasHeight - PADDLE_HEIGHT, player.y));

  // AI Movement - basic prediction
  const cpuCenter = cpu.y + PADDLE_HEIGHT / 2;
  const ballCenter = ball.y;
  const diff = ballCenter - cpuCenter;

  // Only move if ball is coming towards CPU
  if (ball.dx > 0) {
    // Predict where ball will be
    const predictY = ball.y + ball.dy * ((cpu.x - ball.x) / ball.dx);
    const targetY = predictY - PADDLE_HEIGHT / 2;
    const aiDiff = targetY - cpu.y;

    if (Math.abs(aiDiff) > 5) {
      cpu.y += Math.sign(aiDiff) * PADDLE_SPEED * AI_REACTION * dt;
    }
  } else {
    // Return to center when ball moving away
    const centerY = canvasHeight / 2 - PADDLE_HEIGHT / 2;
    cpu.y += Math.sign(centerY - cpu.y) * PADDLE_SPEED * 0.3 * dt;
  }

  cpu.y = Math.max(0, Math.min(canvasHeight - PADDLE_HEIGHT, cpu.y));

  // Move ball
  ball.x += ball.dx * dt;
  ball.y += ball.dy * dt;

  // Ball collision with top/bottom walls
  if (ball.y <= 0 || ball.y + BALL_SIZE >= canvasHeight) {
    ball.dy *= -1;
    ball.y = ball.y <= 0? 0 : canvasHeight - BALL_SIZE;
  }

  // Ball collision with paddles
  checkPaddleCollision(player);
  checkPaddleCollision(cpu);

  // Scoring
  if (ball.x < 0) {
    cpu.score++;
    updateScore();
    checkWin();
    resetBall();
  } else if (ball.x + BALL_SIZE > canvasWidth) {
    player.score++;
    updateScore();
    checkWin();
    resetBall();
  }
}

// Angle-based physics: hit position affects ball angle
function checkPaddleCollision(paddle) {
  if (
    ball.x < paddle.x + PADDLE_WIDTH &&
    ball.x + BALL_SIZE > paddle.x &&
    ball.y < paddle.y + PADDLE_HEIGHT &&
    ball.y + BALL_SIZE > paddle.y
  ) {
    // Calculate where on paddle the ball hit: -1 to 1
    const relativeIntersectY = (paddle.y + PADDLE_HEIGHT / 2) - (ball.y + BALL_SIZE / 2);
    const normalizedIntersect = relativeIntersectY / (PADDLE_HEIGHT / 2);

    // Max bounce angle of 75 degrees
    const bounceAngle = normalizedIntersect * (Math.PI * 5 / 12);

    // Increase speed slightly each hit
    ball.speed = Math.min(ball.speed * 1.05, MAX_BALL_SPEED);

    // Set new velocity based on angle
    const direction = paddle === player? 1 : -1;
    ball.dx = Math.cos(bounceAngle) * ball.speed * direction;
    ball.dy = -Math.sin(bounceAngle) * ball.speed;

    // Prevent ball from getting stuck in paddle
    ball.x = paddle === player? paddle.x + PADDLE_WIDTH : paddle.x - BALL_SIZE;
  }
}

function checkWin() {
  if (player.score >= WIN_SCORE) {
    endGame('player');
  } else if (cpu.score >= WIN_SCORE) {
    endGame('cpu');
  }
}

function updateScore() {
  playerScoreEl.textContent = player.score;
  cpuScoreEl.textContent = cpu.score;
}

// Drawing
function draw() {
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw center line
  ctx.strokeStyle = '#00ff41';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(canvasWidth / 2, 0);
  ctx.lineTo(canvasWidth / 2, canvasHeight);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw paddles
  ctx.fillStyle = '#00ff41';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#00ff41';
  ctx.fillRect(player.x, player.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(cpu.x, cpu.y, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// Input Handling
function handleMoveUp() {
  player.dy = -PADDLE_SPEED;
}

function handleMoveDown() {
  player.dy = PADDLE_SPEED;
}

function handleStop() {
  player.dy = 0;
}

// Keyboard
document.addEventListener('keydown', (e) => {
  if (gameState!== GameState.PLAYING) return;
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') handleMoveUp();
  if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') handleMoveDown();
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' ||
      e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
    handleStop();
  }
});

// Mouse
canvas.addEventListener('mousemove', (e) => {
  if (gameState!== GameState.PLAYING) return;
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  player.y = mouseY - PADDLE_HEIGHT / 2;
  player.y = Math.max(0, Math.min(canvasHeight - PADDLE_HEIGHT, player.y));
});

// Touch
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (gameState!== GameState.PLAYING) return;
  const rect = canvas.getBoundingClientRect();
  const touchY = e.touches[0].clientY - rect.top;
  player.y = touchY - PADDLE_HEIGHT / 2;
  player.y = Math.max(0, Math.min(canvasHeight - PADDLE_HEIGHT, player.y));
}, { passive: false });

// Mobile buttons
upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMoveUp(); });
upBtn.addEventListener('touchend', (e) => { e.preventDefault(); handleStop(); });
downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleMoveDown(); });
downBtn.addEventListener('touchend', (e) => { e.preventDefault(); handleStop(); });

// Button events
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => setGameState(GameState.MENU));

// Init
setGameState(GameState.MENU);
draw();