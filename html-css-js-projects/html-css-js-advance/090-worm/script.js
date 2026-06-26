const GameState = {
  MENU: 'MENU',
  AIMING: 'AIMING',
  FIRING: 'FIRING',
  GAME_OVER: 'GAME_OVER'
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const angleEl = document.getElementById('angle');
const powerEl = document.getElementById('power');
const windEl = document.getElementById('wind');
const currentPlayerEl = document.getElementById('currentPlayer');
const powerBar = document.getElementById('powerBar');

const menuScreen = document.getElementById('menuScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverText = document.getElementById('gameOverText');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const fireBtn = document.getElementById('fireBtn');

const GRAVITY = 0.25;
const TERRAIN_RESOLUTION = 4;

let gameState = GameState.MENU;
let canvasWidth = 800;
let canvasHeight = 600;

let terrain = [];
let worms = [];
let projectiles = [];
let particles = [];
let explosions = [];

let currentPlayer = 0;
let wind = 0;
let keys = {};
let animationId = null;

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

class Worm {
  constructor(x, team) {
    this.x = x;
    this.y = 0;
    this.team = team;
    this.health = 100;
    this.angle = team === 0? 45 : 135;
    this.power = 50;
    this.alive = true;
  }

  update() {
    // Drop to terrain
    const terrainY = getTerrainHeight(this.x);
    if (this.y < terrainY - 10) {
      this.y += 5;
    } else {
      this.y = terrainY - 10;
    }
  }

  draw() {
    if (!this.alive) return;
    ctx.fillStyle = this.team === 0? '#3498db' : '#e74c3c';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Health bar
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(this.x - 15, this.y - 25, 30, 4);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(this.x - 15, this.y - 25, 30 * (this.health / 100), 4);
  }
}

class Projectile {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.trail = [];
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 20) this.trail.shift();

    this.vy += GRAVITY;
    this.vx += wind * 0.01;
    this.x += this.vx;
    this.y += this.vy;

    // Check terrain collision
    if (this.y >= getTerrainHeight(this.x)) {
      explode(this.x, this.y, 40);
      return false;
    }

    // Check worm collision
    for (let worm of worms) {
      if (worm.alive && worm.team!== currentPlayer) {
        const dist = Math.hypot(this.x - worm.x, this.y - worm.y);
        if (dist < 15) {
          explode(this.x, this.y, 40);
          return false;
        }
      }
    }

    if (this.x < 0 || this.x > canvasWidth || this.y > canvasHeight) return false;
    return true;
  }

  draw() {
    // Trail
    ctx.strokeStyle = 'rgba(52, 73, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.trail.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8 - 5;
    this.life = 40;
    this.color = color;
    this.size = Math.random() * 4 + 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.3;
    this.life--;
    return this.life > 0;
  }

  draw() {
    ctx.globalAlpha = this.life / 40;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

function resizeCanvas() {
  canvasWidth = Math.min(window.innerWidth * 0.95, 800);
  canvasHeight = Math.min(window.innerHeight * 0.65, 600);
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

function generateTerrain() {
  terrain = [];
  const segments = Math.ceil(canvasWidth / TERRAIN_RESOLUTION);
  let height = canvasHeight * 0.7;

  for (let i = 0; i <= segments; i++) {
    height += (Math.random() - 0.5) * 20;
    height = Math.max(canvasHeight * 0.5, Math.min(canvasHeight * 0.9, height));
    terrain.push(height);
  }
}

function getTerrainHeight(x) {
  const idx = Math.floor(x / TERRAIN_RESOLUTION);
  if (idx < 0 || idx >= terrain.length) return canvasHeight;
  return terrain[idx];
}

function explode(x, y, radius) {
  // Terrain destruction - CONCEPT: modify pixel data
  const startIdx = Math.max(0, Math.floor((x - radius) / TERRAIN_RESOLUTION));
  const endIdx = Math.min(terrain.length - 1, Math.floor((x + radius) / TERRAIN_RESOLUTION));

  for (let i = startIdx; i <= endIdx; i++) {
    const dx = i * TERRAIN_RESOLUTION - x;
    const craterDepth = Math.sqrt(radius * radius - dx * dx);
    if (!isNaN(craterDepth)) {
      terrain[i] = Math.max(terrain[i], y + craterDepth);
    }
  }

  // Damage worms
  worms.forEach(worm => {
    if (worm.alive) {
      const dist = Math.hypot(worm.x - x, worm.y - y);
      if (dist < radius) {
        worm.health -= (1 - dist / radius) * 50;
        if (worm.health <= 0) {
          worm.alive = false;
          createExplosion(worm.x, worm.y, '#e74c3c', 30);
        }
      }
    }
  });

  createExplosion(x, y, '#f39c12', 25);
  checkGameOver();
  nextTurn();
}

function createExplosion(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

function nextTurn() {
  currentPlayer = 1 - currentPlayer;
  currentPlayerEl.textContent = currentPlayer + 1;
  wind = (Math.random() - 0.5) * 2;
  windEl.textContent = wind.toFixed(1);
  gameState = GameState.AIMING;
}

function fire() {
  if (gameState!== GameState.AIMING) return;
  const worm = worms[currentPlayer];
  if (!worm.alive) return;

  const angleRad = worm.angle * Math.PI / 180;
  const vx = Math.cos(angleRad) * worm.power * 0.2;
  const vy = -Math.sin(angleRad) * worm.power * 0.2;

  projectiles.push(new Projectile(worm.x, worm.y - 15, vx, vy));
  gameState = GameState.FIRING;
}

function checkGameOver() {
  const aliveTeams = [...new Set(worms.filter(w => w.alive).map(w => w.team))];
  if (aliveTeams.length <= 1) {
    gameState = GameState.GAME_OVER;
    gameOverText.textContent = `Player ${aliveTeams[0] + 1} Wins!`;
    gameOverScreen.style.display = 'flex';
  }
}

function setGameState(state) {
  gameState = state;
  menuScreen.style.display = state === GameState.MENU? 'flex' : 'none';
  gameOverScreen.style.display = state === GameState.GAME_OVER? 'flex' : 'none';
  if (state === GameState.AIMING) gameLoop();
}

function initGame() {
  generateTerrain();
  worms = [
    new Worm(100, 0),
    new Worm(canvasWidth - 100, 1)
  ];
  projectiles = [];
  particles = [];
  currentPlayer = 0;
  wind = 0;
  worms.forEach(w => w.update());
  updateStats();
}

function startGame() {
  initGame();
  setGameState(GameState.AIMING);
}

function updateStats() {
  const worm = worms[currentPlayer];
  if (worm) {
    angleEl.textContent = Math.round(worm.angle);
    powerEl.textContent = Math.round(worm.power);
    powerBar.style.width = worm.power + '%';
  }
  windEl.textContent = wind.toFixed(1);
}

function gameLoop() {
  if (gameState === GameState.GAME_OVER) return;
  update();
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

function update() {
  const worm = worms[currentPlayer];
  if (!worm ||!worm.alive) return;

  if (keys['ArrowLeft']) {
    worm.angle = Math.min(180, worm.angle + 1);
    updateStats();
  }
  if (keys['ArrowRight']) {
    worm.angle = Math.max(0, worm.angle - 1);
    updateStats();
  }
  if (keys['ArrowUp']) {
    worm.power = Math.min(100, worm.power + 1);
    updateStats();
  }
  if (keys['ArrowDown']) {
    worm.power = Math.max(10, worm.power - 1);
    updateStats();
  }

  worms.forEach(w => w.update());
  projectiles = projectiles.filter(p => p.update());
  particles = particles.filter(p => p.update());

  if (gameState === GameState.FIRING && projectiles.length === 0) {
    setTimeout(() => {
      if (gameState!== GameState.GAME_OVER) nextTurn();
    }, 500);
  }
}

function draw() {
  // Sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, '#87ceeb');
  gradient.addColorStop(1, '#e0f6ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Terrain
  ctx.fillStyle = '#27ae60';
  ctx.beginPath();
  ctx.moveTo(0, canvasHeight);
  for (let i = 0; i < terrain.length; i++) {
    ctx.lineTo(i * TERRAIN_RESOLUTION, terrain[i]);
  }
  ctx.lineTo(canvasWidth, canvasHeight);
  ctx.closePath();
  ctx.fill();

  // Grass line
  ctx.strokeStyle = '#229954';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < terrain.length; i++) {
    if (i === 0) ctx.moveTo(i * TERRAIN_RESOLUTION, terrain[i]);
    else ctx.lineTo(i * TERRAIN_RESOLUTION, terrain[i]);
  }
  ctx.stroke();

  worms.forEach(w => w.draw());
  projectiles.forEach(p => p.draw());
  particles.forEach(p => p.draw());

  // Aim line
  if (gameState === GameState.AIMING) {
    const worm = worms[currentPlayer];
    if (worm && worm.alive) {
      const angleRad = worm.angle * Math.PI / 180;
      ctx.strokeStyle = 'rgba(231, 76, 60, 0.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(worm.x, worm.y - 15);
      ctx.lineTo(
        worm.x + Math.cos(angleRad) * 60,
        worm.y - 15 - Math.sin(angleRad) * 60
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

// Input
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ') {
    e.preventDefault();
    fire();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

canvas.addEventListener('mousedown', (e) => {
  if (gameState!== GameState.AIMING) return;
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  dragStartX = e.clientX - rect.left;
  dragStartY = e.clientY - rect.top;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging || gameState!== GameState.AIMING) return;
  const worm = worms[currentPlayer];
  if (!worm) return;
  const rect = canvas.getBoundingClientRect();
  const dx = (e.clientX - rect.left) - worm.x;
  const dy = worm.y - (e.clientY - rect.top);
  worm.angle = Math.max(0, Math.min(180, Math.atan2(dy, dx) * 180 / Math.PI));
  worm.power = Math.min(100, Math.max(10, Math.hypot(dx, dy) * 0.5));
  updateStats();
});

canvas.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    fire();
  }
});

leftBtn.addEventListener('touchstart', () => keys['ArrowLeft'] = true);
leftBtn.addEventListener('touchend', () => keys['ArrowLeft'] = false);
rightBtn.addEventListener('touchstart', () => keys['ArrowRight'] = true);
rightBtn.addEventListener('touchend', () => keys['ArrowRight'] = false);
fireBtn.addEventListener('click', fire);

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => setGameState(GameState.MENU));

resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); generateTerrain(); draw(); });
setGameState(GameState.MENU);