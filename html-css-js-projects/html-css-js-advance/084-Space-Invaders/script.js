// Game States
const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  WAVE_TRANSITION: 'WAVE_TRANSITION',
  GAME_OVER: 'GAME_OVER'
};

// Constants
const PLAYER_SPEED = 5;
const PLAYER_BULLET_SPEED = 8;
const ENEMY_BULLET_SPEED = 3;
const ENEMY_ROWS = 5;
const ENEMY_COLS = 11;
const ENEMY_SIZE = 30;
const ENEMY_SPACING = 45;
const PLAYER_SIZE = 40;
const BULLET_SIZE = 4;

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const waveEl = document.getElementById('wave');
const bestEl = document.getElementById('best');

const menuScreen = document.getElementById('menuScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const waveScreen = document.getElementById('waveScreen');
const gameOverText = document.getElementById('gameOverText');
const finalScoreEl = document.getElementById('finalScore');
const finalWaveEl = document.getElementById('finalWave');
const waveNumEl = document.getElementById('waveNum');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const fireBtn = document.getElementById('fireBtn');

// Game Variables
let gameState = GameState.MENU;
let canvasWidth = 800;
let canvasHeight = 600;

let player = null;
let enemies = [];
let playerBullets = [];
let enemyBullets = [];
let particles = [];
let barriers = [];

let score = 0;
let lives = 3;
let wave = 1;
let highScore = parseInt(localStorage.getItem('invadersHighScore') || '0');

let enemyDirection = 1;
let enemySpeed = 0.5;
let enemyDropDistance = 20;
let enemyShootTimer = 0;
let enemyAnimationFrame = 0;
let animationTimer = 0;

let keys = {};
let lastTime = 0;
let animationId = null;

// Bullet Pool - CONCEPT: Reuse objects for performance
class BulletPool {
  constructor(size) {
    this.pool = [];
    for (let i = 0; i < size; i++) {
      this.pool.push({ x: 0, y: 0, vx: 0, vy: 0, active: false });
    }
  }

  get() {
    for (let bullet of this.pool) {
      if (!bullet.active) {
        bullet.active = true;
        return bullet;
      }
    }
    return null;
  }

  release(bullet) {
    bullet.active = false;
  }

  getActive() {
    return this.pool.filter(b => b.active);
  }
}

const playerBulletPool = new BulletPool(20);
const enemyBulletPool = new BulletPool(30);

// Player Class
class Player {
  constructor() {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 60;
    this.width = PLAYER_SIZE;
    this.height = PLAYER_SIZE / 2;
    this.speed = PLAYER_SPEED;
    this.canShoot = true;
    this.shootCooldown = 0;
  }

  update() {
    if (keys['ArrowLeft'] || keys['a']) {
      this.x -= this.speed;
    }
    if (keys['ArrowRight'] || keys['d']) {
      this.x += this.speed;
    }

    this.x = Math.max(this.width / 2, Math.min(canvasWidth - this.width / 2, this.x));

    if (this.shootCooldown > 0) this.shootCooldown--;
    if ((keys[' '] || keys['ArrowUp'] || keys['w']) && this.canShoot && this.shootCooldown === 0) {
      this.shoot();
    }
  }

  shoot() {
    const bullet = playerBulletPool.get();
    if (bullet) {
      bullet.x = this.x;
      bullet.y = this.y - this.height / 2;
      bullet.vx = 0;
      bullet.vy = -PLAYER_BULLET_SPEED;
      this.shootCooldown = 15;
    }
  }

  draw() {
    ctx.fillStyle = '#00ff00';
    // Ship body
    ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height / 2);
    ctx.fillRect(this.x - this.width / 4, this.y - this.height / 2, this.width / 2, this.height / 2);
    // Cannon
    ctx.fillRect(this.x - 2, this.y - this.height, 4, this.height / 2);
  }
}

// Enemy Class - Sprite Animation
class Enemy {
  constructor(x, y, row) {
    this.x = x;
    this.y = y;
    this.startY = y;
    this.width = ENEMY_SIZE;
    this.height = ENEMY_SIZE;
    this.row = row;
    this.alive = true;
    this.points = row === 0? 30 : row < 3? 20 : 10;
  }

