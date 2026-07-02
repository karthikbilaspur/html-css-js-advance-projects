const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const minesCountEl = document.getElementById('minesCount');
const timeCountEl = document.getElementById('timeCount');
const resetBtn = document.getElementById('resetBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverText = document.getElementById('gameOverText');
const finalTimeEl = document.getElementById('finalTime');
const playAgainBtn = document.getElementById('playAgainBtn');
const diffBtns = document.querySelectorAll('.diff-btn');

// Game state
let gridSize = 9;
let mineCount = 10;
let cellSize = 30;
let grid = [];
let revealed = [];
let flagged = [];
let gameStarted = false;
let gameOver = false;
let won = false;
let firstClick = true;
let flagsPlaced = 0;
let startTime = 0;
let timerInterval = null;

// Cell colors for numbers 1-8
const NUM_COLORS = {
  1: '#0000ff', 2: '#008000', 3: '#ff0000', 4: '#000080',
  5: '#800000', 6: '#008080', 7: '#000000', 8: '#808080'
};

function initGame() {
  const size = gridSize * cellSize;
  canvas.width = size;
  canvas.height = size;

  grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
  revealed = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
  flagged = Array(gridSize).fill().map(() => Array(gridSize).fill(false));

  gameStarted = false;
  gameOver = false;
  won = false;
  firstClick = true;
  flagsPlaced = 0;

  clearInterval(timerInterval);
  startTime = 0;
  timeCountEl.textContent = '000';
  minesCountEl.textContent = mineCount;
  resetBtn.textContent = '😊';
  gameOverScreen.style.display = 'none';

  draw();
}

function placeMines(excludeR, excludeC) {
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * gridSize);
    const c = Math.floor(Math.random() * gridSize);

    // Don't place mine on first click or adjacent cells
    if (grid[r][c] === -1) continue;
    if (Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1) continue;

    grid[r][c] = -1; // -1 = mine
    placed++;
  }

  // Calculate numbers - CONCEPT: counting adjacent mines
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === -1) continue;

      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
            if (grid[nr][nc] === -1) count++;
          }
        }
      }
      grid[r][c] = count;
    }
  }
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timeCountEl.textContent = String(Math.min(elapsed, 999)).padStart(3, '0');
  }, 1000);
}

// CONCEPT: Flood fill recursion - reveals connected empty cells
function reveal(r, c) {
  if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;
  if (revealed[r][c] || flagged[r][c]) return;

  revealed[r][c] = true;

  if (grid[r][c] === -1) {
    gameOver = true;
    revealAllMines();
    endGame(false);
    return;
  }

  // If empty cell, recursively reveal neighbors
  if (grid[r][c] === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        reveal(r + dr, c + dc);
      }
    }
  }

  checkWin();
}

function revealAllMines() {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === -1) revealed[r][c] = true;
    }
  }
}

function toggleFlag(r, c) {
  if (revealed[r][c] || gameOver) return;

  if (flagged[r][c]) {
    flagged[r][c] = false;
    flagsPlaced--;
  } else {
    if (flagsPlaced < mineCount) {
      flagged[r][c] = true;
      flagsPlaced++;
    }
  }
  minesCountEl.textContent = mineCount - flagsPlaced;
}

function checkWin() {
  let unrevealedCount = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!revealed[r][c] && grid[r][c]!== -1) unrevealedCount++;
    }
  }

  if (unrevealedCount === 0) {
    won = true;
    endGame(true);
  }
}

function endGame(didWin) {
  gameOver = true;
  clearInterval(timerInterval);

  if (didWin) {
    resetBtn.textContent = '😎';
    gameOverText.textContent = 'You Win!';
    finalTimeEl.textContent = timeCountEl.textContent;
    gameOverScreen.style.display = 'block';

    // Auto-flag remaining mines
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === -1) flagged[r][c] = true;
      }
    }
  } else {
    resetBtn.textContent = '😵';
    gameOverText.textContent = 'Game Over!';
    finalTimeEl.textContent = timeCountEl.textContent;
    gameOverScreen.style.display = 'block';
  }
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const x = c * cellSize;
      const y = r * cellSize;

      if (!revealed[r][c]) {
        // Unrevealed cell - 3D button style
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, cellSize - 2, 2);
        ctx.fillRect(x, y, 2, cellSize - 2);
        ctx.fillStyle = '#808080';
        ctx.fillRect(x + cellSize - 2, y + 2, 2, cellSize - 2);
        ctx.fillRect(x + 2, y + cellSize - 2, cellSize - 2, 2);

        if (flagged[r][c]) {
          // Draw flag
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.moveTo(x + cellSize / 2, y + 5);
          ctx.lineTo(x + cellSize / 2 + 8, y + 8);
          ctx.lineTo(x + cellSize / 2, y + 11);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.fillRect(x + cellSize / 2 - 1, y + 5, 2, 15);
        }
      } else {
        // Revealed cell
        ctx.fillStyle = '#bdbdbd';
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeStyle = '#808080';
        ctx.strokeRect(x, y, cellSize, cellSize);

        if (grid[r][c] === -1) {
          // Mine
          ctx.fillStyle = gameOver &&!won? '#ff0000' : '#000';
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + 8, y + cellSize / 2);
          ctx.lineTo(x + cellSize - 8, y + cellSize / 2);
          ctx.moveTo(x + cellSize / 2, y + 8);
          ctx.lineTo(x + cellSize / 2, y + cellSize - 8);
          ctx.stroke();
        } else if (grid[r][c] > 0) {
          // Number
          ctx.fillStyle = NUM_COLORS[grid[r][c]];
          ctx.font = `bold ${cellSize * 0.6}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(grid[r][c], x + cellSize / 2, y + cellSize / 2);
        }
      }
    }
  }
}

// Input handling
canvas.addEventListener('click', (e) => {
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const c = Math.floor(x / cellSize);
  const r = Math.floor(y / cellSize);

  if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;

  if (firstClick) {
    placeMines(r, c);
    startTimer();
    firstClick = false;
    gameStarted = true;
  }

  if (!flagged[r][c]) {
    reveal(r, c);
    draw();
  }
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const c = Math.floor(x / cellSize);
  const r = Math.floor(y / cellSize);

  if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;

  toggleFlag(r, c);
  draw();
});

// Mobile long press for flag
let longPressTimer = null;
canvas.addEventListener('touchstart', (e) => {
  if (gameOver) return;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  const c = Math.floor(x / cellSize);
  const r = Math.floor(y / cellSize);

  longPressTimer = setTimeout(() => {
    toggleFlag(r, c);
    draw();
    longPressTimer = null;
  }, 500);
});

canvas.addEventListener('touchend', (e) => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;

    if (gameOver) return;
    const touch = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const c = Math.floor(x / cellSize);
    const r = Math.floor(y / cellSize);

    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return;

    if (firstClick) {
      placeMines(r, c);
      startTimer();
      firstClick = false;
      gameStarted = true;
    }

    if (!flagged[r][c]) {
      reveal(r, c);
      draw();
    }
  }
});

resetBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

diffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    diffBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gridSize = parseInt(btn.dataset.size);
    mineCount = parseInt(btn.dataset.mines);
    cellSize = Math.floor(480 / gridSize);
    initGame();
  });
});

initGame();