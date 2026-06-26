// Game States
const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  LEVEL_TRANSITION: 'LEVEL_TRANSITION',
  GAME_OVER: 'GAME_OVER'
};

// Constants
const SHIP_SIZE = 20;
const SHIP_THRUST = 0.2;
const SHIP_ROTATION_SPEED = 0.08;
const SHIP_FRICTION = 0.99;
const BULLET_SPEED = 8;
const BULLET_LIFETIME = 60;
const ASTEROID_SPEED = 1.5;
const ASTEROID_VERTICES = 10;
const ASTEROID_JAG = 0.4;
const PARTICLE_LIFETIME = 40;

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const menuScreen = document.getElementById('menuScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const levelScreen = document.getElementById('levelScreen');
const levelNumEl = document.getElementById('levelNum');
const finalScoreEl = document.getElementById('finalScore');
const bestScoreEl = document.getElementById('bestScore');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const thrustBtn = document.getElementById('thrustBtn');
const fireBtn = document.getElementById('fireBtn');

// Game Variables
let gameState = GameState.MENU;
let canvasWidth = 800;
let canvasHeight = 600;

let ship = null;
let asteroids = [];
let bullets = [];
let particles = [];
let score = 0;
let lives = 3;
let level = 1;
let highScore = parseInt(localStorage.getItem('asteroidsHighScore') || '0');

let keys = {};
let lastTime = 0;
let animationId = null;

// Ship Class - Vector Math
class Ship {
  constructor() {
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.radius = SHIP_SIZE / 2;
    this.angle = -Math.PI / 2; // Facing up
    this.rotation = 0;
    this.thrusting = false;
    this.vx = 0;
    this.vy = 0;
    this.blinkNum = Math.ceil(3000 / 16);
    this.blinkTime = Math.ceil(100 / 16);
    this.invulnerable = true;
  }

  update() {
    // Rotation
    this.angle += this.rotation;

    // Thrust - Vector Math: angle to velocity
    if (this.thrusting) {
      this.vx += SHIP_THRUST * Math.cos(this.angle);
      this.vy += SHIP_THRUST * Math.sin(this.angle);
    }

    // Friction
    this.vx *= SHIP_FRICTION;
    this.vy *= SHIP_FRICTION;

    // Move
    this.x += this.vx;
    this.y += this.vy;

    // Screen Wrap
    if (this.x < 0 - this.radius) this.x = canvasWidth + this.radius;
    if (this.x > canvasWidth + this.radius) this.x = 0 - this.radius;
    if (this.y < 0 - this.radius) this.y = canvasHeight + this.radius;
    if (this.y > canvasHeight + this.radius) this.y = 0 - this.radius;

    // Blink invulnerability
    if (this.invulnerable) {
      this.blinkNum--;
      if (this.blinkNum <= 0) this.invulnerable = false;
    }
  }

  draw() {
    if (this.invulnerable && this.blinkNum % 4 < 2) return;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Ship triangle - rotated by angle
    ctx.moveTo(
      this.x + this.radius * Math.cos(this.angle),
      this.y + this.radius * Math.sin(this.angle)
    );
    ctx.lineTo(
      this.x - this.radius * (Math.cos(this.angle) + Math.sin(this.angle)),
      this.y - this.radius * (Math.sin(this.angle) - Math.cos(this.angle))
    );
    ctx.lineTo(
      this.x - this.radius * (Math.cos(this.angle) - Math.sin(this.angle)),
      this.y - this.radius * (Math.sin(this.angle) + Math.cos(this.angle))
    );
    ctx.closePath();
    ctx.stroke();

    // Thrust flame
    if (this.thrusting) {
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.moveTo(
        this.x - this.radius * Math.cos(this.angle),
        this.y - this.radius * Math.sin(this.angle)
      );
      ctx.lineTo(
        this.x - this.radius * 1.5 * Math.cos(this.angle - 0.3),
        this.y - this.radius * 1.5 * Math.sin(this.angle - 0.3)
      );
      ctx.lineTo(
        this.x - this.radius * 1.5 * Math.cos(this.angle + 0.3),
        this.y - this.radius * 1.5 * Math.sin(this.angle + 0.3)
      );
      ctx.closePath();
      ctx.fill();
    }
  }
}

// Asteroid Class
class Asteroid {
  constructor(x, y, radius, level) {
    this.x = x || Math.random() * canvasWidth;
    this.y = y || Math.random() * canvasHeight;
    this.radius = radius || 50;
    this.level = level || 3; // 3=large, 2=medium, 1=small

    // Random velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = ASTEROID_SPEED * (4 - this.level);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Jagged shape vertices
    this.vertices = [];
    for (let i = 0; i < ASTEROID_VERTICES; i++) {
      this.vertices.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG);
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Screen Wrap
    if (this.x < 0 - this.radius) this.x = canvasWidth + this.radius;
    if (this.x > canvasWidth + this.radius) this.x = 0 - this.radius;
    if (this.y < 0 - this.radius) this.y = canvasHeight + this.radius;
    if (this.y > canvasHeight + this.radius) this.y = 0 - this.radius;
  }

  draw() {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < ASTEROID_VERTICES; i++) {
      const angle = (i / ASTEROID_VERTICES) * Math.PI * 2;
      const r = this.radius * this.vertices[i];
      const x = this.x + r * Math.cos(angle);
      const y = this.y + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
}

// Bullet Class
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.vx = BULLET_SPEED * Math.cos(angle);
    this.vy = BULLET_SPEED * Math.sin(angle);
    this.life = BULLET_LIFETIME;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;

    // Screen Wrap
    if (this.x < 0) this.x = canvasWidth;
    if (this.x > canvasWidth) this.x = 0;
    if (this.y < 0) this.y = canvasHeight;
    if (this.y > canvasHeight) this.y = 0;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Particle Class
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6;
    this.life = PARTICLE_LIFETIME;
    this.size = Math.random() * 3 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.life / PARTICLE_LIFETIME})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
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
  levelScreen.style.display = state === GameState.LEVEL_TRANSITION? 'block' : 'none';

  if (state === GameState.PLAYING) {
    lastTime = performance.now();
    gameLoop(lastTime);
  } else {
    cancelAnimationFrame(animationId);
  }
}

