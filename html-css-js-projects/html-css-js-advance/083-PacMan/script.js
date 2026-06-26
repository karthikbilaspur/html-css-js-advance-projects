// Game States
const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  LEVEL_TRANSITION: 'LEVEL_TRANSITION',
  GAME_OVER: 'GAME_OVER'
};

// Ghost States - FSM
const GhostState = {
  SCATTER: 'SCATTER',
  CHASE: 'CHASE',
  FRIGHTENED: 'FRIGHTENED',
  EATEN: 'EATEN'
};

// Tile Types
const TILE = {
  EMPTY: 0,
  WALL: 1,
  DOT: 2,
  POWER: 3,
  GATE: 4
};

// Directions
const DIR = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

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
const gameOverText = document.getElementById('gameOverText');
const finalScoreEl = document.getElementById('finalScore');
const bestScoreEl = document.getElementById('bestScore');
const levelNumEl = document.getElementById('levelNum');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');

const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Game Constants
const TILE_SIZE = 20;
const PAC_SPEED = 2;
const GHOST_SPEED = 1.8;
const FRIGHTENED_TIME = 360; // frames
const SCATTER_TIME = 420;
const CHASE_TIME = 1200;

// Level Data - Tilemap: 2D Array
const LEVEL_MAP = [
  [1,1,1,1,1,1],
  [1,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,3,1,1,1,1,2,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
  [1,2,1,1,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1],
  [1,1,1,1,1,1,2,1,1,1,0,1,1,0,1,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,1,2,1,1],
  [0,0,0,0,2,0,0,0,1,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,1,0,1,1,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0],
  [0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,1,1,1,0,1,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,1,1,2,2,3,1],
  [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
  [1,1,1,2,1,1,2,1,1,2,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
  [1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1],
  [1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1],
  [1,2,2,1],
  [1,1,1,1]
];

// Game Variables
let gameState = GameState.MENU;
let maze = [];
let rows = LEVEL_MAP.length;
let cols = LEVEL_MAP[0].length;

let pacman = {
  x: 14 * TILE_SIZE,
  y: 23 * TILE_SIZE,
  dir: DIR.LEFT,
  nextDir: DIR.LEFT,
  speed: PAC_SPEED
};

let ghosts = [];
let dotsLeft = 0;
let score = 0;
let lives = 3;
let level = 1;
let highScore = parseInt(localStorage.getItem('pacmanHighScore') || '0');
let frightenedTimer = 0;
let globalGhostState = GhostState.SCATTER;
let stateTimer = 0;

let keys = {};
let animationId = null;

// Ghost Class - FSM + A* Pathfinding
class Ghost {
  constructor(x, y, color, scatterTarget) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.color = color;
    this.state = GhostState.SCATTER;
    this.dir = DIR.LEFT;
    this.speed = GHOST_SPEED;
    this.scatterTarget = scatterTarget; // Corner of maze
    this.path = [];
  }

  // A* Pathfinding - teaches CONCEPT: find shortest path on grid
  findPath(targetX, targetY) {
    const start = { x: Math.floor(this.x / TILE_SIZE), y: Math.floor(this.y / TILE_SIZE) };
    const end = { x: Math.floor(targetX / TILE_SIZE), y: Math.floor(targetY / TILE_SIZE) };

    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(`${start.x},${start.y}`, 0);
    fScore.set(`${start.x},${start.y}`, heuristic(start, end));

    while (openSet.length > 0) {
      // Get node with lowest fScore
      let current = openSet.reduce((a, b) =>
        fScore.get(`${a.x},${a.y}`) < fScore.get(`${b.x},${b.y}`)? a : b
      );

      if (current.x === end.x && current.y === end.y) {
        return reconstructPath(cameFrom, current);
      }

      openSet.splice(openSet.indexOf(current), 1);

      for (let dir of [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT]) {
        const neighbor = { x: current.x + dir.x, y: current.y + dir.y };

        if (neighbor.x < 0 || neighbor.x >= cols || neighbor.y < 0 || neighbor.y >= rows) continue;
        if (maze[neighbor.y][neighbor.x] === TILE.WALL) continue;

        const tentativeG = gScore.get(`${current.x},${current.y}`) + 1;

        if (!gScore.has(`${neighbor.x},${neighbor.y}`) || tentativeG < gScore.get(`${neighbor.x},${neighbor.y}`)) {
          cameFrom.set(`${neighbor.x},${neighbor.y}`, current);
          gScore.set(`${neighbor.x},${neighbor.y}`, tentativeG);
          fScore.set(`${neighbor.x},${neighbor.y}`, tentativeG + heuristic(neighbor, end));

          if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
            openSet.push(neighbor);
          }
        }
      }
    }
    return []; // No path
  }

  update() {
    // State transitions
    if (this.state === GhostState.FRIGHTENED) {
      frightenedTimer--;
      if (frightenedTimer <= 0) {
        this.state = globalGhostState;
        this.speed = GHOST_SPEED;
      }
    } else if (this.state === GhostState.EATEN) {
      // Return to ghost house
      if (Math.abs(this.x - this.startX) < 5 && Math.abs(this.y - this.startY) < 5) {
        this.state = globalGhostState;
        this.speed = GHOST_SPEED;
      }
    }

    // Choose target based on state - FSM
    let targetX, targetY;
    if (this.state === GhostState.SCATTER) {
      targetX = this.scatterTarget.x;
      targetY = this.scatterTarget.y;
    } else if (this.state === GhostState.CHASE) {
      targetX = pacman.x;
      targetY = pacman.y;
      // Blinky targets pacman directly
      // Pinky targets 4 tiles ahead of pacman
      if (this.color === '#ffb8ff') {
        targetX += pacman.dir.x * 4 * TILE_SIZE;
        targetY += pacman.dir.y * 4 * TILE_SIZE;
      }
    } else if (this.state === GhostState.FRIGHTENED) {
      // Random movement
      targetX = this.x + (Math.random() - 0.5) * 200;
      targetY = this.y + (Math.random() - 0.5) * 200;
    } else {
      targetX = this.startX;
      targetY = this.startY;
    }

    // Simple movement: try to move toward target
    const currentTile = { x: Math.floor(this.x / TILE_SIZE), y: Math.floor(this.y / TILE_SIZE) };
    const targetTile = { x: Math.floor(targetX / TILE_SIZE), y: Math.floor(targetY / TILE_SIZE) };

    // Only change direction at tile centers
    if (this.x % TILE_SIZE < 2 && this.y % TILE_SIZE < 2) {
      let bestDir = this.dir;
      let bestDist = Infinity;

      for (let dir of [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT]) {
        // No reverse unless frightened
        if (this.state!== GhostState.FRIGHTENED &&
            dir.x === -this.dir.x && dir.y === -this.dir.y) continue;

        const nextTile = { x: currentTile.x + dir.x, y: currentTile.y + dir.y };
        if (nextTile.x < 0 || nextTile.x >= cols || nextTile.y < 0 || nextTile.y >= rows) continue;
        if (maze[nextTile.y][nextTile.x] === TILE.WALL) continue;

        const dist = Math.abs(nextTile.x - targetTile.x) + Math.abs(nextTile.y - targetTile.y);
        if (dist < bestDist) {
          bestDist = dist;
          bestDir = dir;
        }
      }
      this.dir = bestDir;
    }

    this.x += this.dir.x * this.speed;
    this.y += this.dir.y * this.speed;

    // Wrap around tunnels
    if (this.x < 0) this.x = cols * TILE_SIZE;
    if (this.x >= cols * TILE_SIZE) this.x = 0;
  }

  draw() {
    const x = this.x;
    const y = this.y;

    if (this.state === GhostState.FRIGHTENED) {
      ctx.fillStyle = frightenedTimer < 60 && Math.floor(frightenedTimer / 8) % 2? '#fff' : '#2121ff';
    } else if (this.state === GhostState.EATEN) {
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = this.color;
    }

    // Ghost body
    ctx.beginPath();
    ctx.arc(x, y - 3, TILE_SIZE / 2 - 2, Math.PI, 0);
    ctx.lineTo(x + TILE_SIZE / 2 - 2, y + TILE_SIZE / 2 - 2);
    // Wavy bottom
    for (let i = 0; i < 3; i++) {
      ctx.lineTo(x + TILE_SIZE / 2 - 2 - (i + 0.5) * 6, y + TILE_SIZE / 2 - 6);
      ctx.lineTo(x + TILE_SIZE / 2 - 2 - (i + 1) * 6, y + TILE_SIZE / 2 - 2);
    }
    ctx.closePath();
    ctx.fill();

    // Eyes
    if (this.state!== GhostState.FRIGHTENED) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x - 4, y - 4, 3, 0, Math.PI * 2);
      ctx.arc(x + 4, y - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x - 4 + this.dir.x * 1, y - 4 + this.dir.y * 1, 1.5, 0, Math.PI * 2);
      ctx.arc(x + 4 + this.dir.x * 1, y - 4 + this.dir.y * 1, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Helper functions
function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan distance
}

function reconstructPath(cameFrom, current) {
  const path = [current];
  while (cameFrom.has(`${current.x},${current.y}`)) {
    current = cameFrom.get(`${current.x},${current.y}`);
    path.unshift(current);
  }
  return path;
}

// Responsive canvas
function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.7, 560);
  canvas.width = size;
  canvas.height = size;
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
    gameLoop();
  } else {
    cancelAnimationFrame(animationId);
  }
}

