// Game States & Types
const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
  WIN: 'WIN'
};

const PowerUpType = {
  WIDE_PADDLE: 'WIDE_PADDLE',
  MULTI_BALL: 'MULTI_BALL',
  FIRE_BALL: 'FIRE_BALL',
  EXTRA_LIFE: 'EXTRA_LIFE',
  LASER: 'LASER'
};

const BallType = {
  NORMAL: 'NORMAL',
  FIRE: 'FIRE'
};

// Canvas & DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const comboDisplay = document.getElementById('comboDisplay');
const powerupDisplay = document.getElementById('powerupDisplay');
const highScoreMenu = document.getElementById('highScoreMenu');

const menuScreen = document.getElementById('menuScreen');
const pauseScreen = document.getElementById('pauseScreen');
const levelCompleteScreen = document.getElementById('levelCompleteScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverText = document.getElementById('gameOverText');
const finalScoreEl = document.getElementById('finalScore');
const bestScoreEl = document.getElementById('bestScore');
const levelScoreEl = document.getElementById('levelScore');
const levelBonusEl = document.getElementById('levelBonus');

const startBtn = document.getElementById('startBtn');
const continueBtn = document.getElementById('continueBtn');
const resumeBtn = document.getElementById('resumeBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const menuBtn2 = document.getElementById('menuBtn2');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const launchBtn = document.getElementById('launchBtn');

// Game Constants
const PADDLE_HEIGHT = 15;
const PADDLE_WIDTH_BASE = 100;
const BALL_SIZE = 12;
const BALL_SPEED_BASE = 6;
const MAX_BALL_SPEED = 14;
const BRICK_ROWS = 8;
const BRICK_COLS = 10;
const BRICK_PADDING = 4;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 30;
const POWERUP_CHANCE = 0.2;
const COMBO_TIME = 1000; // ms between hits for combo
const SCREEN_SHAKE_DECAY = 0.9;

// Game Variables
let gameState = GameState.MENU;
let canvasWidth = 600;
let canvasHeight = 700;
let brickWidth = 0;
let brickHeight = 20;

let paddle = { x: 0, y: 0, width: PADDLE_WIDTH_BASE, dx: 0, speed: 9 };
let balls = [];
let bricks = [];
let powerups = [];
let particles = [];
let lasers = [];

let activePowerups = { widePaddle: 0, fireBall: 0 };
let score = 0;
let lives = 3;
let level = 1;
let bricksRemaining = 0;
let combo = 0;
let lastHitTime = 0;
let screenShake = 0;

let highScore = parseInt(localStorage.getItem('breakoutHighScore') || '0');
let savedLevel = parseInt(localStorage.getItem('breakoutLevel') || '1');
let savedScore = parseInt(localStorage.getItem('breakoutScore') || '0');

let lastTime = 0;
let animationId = null;
let keys = {};

// Audio Context for procedural sounds
let audioCtx = null;
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(freq, duration, type = 'sine', vol = 0.1) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// Level Data: 0=empty, 1-4=normal, 5=boss brick
const LEVELS = [
  [
    [0,0,1,1,1,1,1,1,0,0],
    [0,1,2,2,2,2,2,2,1,0],
    [1,2,3,3,3,3,3,3,2,1],
    [1,2,3,4,4,3,2,1],
    [0,1,2,3,5,5,3,2,1,0],
    [0,0,1,2,3,3,2,1,0,0],
    [0,0,0,1,2,2,1,0,0,0],
    [0,0,0,0,1,1,0,0]
  ],
  [
    [4,4,4,4],
    [4,3,3,3,3,3,3,4],
    [4,3,2,2,2,2,3,4],
    [4,3,2,1,1,2,3,4],
    [4,3,2,1,5,5,1,2,3,4],
    [4,3,2,1,1,1,1,2,3,4],
    [4,3,2,2,2,2,2,2,3,4],
    [4,4,4,4]
  ],
  [
    [1,1,1,0,0,1,1,1],
    [1,2,2,1,1,1,2,2,1],
    [1,2,3,3,3,3,3,3,2,1],
    [0,1,3,4,4,3,1,0],
    [0,0,1,4,5,5,4,1,0,0],
    [0,0,1,4,5,5,4,1,0,0],
    [0,1,3,4,4,4,4,3,1,0],
    [1,2,3,3,3,3,2,1]
  ]
];

const BRICK_COLORS = { 1: '#4ecdc4', 2: '#45b7aa', 3: '#ffe66d', 4: '#ff6b6b', 5: '#9b59b6' };
const BRICK_POINTS = { 1: 10, 2: 20, 3: 30, 4: 50, 5: 100 };

// Particle System
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8 - 2;
    this.life = 30;
    this.color = color;
    this.size = Math.random() * 4 + 2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.3; // gravity
    this.life--;
  }
  draw() {
    ctx.globalAlpha = this.life / 30;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

function createParticles(x, y, color, count = 15) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

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

function initGame(newGame = true) {
  if (newGame) {
    score = 0;
    lives = 3;
    level = 1;
  }
  activePowerups = { widePaddle: 0, fireBall: 0 };
  paddle.width = PADDLE_WIDTH_BASE;
  combo = 0;
  particles = [];
  powerups = [];
  lasers = [];
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
      const type = levelData[r][c];
      if (type > 0) {
        bricks.push({
          x: BRICK_OFFSET_LEFT + c * (brickWidth + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + r * (brickHeight + BRICK_PADDING),
          width: brickWidth,
          height: brickHeight,
          health: type === 5? 5 : type,
          maxHealth: type === 5? 5 : type,
          type: type,
          hasPowerup: Math.random() < POWERUP_CHANCE,
          dx: type === 5? (Math.random() > 0.5? 1 : -1) : 0 // Boss bricks move
        });
        if (type!== 5) bricksRemaining++;
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
    type: BallType.NORMAL,
    stuck: false
  }];
}

function startGame() {
  initAudio();
  initGame(true);
  setGameState(GameState.PLAYING);
}

function continueGame() {
  initAudio();
  score = savedScore;
  level = savedLevel;
  initGame(false);
  setGameState(GameState.PLAYING);
}

function nextLevel() {
  level++;
  levelEl.textContent = level;
  const bonus = lives * 100;
  score += bonus;
  levelBonusEl.textContent = bonus;
  saveGame();
  loadLevel(level);
  resetBalls();
  setGameState(GameState.PLAYING);
}

function loseLife() {
  lives--;
  updateStats();
  playSound(150, 0.3, 'sawtooth');
  if (lives <= 0) {
    gameOver();
  } else {
    resetBalls();
  }
}

function gameOver() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('breakoutHighScore', highScore);
  }
  localStorage.removeItem('breakoutLevel');
  localStorage.removeItem('breakoutScore');
  setGameState(GameState.GAME_OVER);
  gameOverText.textContent = 'Game Over';
  finalScoreEl.textContent = score;
  bestScoreEl.textContent = highScore;
}