function initGame() {
  ship = new Ship();
  asteroids = [];
  bullets = [];
  particles = [];
  score = 0;
  lives = 3;
  level = 1;
  updateStats();
  createAsteroids();
}

function createAsteroids() {
  const numAsteroids = 3 + level;
  for (let i = 0; i < numAsteroids; i++) {
    let x, y;
    do {
      x = Math.random() * canvasWidth;
      y = Math.random() * canvasHeight;
    } while (distBetweenPoints(ship.x, ship.y, x, y) < 150);
    asteroids.push(new Asteroid(x, y, 50, 3));
  }
}

function startGame() {
  initGame();
  setGameState(GameState.PLAYING);
}

function nextLevel() {
  level++;
  levelEl.textContent = level;
  levelNumEl.textContent = level;
  setGameState(GameState.LEVEL_TRANSITION);

  setTimeout(() => {
    createAsteroids();
    ship.x = canvasWidth / 2;
    ship.y = canvasHeight / 2;
    ship.vx = 0;
    ship.vy = 0;
    ship.invulnerable = true;
    ship.blinkNum = Math.ceil(3000 / 16);
    setGameState(GameState.PLAYING);
  }, 2000);
}

function gameOver() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('asteroidsHighScore', highScore);
  }
  setGameState(GameState.GAME_OVER);
  finalScoreEl.textContent = score;
  bestScoreEl.textContent = highScore;
}

function updateStats() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level;
}

function distBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
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
  // Ship controls
  ship.rotation = 0;
  if (keys['ArrowLeft'] || keys['a']) ship.rotation = -SHIP_ROTATION_SPEED;
  if (keys['ArrowRight'] || keys['d']) ship.rotation = SHIP_ROTATION_SPEED;
  ship.thrusting = keys['ArrowUp'] || keys['w'];

  ship.update();

  // Bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    if (bullets[i].life <= 0) {
      bullets.splice(i, 1);
      continue;
    }

    // Bullet-Asteroid collision
    for (let j = asteroids.length - 1; j >= 0; j--) {
      const ast = asteroids[j];
      if (distBetweenPoints(bullets[i].x, bullets[i].y, ast.x, ast.y) < ast.radius) {
        // Split asteroid
        if (ast.level > 1) {
          asteroids.push(new Asteroid(ast.x, ast.y, ast.radius / 2, ast.level - 1));
          asteroids.push(new Asteroid(ast.x, ast.y, ast.radius / 2, ast.level - 1));
        }

        // Score
        const points = [0, 100, 50, 20];
        score += points[ast.level];
        updateStats();

        // Particles
        for (let k = 0; k < 15; k++) {
          particles.push(new Particle(ast.x, ast.y));
        }

        asteroids.splice(j, 1);
        bullets.splice(i, 1);

        // Check level complete
        if (asteroids.length === 0) {
          nextLevel();
        }
        break;
      }
    }
  }

  // Asteroids
  for (let i = 0; i < asteroids.length; i++) {
    asteroids[i].update();

    // Ship-Asteroid collision
    if (!ship.invulnerable &&
        distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.radius + asteroids[i].radius) {
      lives--;
      updateStats();

      // Explosion
      for (let k = 0; k < 30; k++) {
        particles.push(new Particle(ship.x, ship.y));
      }

      if (lives <= 0) {
        gameOver();
      } else {
        ship = new Ship();
      }
    }
  }

  // Particles
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

  asteroids.forEach(ast => ast.draw());
  bullets.forEach(bullet => bullet.draw());
  particles.forEach(p => p.draw());
  if (ship) ship.draw();
}

function shoot() {
  if (gameState!== GameState.PLAYING || bullets.length >= 4) return;
  bullets.push(new Bullet(
    ship.x + ship.radius * Math.cos(ship.angle),
    ship.y + ship.radius * Math.sin(ship.angle),
    ship.angle
  ));
}

// Input
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ') {
    e.preventDefault();
    shoot();
  }
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
thrustBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowUp'] = true; });
thrustBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowUp'] = false; });
fireBtn.addEventListener('click', shoot);

// Button events
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => setGameState(GameState.MENU));

// Init
setGameState(GameState.MENU);
updateStats();