function initLevel() {
  maze = LEVEL_MAP.map(row => [...row]);
  dotsLeft = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (maze[r][c] === TILE.DOT || maze[r][c] === TILE.POWER) dotsLeft++;
    }
  }

  pacman.x = 14 * TILE_SIZE;
  pacman.y = 23 * TILE_SIZE;
  pacman.dir = DIR.LEFT;
  pacman.nextDir = DIR.LEFT;

  ghosts = [
    new Ghost(14 * TILE_SIZE, 11 * TILE_SIZE, '#ff0000', { x: 25 * TILE_SIZE, y: 0 }),
    new Ghost(13 * TILE_SIZE, 14 * TILE_SIZE, '#ffb8ff', { x: 2 * TILE_SIZE, y: 0 }),
    new Ghost(14 * TILE_SIZE, 14 * TILE_SIZE, '#00ffff', { x: 25 * TILE_SIZE, y: 30 * TILE_SIZE }),
    new Ghost(15 * TILE_SIZE, 14 * TILE_SIZE, '#ffb852', { x: 2 * TILE_SIZE, y: 30 * TILE_SIZE })
  ];

  frightenedTimer = 0;
  globalGhostState = GhostState.SCATTER;
  stateTimer = 0;
}

function startGame() {
  score = 0;
  lives = 3;
  level = 1;
  initLevel();
  setGameState(GameState.PLAYING);
  updateStats();
}