  draw(frame) {
    if (!this.alive) return;

    const x = this.x;
    const y = this.y;

    // Different sprites per row
    if (this.row === 0) {
      // Squid
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(x - 12, y - 8, 24, 8);
      ctx.fillRect(x - 8, y, 16, 8);
      if (frame === 0) {
        ctx.fillRect(x - 12, y + 8, 6, 4);
        ctx.fillRect(x + 6, y + 8, 6, 4);
      } else {
        ctx.fillRect(x - 6, y + 8, 6, 4);
        ctx.fillRect(x, y + 8, 6, 4);
      }
    } else if (this.row < 3) {
      // Crab
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(x - 10, y - 6, 20, 6);
      ctx.fillRect(x - 14, y, 28, 6);
      ctx.fillRect(x - 10, y + 6, 20, 4);
      if (frame === 0) {
        ctx.fillRect(x - 14, y - 2, 4, 8);
        ctx.fillRect(x + 10, y - 2, 4, 8);
      } else {
        ctx.fillRect(x - 10, y - 2, 4, 8);
        ctx.fillRect(x + 6, y - 2, 4, 8);
      }
    } else {
      // Octopus
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(x - 12, y - 4, 24, 4);
      ctx.fillRect(x - 8, y, 16, 8);
      if (frame === 0) {
        ctx.fillRect(x - 12, y + 4, 4, 4);
        ctx.fillRect(x - 4, y + 4, 4, 4);
        ctx.fillRect(x + 4, y + 4, 4, 4);
        ctx.fillRect(x + 12, y + 4, 4, 4);
      } else {
        ctx.fillRect(x - 8, y + 4, 4, 4);
        ctx.fillRect(x, y + 4, 4, 4);
        ctx.fillRect(x + 8, y + 4, 4, 4);
      }
    }
  }
}

// Barrier Class
class Barrier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.blocks = [];
    // 4x4 grid of blocks
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        this.blocks.push({ r, c, health: 4 });
      }
    }
  }

  hit(x, y) {
    const blockX = Math.floor((x - this.x) / 10);
    const blockY = Math.floor((y - this.y) / 10);
    const block = this.blocks.find(b => b.r === blockY && b.c === blockX);
    if (block && block.health > 0) {
      block.health--;
      return true;
    }
    return false;
  }

  draw() {
    ctx.fillStyle = '#00ff00';
    this.blocks.forEach(block => {
      if (block.health > 0) {
        const alpha = block.health / 4;
        ctx.globalAlpha = alpha;
        ctx.fillRect(this.x + block.c * 10, this.y + block.r * 10, 10, 10);
      }
    });
    ctx.globalAlpha = 1;
  }
}

