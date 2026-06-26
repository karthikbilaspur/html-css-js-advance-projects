// Game States
const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
  WIN: 'WIN'
};

// Tile Types
const TILE = {
  EMPTY: 0,
  GROUND: 1,
  BRICK: 2,
  COIN: 3,
  ENEMY: 4,
  FLAG: 5,
  PIPE_TOP: 6,
  PIPE_BODY: 7
};

// Physics Constants
const GRAVITY = 0.5;
const JUMP_POWER = -12;
const MOVE_SPEED = 4;
const MAX_FALL_SPEED = 15;
const FRICTION = 0.8;
const COYOTE_TIME = 6; // frames
const JUMP_BUFFER = 6; // frames

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const coinsEl = document.getElementById('coins');
const livesEl = document.getElementById('lives');
const timeEl = document.getElementById('time');

const menuScreen = document.getElementById('menuScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const winScreen = document.getElementById('winScreen');
const gameOverText = document.getElementById('gameOverText');
const finalCoinsEl = document.getElementById('finalCoins');
const winCoinsEl = document.getElementById('winCoins');
const timeBonusEl = document.getElementById('timeBonus');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const menuBtn = document.getElementById('menuBtn');

const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

// Game Variables
let gameState = GameState.MENU;
let canvasWidth = 800;
let canvasHeight = 480;
const TILE_SIZE = 32;

let camera = { x: 0, y: 0 };
let level = [];
let levelWidth = 0;
let levelHeight = 0;

let player = {
  x: 100,
  y: 100,
  width: 24,
  height: 32,
  vx: 0,
  vy: 0,
  onGround: false,
  facing: 1,
  coyoteTimer: 0,
  jumpBuffer: 0
};

let coins = 0;
let lives = 3;
let time = 300;
let timeCounter = 0;

let enemies = [];
let particles = [];
let keys = {};

let lastTime = 0;
let animationId = null;

// Level Data - Tilemap: 2D Array
const LEVEL_1 = [
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Add coins and enemies to level
for (let i = 5; i < 15; i++) LEVEL_1[10][i] = TILE.COIN;
LEVEL_1[12][10] = TILE.ENEMY;
LEVEL_1[12][20] = TILE.ENEMY;
LEVEL_1[10][25] = TILE.COIN;
LEVEL_1[10][26] = TILE.COIN;
LEVEL_1[10][27] = TILE.COIN;
LEVEL_1[12][35] = TILE.FLAG;

// Tile Colors
const TILE_COLORS = {
  [TILE.GROUND]: '#8b4513',
  [TILE.BRICK]: '#d2691e',
  [TILE.COIN]: '#ffd700',
  [TILE.PIPE_TOP]: '#228b22',
  [TILE.PIPE_BODY]: '#228b22'
};

// Particle System
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6 - 3;
    this.life = 30;
    this.color = color;
    this.size = Math.random() * 4 + 2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.3;
    this.life--;
  }
  draw() {
    ctx.globalAlpha = this.life / 30;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - camera.x, this.y - camera.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

function createParticles(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

// Enemy Class
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 28;
    this.vx = -1;
    this.vy = 0;
    this.alive = true;
  }

  update() {
    if (!this.alive) return;

    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // Tile collision
    const tileX = Math.floor((this.x + this.width / 2) / TILE_SIZE);
    const tileY = Math.floor((this.y + this.height) / TILE_SIZE);

    if (level[tileY] && (level[tileY][tileX] === TILE.GROUND || level[tileY][tileX] === TILE.BRICK)) {
      this.y = tileY * TILE_SIZE - this.height;
      this.vy = 0;
    }

    // Wall collision
    const nextTileX = Math.floor((this.x + this.vx + this.width / 2) / TILE_SIZE);
    if (level[tileY] && (level[tileY][nextTileX] === TILE.GROUND || level[tileY][nextTileX] === TILE.BRICK)) {
      this.vx *= -1;
    }

    // Player collision
    if (this.x < player.x + player.width &&
        this.x + this.width > player.x &&
        this.y < player.y + player.height &&
        this.y + this.height > player.y) {

      if (player.vy > 0 && player.y < this.y) {
        // Stomp enemy
        this.alive = false;
        player.vy = JUMP_POWER * 0.6;
        score += 100;
        updateStats();
        createParticles(this.x + this.width / 2, this.y + this.height / 2, '#ff6b6b');
      } else {
        // Player hit
        playerHit();
      }
    }
  }

  draw() {
    if (!this.alive) return;
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(this.x - camera.x, this.y - camera.y, this.width, this.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x - camera.x + 5, this.y - camera.y + 5, 6, 6);
    ctx.fillRect(this.x - camera.x + this.width - 11, this.y - camera.y + 5, 6, 6);
  }
}

// Canvas Setup
function resizeCanvas() {
  const maxWidth = Math.min(window.innerWidth * 0.95, 800);
  const maxHeight = Math.min(window.innerHeight * 0.65, 480);
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
  winScreen.style.display = state === GameState.WIN? 'block' : 'none';

  if (state === GameState.PLAYING) {
    lastTime = performance.now();
    gameLoop(lastTime);
  } else {
    cancelAnimationFrame(animationId);
  }
}

function initGame() {
  level = LEVEL_1.map(row => [...row]);
  levelHeight = level.length;
  levelWidth = level[0].length;

  player.x = 100;
  player.y = 100;
  player.vx = 0;
  player.vy = 0;

  coins = 0;
  lives = 3;
  time = 300;
  timeCounter = 0;

  enemies = [];
  particles = [];

  // Spawn enemies from level data
  for (let y = 0; y < levelHeight; y++) {
    for (let x = 0; x < levelWidth; x++) {
      if (level[y][x] === TILE.ENEMY) {
        enemies.push(new Enemy(x * TILE_SIZE, y * TILE_SIZE));
        level[y][x] = TILE.EMPTY;
      }
    }
  }

  updateStats();
  camera.x = 0;
  camera.y = 0;
}

function startGame() {
  initGame();
  setGameState(GameState.PLAYING);
}

function playerHit() {
  lives--;
  updateStats();
  createParticles(player.x + player.width / 2, player.y + player.height / 2, '#ff0000', 20);

  if (lives <= 0) {
    gameOver(false);
  } else {
    player.x = 100;
    player.y = 100;
    player.vx = 0;
    player.vy = 0;
  }
}

function gameOver(won = false) {
  if (won) {
    setGameState(GameState.WIN);
    const timeBonus = time * 10;
    winCoinsEl.textContent = coins;
    timeBonusEl.textContent = timeBonus;
  } else {
    setGameState(GameState.GAME_OVER);
    gameOverText.textContent = 'Game Over';
    finalCoinsEl.textContent = coins;
  }
}

function updateStats() {
  coinsEl.textContent = coins;
  livesEl.textContent = lives;
  timeEl.textContent = Math.ceil(time);
}

// Collision Detection - Tilemap
function checkTileCollision(x, y) {
  const tileX = Math.floor(x / TILE_SIZE);
  const tileY = Math.floor(y / TILE_SIZE);

  if (tileX < 0 || tileX >= levelWidth || tileY < 0 || tileY >= levelHeight) {
    return TILE.GROUND; // Treat out of bounds as solid
  }

  return level[tileY][tileX];
}

function getTileAt(x, y) {
  const tileX = Math.floor(x / TILE_SIZE);
  const tileY = Math.floor(y / TILE_SIZE);
  if (tileY >= 0 && tileY < levelHeight && tileX >= 0 && tileX < levelWidth) {
    return { type: level[tileY][tileX], x: tileX, y: tileY };
  }
  return null;
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
  // Time countdown
  timeCounter += dt;
  if (timeCounter >= 60) {
    time--;
    timeCounter = 0;
    updateStats();
    if (time <= 0) gameOver(false);
  }

  // Player input
  const left = keys['a'] || keys['ArrowLeft'];
  const right = keys['d'] || keys['ArrowRight'];
  const jump = keys['w'] || keys['ArrowUp'] || keys[' '];

  if (left) {
    player.vx = -MOVE_SPEED;
    player.facing = -1;
  } else if (right) {
    player.vx = MOVE_SPEED;
    player.facing = 1;
  } else {
    player.vx *= FRICTION;
  }

  // Coyote time & jump buffer
  if (player.onGround) player.coyoteTimer = COYOTE_TIME;
  else player.coyoteTimer--;

  if (jump) player.jumpBuffer = JUMP_BUFFER;
  else player.jumpBuffer--;

  if (player.jumpBuffer > 0 && player.coyoteTimer > 0) {
    player.vy = JUMP_POWER;
    player.onGround = false;
    player.jumpBuffer = 0;
    player.coyoteTimer = 0;
  }

  // Gravity
  player.vy += GRAVITY;
  if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;

  // Horizontal movement + collision
  player.x += player.vx * dt;

  if (player.vx > 0) {
    // Moving right
    let tile = checkTileCollision(player.x + player.width, player.y);
    let tile2 = checkTileCollision(player.x + player.width, player.y + player.height - 1);
    if (tile === TILE.GROUND || tile === TILE.BRICK || tile2 === TILE.GROUND || tile2 === TILE.BRICK) {
      player.x = Math.floor((player.x + player.width) / TILE_SIZE) * TILE_SIZE - player.width - 0.1;
      player.vx = 0;
    }
  } else if (player.vx < 0) {
    // Moving left
    let tile = checkTileCollision(player.x, player.y);
    let tile2 = checkTileCollision(player.x, player.y + player.height - 1);
    if (tile === TILE.GROUND || tile === TILE.BRICK || tile2 === TILE.GROUND || tile2 === TILE.BRICK) {
      player.x = Math.ceil(player.x / TILE_SIZE) * TILE_SIZE + 0.1;
      player.vx = 0;
    }
  }

  // Vertical movement + collision
  player.y += player.vy * dt;
  player.onGround = false;

  if (player.vy > 0) {
    // Falling
    let tile = checkTileCollision(player.x + 2, player.y + player.height);
    let tile2 = checkTileCollision(player.x + player.width - 2, player.y + player.height);
    if (tile === TILE.GROUND || tile === TILE.BRICK || tile2 === TILE.GROUND || tile2 === TILE.BRICK) {
      player.y = Math.floor((player.y + player.height) / TILE_SIZE) * TILE_SIZE - player.height;
      player.vy = 0;
      player.onGround = true;
    }
  } else if (player.vy < 0) {
    // Jumping
    let tile = checkTileCollision(player.x + 2, player.y);
    let tile2 = checkTileCollision(player.x + player.width - 2, player.y);
    if (tile === TILE.BRICK || tile2 === TILE.BRICK) {
      // Hit brick from below
      const tileInfo = getTileAt(player.x + player.width / 2, player.y);
      if (tileInfo && level[tileInfo.y][tileInfo.x] === TILE.BRICK) {
        level[tileInfo.y][tileInfo.x] = TILE.EMPTY;
        createParticles(tileInfo.x * TILE_SIZE + TILE_SIZE / 2, tileInfo.y * TILE_SIZE, '#d2691e');
        score += 50;
        updateStats();
      }
      player.y = Math.ceil(player.y / TILE_SIZE) * TILE_SIZE + 0.1;
      player.vy = 0;
    } else if (tile === TILE.GROUND || tile2 === TILE.GROUND) {
      player.y = Math.ceil(player.y / TILE_SIZE) * TILE_SIZE + 0.1;
      player.vy = 0;
    }
  }

  // Coin collection
  const centerTile = getTileAt(player.x + player.width / 2, player.y + player.height / 2);
  if (centerTile && level[centerTile.y][centerTile.x] === TILE.COIN) {
    level[centerTile.y][centerTile.x] = TILE.EMPTY;
    coins++;
    score += 100;
    updateStats();
    createParticles(centerTile.x * TILE_SIZE + TILE_SIZE / 2, centerTile.y * TILE_SIZE + TILE_SIZE / 2, '#ffd700', 8);
  }

  // Flag pole = win
  if (centerTile && level[centerTile.y][centerTile.x] === TILE.FLAG) {
    gameOver(true);
  }

  // Fell off world
  if (player.y > levelHeight * TILE_SIZE) {
    playerHit();
  }

  // Update enemies
  enemies.forEach(e => e.update());

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].life <= 0) particles.splice(i, 1);
  }

  // Camera scrolling
  const targetX = player.x - canvasWidth / 2;
  camera.x += (targetX - camera.x) * 0.1;
  camera.x = Math.max(0, Math.min(camera.x, levelWidth * TILE_SIZE - canvasWidth));
  camera.y = 0;
}