function nextLevel() {
  level++;
  levelNumEl.textContent = level;
  setGameState(GameState.LEVEL_TRANSITION);
  setTimeout(() => {
    initLevel();
    setGameState(GameState.PLAYING);
  }, 2000);
}

function updateStats() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  levelEl.textContent = level;
}

function gameOver(won) {
  setGameState(GameState.GAME_OVER);
  gameOverText.textContent = won? 'You Win!' : 'Game Over';
  finalScoreEl.textContent = score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('pacmanHighScore', highScore);
  }
  bestScoreEl.textContent = highScore;
}

// Game Loop
function gameLoop() {
  if (gameState!== GameState.PLAYING) return;

  update();
  draw();

  animationId = requestAnimationFrame(gameLoop);
}

function update() {
  // Global ghost state timer
  stateTimer++;
  if (globalGhostState === GhostState.SCATTER && stateTimer > SCATTER_TIME) {
    globalGhostState = GhostState.CHASE;
    stateTimer = 0;
    ghosts.forEach(g => { if (g.state!== GhostState.FRIGHTENED && g.state!== GhostState.EATEN) g.state = GhostState.CHASE; });
  } else if (globalGhostState === GhostState.CHASE && stateTimer > CHASE_TIME) {
    globalGhostState = GhostState.SCATTER;
    stateTimer = 0;
    ghosts.forEach(g => { if (g.state!== GhostState.FRIGHTENED && g.state!== GhostState.EATEN) g.state = GhostState.SCATTER; });
  }

  // Pacman input
  if (keys['ArrowUp'] || keys['w']) pacman.nextDir = DIR.UP;
  if (keys['ArrowDown'] || keys['s']) pacman.nextDir = DIR.DOWN;
  if (keys['ArrowLeft'] || keys['a']) pacman.nextDir = DIR.LEFT;
  if (keys['ArrowRight'] || keys['d']) pacman.nextDir = DIR.RIGHT;

  // Try to change direction at tile center
  const tileX = Math.floor(pacman.x / TILE_SIZE);
  const tileY = Math.floor(pacman.y / TILE_SIZE);
  const nextTileX = tileX + pacman.nextDir.x;
  const nextTileY = tileY + pacman.nextDir.y;

  if (pacman.x % TILE_SIZE < 3 && pacman.y % TILE_SIZE < 3) {
    if (nextTileX >= 0 && nextTileX < cols && nextTileY >= 0 && nextTileY < rows) {
      if (maze[nextTileY][nextTileX]!== TILE.WALL) {
        pacman.dir = pacman.nextDir;
      }
    }
  }

  // Move pacman
  const newX = pacman.x + pacman.dir.x * pacman.speed;
  const newY = pacman.y + pacman.dir.y * pacman.speed;
  const newTileX = Math.floor(newX / TILE_SIZE);
  const newTileY = Math.floor(newY / TILE_SIZE);

  if (newTileX >= 0 && newTileX < cols && maze[newTileY][newTileX]!== TILE.WALL) {
    pacman.x = newX;
    pacman.y = newY;
  }

  // Wrap tunnels
  if (pacman.x < 0) pacman.x = cols * TILE_SIZE;
  if (pacman.x >= cols * TILE_SIZE) pacman.x = 0;

  // Eat dots
  const currentTile = maze[tileY][tileX];
  if (currentTile === TILE.DOT) {
    maze[tileY][tileX] = TILE.EMPTY;
    score += 10;
    dotsLeft--;
    updateStats();
  } else if (currentTile === TILE.POWER) {
    maze[tileY][tileX] = TILE.EMPTY;
    score += 50;
    dotsLeft--;
    frightenedTimer = FRIGHTENED_TIME;
    ghosts.forEach(g => {
      if (g.state!== GhostState.EATEN) {
        g.state = GhostState.FRIGHTENED;
        g.speed = GHOST_SPEED * 0.5;
      }
    });
    updateStats();
  }

  // Update ghosts
  ghosts.forEach(ghost => {
    ghost.update();

    // Collision with pacman
    const dist = Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y);
    if (dist < TILE_SIZE - 4) {
      if (ghost.state === GhostState.FRIGHTENED) {
        ghost.state = GhostState.EATEN;
        score += 200;
        updateStats();
      } else if (ghost.state!== GhostState.EATEN) {
        lives--;
        updateStats();
        if (lives <= 0) {
          gameOver(false);
        } else {
          // Reset positions
          pacman.x = 14 * TILE_SIZE;
          pacman.y = 23 * TILE_SIZE;
          ghosts.forEach(g => {
            g.x = g.startX;
            g.y = g.startY;
            g.state = GhostState.SCATTER;
          });
        }
      }
    }
  });

  if (dotsLeft === 0) {
    nextLevel();
  }
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw maze
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * TILE_SIZE;
      const y = r * TILE_SIZE;

      if (maze[r][c] === TILE.WALL) {
        ctx.fillStyle = '#2121ff';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      } else if (maze[r][c] === TILE.DOT) {
        ctx.fillStyle = '#ffb897';
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (maze[r][c] === TILE.POWER) {
        ctx.fillStyle = '#ffb897';
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (maze[r][c] === TILE.GATE) {
        ctx.fillStyle = '#ffb897';
        ctx.fillRect(x, y + TILE_SIZE / 2 - 1, TILE_SIZE, 2);
      }
    }
  }

  // Draw ghosts
  ghosts.forEach(g => g.draw());

  // Draw pacman
  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  const mouthAngle = Math.abs(Math.sin(Date.now() / 100)) * 0.5;
  ctx.arc(pacman.x, pacman.y, TILE_SIZE / 2 - 2, mouthAngle + Math.atan2(pacman.dir.y, pacman.dir.x),
          Math.PI * 2 - mouthAngle + Math.atan2(pacman.dir.y, pacman.dir.x));
  ctx.lineTo(pacman.x, pacman.y);
  ctx.fill();
}

// Input
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false