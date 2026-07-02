// Game Constants
const GRID_SIZE = 4;
const CELL_SIZE = 100;
const CELL_GAP = 12;
const CANVAS_PADDING = 12;

// Colors for tiles - CONCEPT: mapping values to visuals
const TILE_COLORS = {
  0: '#cdc1b4',
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e'
};

const TEXT_COLORS = {
  2: '#776e65', 4: '#776e65', 8: '#f9f6f2', 16: '#f9f6f2',
  32: '#f9f6f2', 64: '#f9f6f2', 128: '#f9f6f2', 256: '#f9f6f2',
  512: '#f9f6f2', 1024: '#f9f6f2', 2048: '#f9f6f2'
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DOM Elements
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const gameOverScreen = document.getElementById('gameOverScreen');
const winScreen = document.getElementById('winScreen');
const gameOverText = document.getElementById('gameOverText');
const finalScoreEl = document.getElementById('finalScore');

const newGameBtn = document.getElementById('newGameBtn');
const undoBtn = document.getElementById('undoBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const keepPlayingBtn = document.getElementById('keepPlayingBtn');
const newGameWinBtn = document.getElementById('newGameWinBtn');

const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

// Game State - 2D Array Logic
let grid = [];
let score = 0;
let bestScore = parseInt(localStorage.getItem('2048Best') || '0');
let gameOver = false;
let won = false;
let keepPlaying = false;
let undoStack = []; // CONCEPT: stack for undo system

// Responsive canvas
function resizeCanvas() {
  const size = Math.min(window.innerWidth - 40, 500);
  canvas.width = size;
  canvas.height = size;
}

resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  draw();
});

// Initialize empty 4x4 grid
function createEmptyGrid() {
  return Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
}

// Add random tile - 2 or 4
function addRandomTile() {
  const emptyCells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return false;

  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[r][c] = Math.random() < 0.9? 2 : 4;
  return true;
}

// CONCEPT: Grid merging logic - the heart of 2048
function slideAndMerge(line) {
  // 1. Remove zeros
  let filtered = line.filter(val => val!== 0);

  // 2. Merge adjacent same numbers
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered.splice(i + 1, 1);
    }
  }

  // 3. Pad with zeros
  while (filtered.length < GRID_SIZE) filtered.push(0);
  return filtered;
}

// Move in direction - CONCEPT: 2D array transformation
function move(direction) {
  if (gameOver &&!keepPlaying) return;

  // Save state for undo
  undoStack.push({
    grid: grid.map(row => [...row]),
    score: score
  });
  if (undoStack.length > 10) undoStack.shift(); // Limit undo history

  let moved = false;
  const newGrid = createEmptyGrid();

  if (direction === 'left') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const newRow = slideAndMerge([...grid[r]]);
      newGrid[r] = newRow;
      if (JSON.stringify(newRow)!== JSON.stringify(grid[r])) moved = true;
    }
  } else if (direction === 'right') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const reversed = [...grid[r]].reverse();
      const newRow = slideAndMerge(reversed).reverse();
      newGrid[r] = newRow;
      if (JSON.stringify(newRow)!== JSON.stringify(grid[r])) moved = true;
    }
  } else if (direction === 'up') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = grid.map(row => row[c]);
      const newCol = slideAndMerge(col);
      for (let r = 0; r < GRID_SIZE; r++) {
        newGrid[r][c] = newCol[r];
        if (newCol[r]!== grid[r][c]) moved = true;
      }
    }
  } else if (direction === 'down') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = grid.map(row => row[c]).reverse();
      const newCol = slideAndMerge(col).reverse();
      for (let r = 0; r < GRID_SIZE; r++) {
        newGrid[r][c] = newCol[r];
        if (newCol[r]!== grid[r][c]) moved = true;
      }
    }
  }

  if (moved) {
    grid = newGrid;
    addRandomTile();
    updateScore();
    checkWin();
    checkGameOver();
  } else {
    undoStack.pop(); // No move made, remove from stack
  }

  draw();
}