function draw() {
  ctx.fillStyle = '#5c94fc';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw level tiles
  const startCol = Math.floor(camera.x / TILE_SIZE);
  const endCol = Math.ceil((camera.x + canvasWidth) / TILE_SIZE);
  const startRow = Math.floor(camera.y / TILE_SIZE);
  const endRow = Math.ceil((camera.y + canvasHeight) / TILE_SIZE);

  for (let y = startRow; y < endRow; y++) {
    for (let x = startCol; x < endCol; x++) {
      if (y < 0 || y >= levelHeight || x < 0 || x >= levelWidth) continue;

      const tile = level[y][x];
      if (tile === TILE.EMPTY) continue;

      const drawX = x * TILE_SIZE - camera.x;
      const drawY = y * TILE_SIZE - camera.y;

      if (tile === TILE.GROUND) {
        ctx.fillStyle = TILE_COLORS[TILE.GROUND];
        ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#6b3e26';
        ctx.fillRect(drawX, drawY, TILE_SIZE, 4);
      } else if (tile === TILE.BRICK) {
        ctx.fillStyle = TILE_COLORS[TILE.BRICK];
        ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
      } else if (tile === TILE.COIN) {
        ctx.fillStyle = TILE_COLORS[TILE.COIN];
        ctx.beginPath();
        ctx.arc(drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffed4e';
        ctx.beginPath();
        ctx.arc(drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2, TILE_SIZE / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (tile === TILE.FLAG) {
        ctx.fillStyle = '#228b22';
        ctx.fillRect(drawX + TILE_SIZE / 2 - 2, drawY, 4, TILE_SIZE);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(drawX + TILE_SIZE / 2, drawY, 20, 15);
      }
    }
  }

  // Draw enemies
  enemies.forEach(e => e.draw());

  // Draw player
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);
  ctx.fillStyle = '#ffaa00';
  ctx.fillRect(player.x - camera.x + 4, player.y - camera.y + 4, player.width - 8, player.height - 8);
  ctx.fillStyle = '#000';
  ctx.fillRect(player.x - camera.x + (player.facing > 0? player.width - 10 : 4), player.y - camera.y + 8, 6, 6);

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

document.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Mobile controls
leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['a'] = true; });
leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['a'] = false; });
rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['d'] = true; });
rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['d'] = false; });
jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['w'] = true; });
jumpBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['w'] = false; });

// Button events
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => setGameState(GameState.MENU));

// Init
setGameState(GameState.MENU);