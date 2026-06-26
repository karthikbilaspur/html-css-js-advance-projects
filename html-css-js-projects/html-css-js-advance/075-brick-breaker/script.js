// Game States - State Machine
const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
  WIN: 'WIN'
};

// Power-up Types
const PowerUpType = {
  WIDE_PADDLE: 'WIDE_PADDLE',
  STICKY_BALL: 'STICKY_BALL',
  MULTI_BALL: 'MULTI_BALL',
  EXTRA_LIFE: 'EXTRA_LIFE'
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const powerupDisplay = document.getElementById('powerupDisplay');

const menuScreen = document.getElementById('menuScreen');
const pauseScreen = document.getElementById('pauseScreen');
const levelCompleteScreen = document.getElementById('levelCompleteScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverText = document.getElementById('gameOverText');
const finalScoreEl = document.getElementById('finalScore');
const finalLevelEl = document.getElementById('finalLevel');
const levelScoreEl = document.getElementById('levelScore');

const startBtn = document.getElementById('startBtn');
const resumeBtn = document.getElementById('resumeBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const menuBtn2 = document.getElementById('menuBtn2');
const pauseBtn = document.getElementById('pauseBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Game Constants
const PADDLE_HEIGHT = 15;
const PADDLE_WIDTH_BASE = 100;
const BALL_SIZE = 10;
const BALL_SPEED_BASE = 5;
const BRICK_ROWS = 8;
const BRICK_COLS = 10;
const BRICK_PADDING = 4;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 30;
const POWERUP_CHANCE = 0.15; // 15% chance on brick break

// Game Variables
let gameState = GameState.MENU;
let canvasWidth = 600;
let canvasHeight = 700;
let brickWidth = 0;
let brickHeight = 20;

let paddle = { x: 0, y: 0, width: PADDLE_WIDTH_BASE, dx: 0, speed: 8 };
let balls = [];
let bricks = [];
let powerups = [];
let activePowerups = { widePaddle: 0, stickyBall: 0 };

let score = 0;
let lives = 3;
let level = 1;
let bricksRemaining = 0;

let lastTime = 0;
let animationId = null;
let keys = {};

// Level Data - 2D Arrays: 0=empty, 1-4=brick health/color
const LEVELS = [
  // Level 1
  [
    [0,0,1,1,1,1,1,1,0,0],
    [0,1,1,2,2,2,2,1,1,0],
    [1,1,2,2,3,3,2,2,1,1],
    [1,2,2,3,3,3,3,2,2,1],
    [1,2,3,3,4,4,3,3,2,1],
    [0,1,2,3,3,2,1,0],
    [0,0,1,2,2,2,2,1,0,0],
    [0,0,0,1,1,1,1,0,0,0]
  ],
  // Level 2
  [
    [1,1,1,1],
    [1,2,2,1],
    [1,2,3,3,2,1],
    [1,2,3,4,4,4,4,3,2,1],
    [1,2,3,4,4,4,4,3,2,1],
    [1,2,3,3,3,3,3,3,2,1],
    [1,2,2,2,2,2,2,2,2,1],
    [1,1,1,1]
  ],
  // Level 3
  [
    [4,4,0,0,0,0,4,4],
    [4,4,3,3,0,0,3,3,4,4],
    [0,3,3,3,3,3,3,3,3,0],
    [0,3,2,2,2,2,3,0],
    [0,0,2,1,1,1,1,2,0,0],
    [0,0,2,1,0,0,1,2,0,0],
    [0,0,2,1,1,1,1,2,0,0],
    [0,0,0,2,2,2,2,0,0,0]
  ]
];

const BRICK_COLORS = {
  1: '#4ecdc4',
  2: '#45b7aa',
  3: '#ffe66d',
  4: '#ff6b6b'
};

const BRICK_POINTS = { 1: 10, 2: 20, 3: 30, 4: 50 };

// Responsive Canvas
function resizeCanvas() {
  const maxWidth = Math.min(window.innerWidth * 0.95, 600);
  const maxHeight = Math.min(window.innerHeight * 0.65, 700);

  canvasWidth = maxWidth;
  canvasHeight = maxHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  brickWidth = (canvasWidth - BRICK_OFFSET_LEFT * 2 - BRICK_PADDING * (BRICK_COLS - 1)) / BRICK_COLS;

  paddle.y = canvasHeight - 40;
  paddle.x = canvasWidth / 2 - paddle.width / 2;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// State Machine
function setGameState(state) {
  gameState = state;
  menuScreen.style.display = state === GameState.MENU? 'block' : 'none';
  pauseScreen.style.display = state === GameState.PAUSED? 'block' : 'none';
  levelCompleteScreen.style.display = state === GameState.LEVEL_COMPLETE? 'block' : 'none';
  gameOverScreen.style.display = state === GameState.GAME_OVER || state === GameState.WIN? 'block' : 'none';

  if (state === GameState.PLAYING) {
    lastTime = performance.now();
    gameLoop(lastTime);
  } else {
    cancelAnimationFrame(animationId);
  }
}

function initGame() {
  score = 0;
  lives = 3;
  level = 1;
  activePowerups = { widePaddle: 0, stickyBall: 0 };
  paddle.width = PADDLE_WIDTH_BASE;
  updateStats();
  loadLevel(level);
  resetBalls();
}

function loadLevel(levelNum) {
  const levelData = LEVELS[(levelNum - 1) % LEVELS.length];
  bricks = [];
  bricksRemaining = 0;

  for (let r = 0; r < levelData.length; r++) {
    for (let c = 0; c < levelData[r].length; c++) {
      const health = levelData[r][c];
      if (health > 0) {
        bricks.push({
          x: BRICK_OFFSET_LEFT + c * (brickWidth + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + r * (brickHeight + BRICK_PADDING),
          width: brickWidth,
          height: brickHeight,
          health: health,
          maxHealth: health,
          hasPowerup: Math.random() < POWERUP_CHANCE
        });
        bricksRemaining++;
      }
    }
  }
}

function resetBalls() {
  balls = [{
    x: canvasWidth / 2,
    y: paddle.y - BALL_SIZE,
    dx: BALL_SPEED_BASE * (Math.random() > 0.5? 1 : -1),
    dy: -BALL_SPEED_BASE,
    stuck: false
  }];
}

function startGame() {
  initGame();
  setGameState(GameState.PLAYING);
}

function nextLevel() {
  level++;
  levelEl.textContent = level;
  loadLevel(level);
  resetBalls();
  setGameState(GameState.PLAYING);
}

function loseLife() {
  lives--;
  updateStats();
  if (lives <= 0) {
    gameOver();
  } else {
    resetBalls();
  }
}

function gameOver() {
  setGameState(GameState.GAME_OVER);
  gameOverText.textContent = 'Game Over';
  finalScoreEl.textContent = score;
  finalLevelEl.textContent = level;
}

function winGame() {
  setGameState(GameState.WIN);
  gameOverText.textContent = 'You Win!';
  finalScoreEl.textContent = score;
  finalLevelEl.textContent = level;
}

function updateStats() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level;
}

// Game Loop
function gameLoop(currentTime) {
  if (gameState!== GameState.PLAYING) return;

  const deltaTime = (currentTime - lastTime) / 16.67;
  lastTime = currentTime;

  update(deltaTime);
  draw();

  animationId = requestAnimationFrame(gameLoop);
}

function update(dt) {
  // Update paddle
  if (keys['a'] || keys['ArrowLeft']) paddle.dx = -paddle.speed;
  else if (keys['d'] || keys['ArrowRight']) paddle.dx = paddle.speed;
  else paddle.dx = 0;

  paddle.x += paddle.dx * dt;
  paddle.x = Math.max(0, Math.min(canvasWidth - paddle.width, paddle.x));

  // Update balls
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];

    if (ball.stuck) {
      ball.x = paddle.x + paddle.width / 2 - BALL_SIZE / 2;
      ball.y = paddle.y - BALL_SIZE;
      continue;
    }

    ball.x += ball.dx * dt;
    ball.y += ball.dy * dt;

    // Wall collision
    if (ball.x <= 0 || ball.x + BALL_SIZE >= canvasWidth) {
      ball.dx *= -1;
      ball.x = ball.x <= 0? 0 : canvasWidth - BALL_SIZE;
    }
    if (ball.y <= 0) {
      ball.dy *= -1;
      ball.y = 0;
    }

    // Paddle collision
    if (
      ball.y + BALL_SIZE >= paddle.y &&
      ball.y <= paddle.y + PADDLE_HEIGHT &&
      ball.x + BALL_SIZE >= paddle.x &&
      ball.x <= paddle.x + paddle.width &&
      ball.dy > 0
    ) {
      const hitPos = (ball.x + BALL_SIZE / 2 - paddle.x) / paddle.width;
      const angle = (hitPos - 0.5) * Math.PI / 3; // -60 to 60 degrees
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = Math.sin(angle) * speed;
      ball.dy = -Math.abs(Math.cos(angle) * speed);

      if (activePowerups.stickyBall > 0) {
        ball.stuck = true;
      }
    }

    // Brick collision - Grid-based
    for (let j = bricks.length - 1; j >= 0; j--) {
      const brick = bricks[j];
      if (
        ball.x < brick.x + brick.width &&
        ball.x + BALL_SIZE > brick.x &&
        ball.y < brick.y + brick.height &&
        ball.y + BALL_SIZE > brick.y
      ) {
        // Determine collision side
        const overlapLeft = ball.x + BALL_SIZE - brick.x;
        const overlapRight = brick.x + brick.width - ball.x;
        const overlapTop = ball.y + BALL_SIZE - brick.y;
        const overlapBottom = brick.y + brick.height - ball.y;

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        if (minOverlap === overlapLeft || minOverlap === overlapRight) {
          ball.dx *= -1;
        } else {
          ball.dy *= -1;
        }

        brick.health--;
        if (brick.health <= 0) {
          score += BRICK_POINTS[brick.maxHealth];
          updateStats();

          if (brick.hasPowerup) {
            spawnPowerup(brick.x + brick.width / 2, brick.y + brick.height / 2);
          }

          bricks.splice(j, 1);
          bricksRemaining--;

          if (bricksRemaining === 0) {
            levelScoreEl.textContent = score;
            if (level >= LEVELS.length) {
              winGame();
            } else {
              setGameState(GameState.LEVEL_COMPLETE);
            }
          }
        }
        break;
      }
    }

    // Ball out of bounds
    if (ball.y > canvasHeight) {
      balls.splice(i, 1);
      if (balls.length === 0) {
        loseLife();
      }
    }
  }

  // Update powerups
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += p.speed * dt;

    // Paddle collision
    if (
      p.y + p.size >= paddle.y &&
      p.y <= paddle.y + PADDLE_HEIGHT &&
      p.x + p.size >= paddle.x &&
      p.x <= paddle.x + paddle.width
    ) {
      activatePowerup(p.type);
      powerups.splice(i, 1);
    } else if (p.y > canvasHeight) {
      powerups.splice(i, 1);
    }
  }

  // Update powerup timers
  if (activePowerups.widePaddle > 0) {
    activePowerups.widePaddle -= dt;
    if (activePowerups.widePaddle <= 0) {
      paddle.width = PADDLE_WIDTH_BASE;
      powerupDisplay.textContent = '';
    }
  }
  if (activePowerups.stickyBall > 0) {
    activePowerups.stickyBall -= dt;
    if (activePowerups.stickyBall <= 0) {
      balls.forEach(b => b.stuck = false);
      powerupDisplay.textContent = '';
    }
  }
}

function spawnPowerup(x, y) {
  const types = Object.values(PowerUpType);
  const type = types[Math.floor(Math.random() * types.length)];
  powerups.push({ x, y, size: 20, speed: 2, type });
}

function activatePowerup(type) {
  switch (type) {
    case PowerUpType.WIDE_PADDLE:
      paddle.width = PADDLE_WIDTH_BASE * 1.5;
      activePowerups.widePaddle = 600; // 10 seconds at 60fps
      powerupDisplay.textContent = 'Wide Paddle!';
      break;
    case PowerUpType.STICKY_BALL:
      activePowerups.stickyBall = 600;
      powerupDisplay.textContent = 'Sticky Ball!';
      break;
    case PowerUpType.MULTI_BALL:
      if (balls.length > 0) {
        const ball = balls[0];
        balls.push({
          x: ball.x,
          y: ball.y,
          dx: -ball.dx,
          dy: ball.dy,
          stuck: false
        });
      }
      powerupDisplay.textContent = 'Multi Ball!';
      setTimeout(() => powerupDisplay.textContent = '', 2000);
      break;
    case PowerUpType.EXTRA_LIFE:
      lives++;
      updateStats();
      powerupDisplay.textContent = 'Extra Life!';
      setTimeout(() => powerupDisplay.textContent = '', 2000);
      break;
  }
}

// Drawing
function draw() {
  ctx.fillStyle = '#0f0f1e';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw bricks
  bricks.forEach(brick => {
    ctx.fillStyle = BRICK_COLORS[brick.health];
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    ctx.strokeStyle = '#0f0f1e';
    ctx.lineWidth = 2;
    ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
  });

  // Draw paddle
  ctx.fillStyle = '#4ecdc4';
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#4ecdc4';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, PADDLE_HEIGHT);

  // Draw balls
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#fff';
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw powerups
  powerups.forEach(p => {
    ctx.fillStyle = '#ffe66d';
    ctx.shadowColor = '#ffe66d';
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.fillStyle = '#0f0f1e';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const symbol = {
      [PowerUpType.WIDE_PADDLE]: 'W',
      [PowerUpType.STICKY_BALL]: 'S',
      [PowerUpType.MULTI_BALL]: 'M',
      [PowerUpType.EXTRA_LIFE]: '+'
    }[p.type];
    ctx.fillText(symbol, p.x + p.size / 2, p.y + p.size / 2);
  });

  ctx.shadowBlur = 0;
}

// Input
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ') {
    e.preventDefault();
    if (gameState === GameState.PLAYING) {
      setGameState(GameState.PAUSED);
    } else if (gameState === GameState.PAUSED) {
      setGameState(GameState.PLAYING);
    }
    balls.forEach(b => { if (b.stuck) { b.stuck = false; b.dy = -BALL_SPEED_BASE; }});
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (gameState!== GameState.PLAYING) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  paddle.x = mouseX - paddle.width / 2;
  paddle.x = Math.max(0, Math.min(canvasWidth - paddle.width, paddle.x));
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (gameState!== GameState.PLAYING) return;
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  paddle.x = touchX - paddle.width / 2;
  paddle.x = Math.max(0, Math.min(canvasWidth - paddle.width, paddle.x));
}, { passive: false });

canvas.addEventListener('click', () => {
  balls.forEach(b => { if (b.stuck) { b.stuck = false; b.dy = -BALL_SPEED_BASE; }});
});

leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['a'] = true; });
leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['a'] = false; });
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['d'] = true; });
rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['d'] = false; });
pauseBtn.addEventListener('click', () => setGameState(GameState.PAUSED));

// Button events
startBtn.addEventListener('click', startGame);
resumeBtn.addEventListener('click', () => setGameState(GameState.PLAYING));
nextLevelBtn.addEventListener('click', nextLevel);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => setGameState(GameState.MENU));
menuBtn2.addEventListener('click', () => setGameState(GameState.MENU));

// Init
setGameState(GameState.MENU);
draw();