// Check if moves available
function canMove() {
  // Check for empty cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return true;
    }
  }

  // Check for possible merges
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c];
      if (c < GRID_SIZE - 1 && grid[r][c + 1] === val) return true;
      if (r < GRID_SIZE - 1 && grid[r + 1][c] === val) return true;
    }
  }
  return false;
}

function checkWin() {
  if (won || keepPlaying) return;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 2048) {
        won = true;
        winScreen.style.display = 'flex';
        return;
      }
    }
  }
}

function checkGameOver() {
  if (!canMove()) {
    gameOver = true;
    gameOverScreen.style.display = 'flex';
    finalScoreEl.textContent = score;
  }
}

function updateScore() {
  scoreEl.textContent = score;
  if (score > bestScore) {
    bestScore = score;
    bestEl.textContent = bestScore;
    localStorage.setItem('2048Best', bestScore);
  }
}

// Undo system - CONCEPT: state management with stack
function undo() {
  if (undoStack.length === 0 || gameOver) return;
  const prev = undoStack.pop();
  grid = prev.grid;
  score = prev.score;
  updateScore();
  draw();
}

function newGame() {
  grid = createEmptyGrid();
  score = 0;
  gameOver = false;
  won = false;
  keepPlaying = false;
  undoStack = [];
  addRandomTile();
  addRandomTile();
  updateScore();
  gameOverScreen.style.display = 'none';
  winScreen.style.display = 'none';
  draw();
}

// Drawing
function draw() {
  const size = canvas.width;
  const totalGap = CELL_GAP * (GRID_SIZE + 1);
  const cellSize = (size - totalGap) / GRID_SIZE;

  ctx.clearRect(0, 0, size, size);

  // Draw grid background
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const x = CELL_GAP + c * (cellSize + CELL_GAP);
      const y = CELL_GAP + r * (cellSize + CELL_GAP);

      // Cell background
      ctx.fillStyle = TILE_COLORS[grid[r][c]] || '#3c3a32';
      ctx.beginPath();
      ctx.roundRect(x, y, cellSize, cellSize, 6);
      ctx.fill();

      // Tile value
      if (grid[r][c]!== 0) {
        ctx.fillStyle = TEXT_COLORS[grid[r][c]] || '#f9f6f2';
        const fontSize = grid[r][c] < 100? cellSize * 0.5 :
                        grid[r][c] < 1000? cellSize * 0.4 : cellSize * 0.35;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(grid[r][c], x + cellSize / 2, y + cellSize / 2);
      }
    }
  }
}

// Input handling
document.addEventListener('keydown', (e) => {
  if (gameOver &&!keepPlaying) return;

  switch (e.key) {
    case 'ArrowLeft': case 'a': case 'A':
      e.preventDefault();
      move('left');
      break;
    case 'ArrowRight': case 'd': case 'D':
      e.preventDefault();
      move('right');
      break;
    case 'ArrowUp': case 'w': case 'W':
      e.preventDefault();
      move('up');
      break;
    case 'ArrowDown': case 's': case 'S':
      e.preventDefault();
      move('down');
      break;
  }
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (gameOver &&!keepPlaying) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) move('right');
    else if (dx < -30) move('left');
  } else {
    if (dy > 30) move('down');
    else if (dy < -30) move('up');
  }
}, { passive: true });

// Button events
newGameBtn.addEventListener('click', newGame);
undoBtn.addEventListener('click', undo);
tryAgainBtn.addEventListener('click', newGame);
keepPlayingBtn.addEventListener('click', () => {
  keepPlaying = true;
  winScreen.style.display = 'none';
});
newGameWinBtn.addEventListener('click', newGame);

upBtn.addEventListener('click', () => move('up'));
downBtn.addEventListener('click', () => move('down'));
leftBtn.addEventListener('click', () => move('left'));
rightBtn.addEventListener('click', () => move('right'));

// Init
bestEl.textContent = bestScore;
newGame();