function winGame() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('breakoutHighScore', highScore);
  }
  localStorage.removeItem('breakoutLevel');
  localStorage.removeItem('breakoutScore');
  setGameState(GameState.WIN);
  gameOverText.textContent = 'You Win!';
  finalScoreEl.textContent = score;
  bestScoreEl.textContent = highScore;
}

function saveGame() {
  localStorage.setItem('breakoutLevel', level);
  localStorage.setItem('breakoutScore', score);
  localStorage.setItem('breakoutHighScore', Math.max(score, highScore));
}

function updateStats() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level;
  highScoreMenu.textContent = highScore;
  continueBtn.style.display = savedLevel > 1? 'block' : 'none';
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
  // Screen shake decay
  screenShake *= SCREEN_SHAKE_DECAY;

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
      playSound(200, 0.05, 'square', 0.05);
    }
    if (ball.y <= 0) {
      ball.dy *= -1;
      ball.y = 0;
      playSound(200, 0.05, 'square', 0.05);
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
      const angle = (hitPos - 0.5) * Math.PI / 2.5;
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = Math.sin(angle) * speed;
      ball.dy = -Math.abs(Math.cos(angle) * speed);
      playSound(300, 0.1, 'sine');
      createParticles(ball.x + BALL_SIZE / 2, paddle.y, '#4ecdc4', 8);
    }

    // Brick collision
    for (let j = bricks.length - 1; j >= 0; j--) {
      const brick = bricks[j];
      if (
        ball.x < brick.x + brick.width &&
        ball.x + BALL_SIZE > brick.x &&
        ball.y < brick.y + brick.height &&
        ball.y + BALL_SIZE > brick.y
      ) {
        // Fire ball goes through
        if (ball.type!== BallType.FIRE) {
          const overlapLeft = ball.x + BALL_SIZE - brick.x;
          const overlapRight = brick.x + brick.width - ball.x;
          const overlapTop = ball.y + BALL_SIZE - brick.y;
          const overlapBottom = brick.y + brick.height - ball.y;
          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
          if (minOverlap === overlapLeft || minOverlap === overlapRight) ball.dx *= -1;
          else ball.dy *= -1;
        }

        brick.health -= ball.type === BallType.FIRE? 2 : 1;
        playSound(400 + brick.type * 50, 0.1, 'square');
        screenShake = 5;

        if (brick.health <= 0) {
          const points = BRICK_POINTS[brick.type] * (combo + 1);
          score += points;
          combo = Math.min(combo + 1, 4);
          lastHitTime = performance.now();
          updateStats();
          createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, BRICK_COLORS[brick.type], 20);

          if (brick.hasPowerup) spawnPowerup(brick.x + brick.width / 2, brick.y + brick.height / 2);
          bricks.splice(j, 1);
          if (brick.type!== 5) bricksRemaining--;

          if (bricksRemaining === 0) {
            levelScoreEl.textContent = score;
            if (level >= LEVELS.length) winGame();
            else setGameState(GameState.LEVEL_COMPLETE);
          }
        }
        break;
      }
    }

    // Ball out
    if (ball.y > canvasHeight) {
      balls.splice(i, 1);
      if (balls.length === 0) loseLife();
    }
  }

  // Update boss bricks
  bricks.forEach(brick => {
    if (brick.type === 5) {
      brick.x += brick.dx * dt;
      if (brick.x <= 0 || brick.x + brick.width >= canvasWidth) brick.dx *= -1;
    }
  });

  // Update powerups
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.y += p.speed * dt;
    if (
      p.y + p.size >= paddle.y &&
      p.y <= paddle.y + PADDLE_HEIGHT &&
      p.x + p.size >= paddle.x &&
      p.x <= paddle.x + paddle.width
    ) {
      activatePowerup(p.type);
      powerups.splice(i, 1);
      playSound(600, 0.2, 'sine');
    } else if (p.y > canvasHeight) {
      powerups.splice(i, 1);
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].life <= 0) particles.splice(i, 1);
  }

  // Combo timeout
  if (performance.now() - lastHitTime > COMBO_TIME) combo = 0;
  comboDisplay.textContent = combo > 1? `x${combo}` : '';

  // Powerup timers
  if (activePowerups.widePaddle > 0) {
    activePowerups.widePaddle -= dt;
    if (activePowerups.widePaddle <= 0) {
      paddle.width = PADDLE_WIDTH_BASE;
      powerupDisplay.textContent = '';
    } else {
      powerupDisplay.textContent = `Wide: ${Math.ceil(activePowerups.widePaddle / 60)}s`;
    }
  }
  if (activePowerups.fireBall > 0) {
    activePowerups.fireBall -= dt;
    if (activePowerups.fireBall <= 0) {
      balls.forEach(b => b.type = BallType.NORMAL);
      powerupDisplay.textContent = '';
    } else {
      powerupDisplay.textContent = `Fire: ${Math.ceil(activePowerups.fireBall / 60)}s`;
    }
  }
}

