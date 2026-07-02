const GRID_SIZE = 4;
const MAX_LEVEL = 10;
const START_GOAL = 2048;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const levelEl = document.getElementById('level');
const goalEl = document.getElementById('goal');
const gameOverScreen = document.getElementById('gameOverScreen');
const winScreen = document.getElementById('winScreen');
const gameOverText = document.getElementById('gameOverText');
const finalScoreEl = document.getElementById('finalScore');
const finalLevelEl = document.getElementById('finalLevel');
const levelNumEl = document.getElementById('levelNum');
const reachedGoalEl = document.getElementById('reachedGoal');
const nextGoalEl = document.getElementById('nextGoal');

const newGameBtn = document.getElementById('newGameBtn');
const undoBtn = document.getElementById('undoBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const keepPlayingBtn = document.getElementById('keepPlayingBtn');
const newGameWinBtn = document.getElementById('newGameWinBtn');

const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

let grid = [];
let score = 0;
let bestScore = parseInt(localStorage.getItem('2048Best087') || '0');
let level = 1;
let currentGoal = START_GOAL;
let gameOver = false;
let won = false;
let keepPlaying = false;
let undoStack = [];

function resizeCanvas() {
  const size = Math.min(window.innerWidth - 40, 500);
  canvas.width = size;
  canvas.height = size;
}

function createEmptyGrid() {
  return Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
}

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

function slideAndMerge(line) {
  let filtered = line.filter(val => val!== 0);
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered.splice(i + 1, 1);
    }
  }
  while (filtered.length < GRID_SIZE) filtered.push(0);
  return filtered;
}

function move(direction) {
  if (gameOver &&!keepPlaying) return;

  undoStack.push({
    grid: grid.map(row => [...row]),
    score: score,
    level: level,
    currentGoal: currentGoal
  });
  if (undoStack.length > 10) undoStack.shift();

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
    saveGame();
  } else {
    undoStack.pop();
  }
  draw();
}

function canMove() {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return true;
      if (c < GRID_SIZE - 1 && grid[r][c + 1] === grid[r][c]) return true;
      if (r < GRID_SIZE - 1 && grid[r + 1][c] === grid[r][c]) return true;
    }
  }
  return false;
}

function checkWin() {
  if (keepPlaying) return;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] >= currentGoal) {
        if (level >= MAX_LEVEL) {
          won = true;
          gameOverText.textContent = 'You Beat The Game!';
          gameOverScreen.style.display = 'flex';
          finalScoreEl.textContent = score;
          finalLevelEl.textContent = level;
          return;
        } else {
          level++;
          const prevGoal = currentGoal;
          currentGoal *= 2;
          levelNumEl.textContent = level;
          reachedGoalEl.textContent = prevGoal;
          nextGoalEl.textContent = currentGoal;
          winScreen.style.display = 'flex';
          updateStats();
          return;
        }
      }
    }
  }
}

function checkGameOver() {
  if (!canMove()) {
    gameOver = true;
    gameOverScreen.style.display = 'flex';
    finalScoreEl.textContent = score;
    finalLevelEl.textContent = level;
  }
}

function updateStats() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  goalEl.textContent = currentGoal;
  if (score > bestScore) {
    bestScore = score;
    bestEl.textContent = bestScore;
    localStorage.setItem('2048Best087', bestScore);
  }
}

function undo() {
  if (undoStack.length === 0 || gameOver) return;
  const prev = undoStack.pop();
  grid = prev.grid;
  score = prev.score;
  level = prev.level;
  currentGoal = prev.currentGoal;
  updateStats();
  draw();
  saveGame();
}

function saveGame() {
  localStorage.setItem('2048Grid087', JSON.stringify(grid));
  localStorage.setItem('2048Score087', score);
  localStorage.setItem('2048Level087', level);
  localStorage.setItem('2048Goal087', currentGoal);
}

function loadGame() {
  const savedGrid = localStorage.getItem('2048Grid087');
  if (savedGrid) {
    grid = JSON.parse(savedGrid);
    score = parseInt(localStorage.getItem('2048Score087')) || 0;
    level = parseInt(localStorage.getItem('2048Level087')) || 1;
    currentGoal = parseInt(localStorage.getItem('2048Goal087')) || START_GOAL;
    return true;
  }
  return false;
}

function newGame() {
  grid = createEmptyGrid();
  score = 0;
  level = 1;
  currentGoal = START_GOAL;
  gameOver = false;
  won = false;
  keepPlaying = false;
  undoStack = [];
  addRandomTile();
  addRandomTile();
  updateStats();
  gameOverScreen.style.display = 'none';
  winScreen.style.display = 'none';
  saveGame();
  draw();
}

function getTileColor(value) {
  if (value === 0) return '#cdc1b4';
  if (value <= 2048) {
    const colors = {
      2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
      32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
      512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
  }
  const power = Math.log2(value);
  const hue = (power * 25) % 360;
  const saturation = 70;
  const lightness = power > 15? 30 : 50;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getTextColor(value) {
  return value <= 4? '#776e65' : '#f9f6f2';
}

function getFontSize(value, cellSize) {
  const digits = value.toString().length;
  if (digits <= 2) return cellSize * 0.5;
  if (digits === 3) return cellSize * 0.4;
  if (digits === 4) return cellSize * 0.35;
  if (digits === 5) return cellSize * 0.3;
  return cellSize * 0.25;
}

function draw() {
  const size = canvas.width;
  const totalGap = 12 * (GRID_SIZE + 1);
  const cellSize = (size - totalGap) / GRID_SIZE;

  ctx.clearRect(0, 0, size, size);

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const x = 12 + c * (cellSize + 12);
      const y = 12 + r * (cellSize + 12);

      ctx.fillStyle = getTileColor(grid[r][c]);
      ctx.beginPath();
      ctx.roundRect(x, y, cellSize, cellSize, 6);
      ctx.fill();

      if (grid[r][c]!== 0) {
        ctx.fillStyle = getTextColor(grid[r][c]);
        const fontSize = getFontSize(grid[r][c], cellSize);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(grid[r][c], x + cellSize / 2, y + cellSize / 2);
      }
    }
  }
}

// Input
document.addEventListener('keydown', (e) => {
  if (gameOver &&!keepPlaying) return;
  switch (e.key) {
    case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); move('left'); break;
    case 'ArrowRight': case 'd': case 'D': e.preventDefault(); move('right'); break;
    case 'ArrowUp': case 'w': case 'W': e.preventDefault(); move('up'); break;
    case 'ArrowDown': case 's': case 'S': e.preventDefault(); move('down'); break;
  }
});

let touchStartX = 0, touchStartY = 0;
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

newGameBtn.addEventListener('click', newGame);
undoBtn.addEventListener('click', undo);
tryAgainBtn.addEventListener('click', newGame);
keepPlayingBtn.addEventListener('click', () => {
  keepPlaying = true;
  won = false;
  winScreen.style.display = 'none';
});
newGameWinBtn.addEventListener('click', newGame);

upBtn.addEventListener('click', () => move('up'));
downBtn.addEventListener('click', () => move('down'));
leftBtn.addEventListener('click', () => move('left'));
rightBtn.addEventListener('click', () => move('right'));

resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); draw(); });
bestEl.textContent = bestScore;

if (!loadGame()) {
  newGame();
} else {
  updateStats();
  draw();
}