// Particle System
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6 - 2;
    this.life = 30;
    this.color = color;
    this.size = Math.random() * 3 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2;
    this.life--;
  }

  draw() {
    ctx.globalAlpha = this.life / 30;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

function createExplosion(x, y, color, count = 15) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

// Responsive Canvas
function resizeCanvas() {
  const maxWidth = Math.min(window.innerWidth * 0.95, 800);
  const maxHeight = Math.min(window.innerHeight * 0.7, 600);
  canvasWidth = maxWidth;
  canvasHeight = maxHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// State Management
function setGameState(state) {
  gameState = state;
  menuScreen.style.display = state === GameState.MENU? 'block' : 'none';
  gameOverScreen.style.display = state === GameState.GAME_OVER? 'block' : 'none';
  waveScreen.style.display = state === GameState.WAVE_TRANSITION? 'block' : 'none';

  if (state === GameState.PLAYING) {
    lastTime = performance.now();
    gameLoop(lastTime);
  } else {
    cancelAnimationFrame(animationId);
  }
}

// Wave Spawning - CONCEPT: Enemy formations
function spawnWave() {
  enemies = [];
  const offsetX = (canvasWidth - ENEMY_COLS * ENEMY_SPACING) / 2;
  const offsetY = 60;

  for (let row = 0; row < ENEMY_ROWS; row++) {
    for (let col = 0; col < ENEMY_COLS; col++) {
      enemies.push(new Enemy(
        offsetX + col * ENEMY_SPACING + ENEMY_SPACING / 2,
        offsetY + row * ENEMY_SPACING,
        row
      ));
    }
  }

  // Barriers
  barriers = [];
  const barrierY = canvasHeight - 120;
  for (let i = 0; i < 4; i++) {
    barriers.push(new Barrier(100 + i * 180, barrierY));
  }

  enemySpeed = 0.5 + wave * 0.1;
  enemyDirection = 1;
}

function initGame() {
  player = new Player();
  playerBullets = [];
  enemyBullets = [];
  particles = [];
  score = 0;
  lives = 3;
  wave = 1;
  spawnWave();
  updateStats();
}

function startGame() {
  initGame();
  setGameState(GameState.PLAYING);
}

function nextWave() {
  wave++;
  waveNumEl.textContent = wave;
  setGameState(GameState.WAVE_TRANSITION);
  setTimeout(() => {
    spawnWave();
    setGameState(GameState.PLAYING);
  }, 2000);
}

function updateStats() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  waveEl.textContent = wave;
  bestEl.textContent = highScore;
}

function gameOver() {
  setGameState(GameState.GAME_OVER);
  gameOverText.textContent = 'Game Over';
  finalScoreEl.textContent = score;
  finalWaveEl.textContent = wave;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('invadersHighScore', highScore);
  }
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
  // Player
  player.update();

  // Update player bullets
  const activePlayerBullets = playerBulletPool.getActive();
  for (let i = activePlayerBullets.length - 1; i >= 0; i--) {
    const bullet = activePlayerBullets[i];
    bullet.y += bullet.vy;

    if (bullet.y < 0) {
      playerBulletPool.release(bullet);
      continue;
    }

    // Check enemy collision
    for (let enemy of enemies) {
      if (enemy.alive &&
          Math.abs(bullet.x - enemy.x) < ENEMY_SIZE / 2 &&
          Math.abs(bullet.y - enemy.y) < ENEMY_SIZE / 2) {
        enemy.alive = false;
        score += enemy.points;
        updateStats();
        createExplosion(enemy.x, enemy.y, '#ffff00');
        playerBulletPool.release(bullet);
        break;
      }
    }

    // Check barrier collision
    for (let barrier of barriers) {
      if (barrier.hit(bullet.x, bullet.y)) {
        playerBulletPool.release(bullet);
        break;
      }
    }
  }

  // Update enemies
  let hitEdge = false;
  let aliveEnemies = enemies.filter(e => e.alive);

  if (aliveEnemies.length === 0) {
    nextWave();
    return;
  }

  animationTimer++;
  if (animationTimer > 30) {
    enemyAnimationFrame = 1 - enemyAnimationFrame;
    animationTimer = 0;
  }

  aliveEnemies.forEach(enemy => {
    enemy.x += enemyDirection * enemySpeed;
    if (enemy.x <= ENEMY_SIZE / 2 || enemy.x >= canvasWidth - ENEMY_SIZE / 2) {
      hitEdge = true;
    }
  });

  if (hitEdge) {
    enemyDirection *= -1;
    enemies.forEach(enemy => {
      if (enemy.alive) enemy.y += enemyDropDistance;
    });
  }

  // Enemy shooting
  enemyShootTimer--;
  if (enemyShootTimer <= 0 && aliveEnemies.length > 0) {
    const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    const bullet = enemyBulletPool.get();
    if (bullet) {
      bullet.x = shooter.x;
      bullet.y = shooter.y + ENEMY_SIZE / 2;
      bullet.vx = 0;
      bullet.vy = ENEMY_BULLET_SPEED;
    }
    enemyShootTimer = 60 - wave * 2;
  }

  // Update enemy bullets
  const activeEnemyBullets = enemyBulletPool.getActive();
  for (let i = activeEnemyBullets.length - 1; i >= 0; i--) {
    const bullet = activeEnemyBullets[i];
    bullet.y += bullet.vy;

    if (bullet.y > canvasHeight) {
      enemyBulletPool.release(bullet);
      continue;
    }

    // Check player collision
    if (Math.abs(bullet.x - player.x) < PLAYER_SIZE / 2 &&
        Math.abs(bullet.y - player.y) < PLAYER_SIZE / 2) {
      lives--;
      updateStats();
      createExplosion(player.x, player.y, '#ff0000', 20);
      enemyBulletPool.release(bullet);

      if (lives <= 0) {
        gameOver();
      } else {
        player.x = canvasWidth / 2;
      }
      continue;
    }

    // Check barrier collision
    for (let barrier of barriers) {
      if (barrier.hit(bullet.x, bullet.y)) {
        enemyBulletPool.release(bullet);
        break;
      }
    }
  }

  // Check if enemies reached bottom
  for (let enemy of aliveEnemies) {
    if (enemy.y > canvasHeight - 100) {
      gameOver();
      return;
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw stars
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 50; i++) {
    const x = (i * 37) % canvasWidth;
    const y = (i * 73) % canvasHeight;
    ctx.fillRect(x, y, 1, 1);
  }

  // Draw barriers
  barriers.forEach(b => b.draw());

  // Draw player
  player.draw();

  // Draw enemies
  enemies.forEach(enemy => enemy.draw(enemyAnimationFrame));

  // Draw bullets
  ctx.fillStyle = '#00ff00';
  playerBulletPool.getActive().forEach(bullet => {
    ctx.fillRect(bullet.x - BULLET_SIZE / 2, bullet.y - BULLET_SIZE, BULLET_SIZE, BULLET_SIZE * 2);
  });

  ctx.fillStyle = '#ff0000';
  enemyBulletPool.getActive().forEach(bullet => {
    ctx.fillRect(bullet.x - BULLET_SIZE / 2, bullet.y, BULLET_SIZE, BULLET_SIZE * 2);
  });

  // Draw particles
  particles.forEach(p => p.draw());
}

// Input
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === 'p' || e.key === 'P') {
    if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
    else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Mobile controls
leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowLeft'] = true; });
leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowLeft'] = false; });
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowRight'] = true; });
rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowRight'] = false; });
fireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[' '] = true; });
fireBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys[' '] = false; });

// Button events
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => setGameState(GameState.MENU));

// Init
setGameState(GameState.MENU);
updateStats();