function spawnPowerup(x, y) {
  const types = Object.values(PowerUpType);
  const type = types[Math.floor(Math.random() * types.length)];
  powerups.push({ x: x - 10, y, size: 20, speed: 3, type });
}

function activatePowerup(type) {
  switch (type) {
    case PowerUpType.WIDE_PADDLE:
      paddle.width = PADDLE_WIDTH_BASE * 1.5;
      activePowerups.widePaddle = 600;
      break;
    case PowerUpType.MULTI_BALL:
      if (balls.length > 0) {
        const b = balls[0];
        balls.push(
          { x: b.x, y: b.y, dx: -b.dx, dy: b.dy, type: b.type, stuck: false },
          { x: b.x, y: b.y, dx: b.dx * 0.7, dy: b.dy * 1.3, type: b.type, stuck: false }
        );
      }
      break;
    case PowerUpType.FIRE_BALL:
      balls.forEach(b => b.type = BallType.FIRE);
      activePowerups.fireBall = 600;
      break;
    case PowerUpType.EXTRA_LIFE:
      lives++;
      updateStats();
      break;
    case PowerUpType.LASER:
      // Simplified: just give points for now
      score += 200;
      updateStats();
      break;
  }
}

// Drawing
function draw() {
  ctx.save();
  if (screenShake > 0.5) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
  }

  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw bricks
  bricks.forEach(brick => {
    ctx.fillStyle = BRICK_COLORS[brick.type];
    ctx.shadowBlur = 10;
    ctx.shadowColor = BRICK_COLORS[brick.type];
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

    // Health indicator for boss bricks
    if (brick.type === 5) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(brick.health, brick.x + brick.width / 2, brick.y + brick.height / 2 + 4);
    }
  });

  // Draw paddle
  ctx.fillStyle = '#4ecdc4';
  ctx.shadowColor = '#4ecdc4';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, PADDLE_HEIGHT);

  // Draw balls
  balls.forEach(ball => {
    ctx.fillStyle = ball.type === BallType.FIRE? '#ff6b6b' : '#fff';
    ctx.shadowColor = ball.type === BallType.FIRE? '#ff6b6b' : '#fff';
    ctx.beginPath();
    ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    if (ball.type === BallType.FIRE) {
      ctx.fillStyle = '#ffe66d';
      ctx.beginPath();
      ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw powerups
  powerups.forEach(p => {
    ctx.fillStyle = '#ffe66d';
    ctx.shadowColor = '#ffe66d';
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.fillStyle = '#0a0a14';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const symbol = { WIDE_PADDLE: 'W', MULTI_BALL: 'M', FIRE_BALL: 'F', EXTRA_LIFE: '+', LASER: 'L' }[p.type];
    ctx.fillText(symbol, p.x + p.size / 2, p.y + p.size / 2);
  });

  // Draw particles
  particles.forEach(p => p.draw());

  ctx.shadowBlur = 0;
  ctx.restore();
}

// Input
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ') {
    e.preventDefault();
    if (gameState === GameState.PLAYING) {
      balls.forEach(b => { if (b.stuck) { b.stuck = false; b.dy = -BALL_SPEED_BASE; }});
      if (!balls.some(b => b.stuck)) setGameState(GameState.PAUSED);
    } else if (gameState === GameState.PAUSED) {
      setGameState(GameState.PLAYING);
    }
  }
});

document.addEventListener('keyup', (e) => { keys[e.key] = false; });

canvas.addEventListener('mousemove', (e) => {
  if (gameState!== GameState.PLAYING) return;
  const rect = canvas.getBoundingClientRect();
  paddle.x = e.clientX - rect.left - paddle.width / 2;
  paddle.x = Math.max(0, Math.min(canvasWidth - paddle.width, paddle.x));
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (gameState!== GameState.PLAYING) return;
  const rect = canvas.getBoundingClientRect();
  paddle.x = e.touches[0].clientX - rect.left - paddle.width / 2;
  paddle.x = Math.max(0, Math.min(canvasWidth - paddle.width, paddle.x));
}, { passive: false });

canvas.addEventListener('click', () => {
  balls.forEach(b => { if (b.stuck) { b.stuck = false; b