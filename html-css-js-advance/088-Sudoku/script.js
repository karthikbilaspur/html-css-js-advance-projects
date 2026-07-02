const GRID_SIZE = 9;
const BOX_SIZE = 3;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const difficultyEl = document.getElementById('difficulty');
const mistakesEl = document.getElementById('mistakes');
const timeEl = document.getElementById('time');
const winScreen = document.getElementById('winScreen');
const difficultyScreen = document.getElementById('difficultyScreen');
const finalTimeEl = document.getElementById('finalTime');
const finalDiffEl = document.getElementById('finalDiff');

const newGameBtn = document.getElementById('newGameBtn');
const solveBtn = document.getElementById('solveBtn');
const hintBtn = document.getElementById('hintBtn');
const notesBtn = document.getElementById('notesBtn');
const newGameWinBtn = document.getElementById('newGameWinBtn');
const numBtns = document.querySelectorAll('.num-btn');
const diffBtns = document.querySelectorAll('.diff-btn');

let grid = [];
let solution = [];
let notes = [];
let fixed = [];
let selectedCell = null;
let notesMode = false;
let mistakes = 0;
let maxMistakes = 3;
let startTime = 0;
let timerInterval = null;
let difficulty = 'easy';

const DIFFICULTY_CLUES = {
  easy: 40,
  medium: 32,
  hard: 25,
  expert: 17
};

function resizeCanvas() {
  const size = Math.min(window.innerWidth - 80, 540);
  canvas.width = size;
  canvas.height = size;
}

function createEmptyGrid() {
  return Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
}

// CONCEPT: Backtracking algorithm - core of Sudoku generation
function solveSudoku(board) {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isValid(board, row, col, num) {
  // Check row
  for (let x = 0; x < GRID_SIZE; x++) {
    if (board[row][x] === num) return false;
  }
  // Check column
  for (let x = 0; x < GRID_SIZE; x++) {
    if (board[x][col] === num) return false;
  }
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  return true;
}

function generateSudoku(diff) {
  // Generate solved board
  solution = createEmptyGrid();
  solveSudoku(solution);

  // Remove numbers to create puzzle
  grid = solution.map(row => [...row]);
  fixed = createEmptyGrid();
  notes = createEmptyGrid().map(row => row.map(() => new Set()));

  const clues = DIFFICULTY_CLUES[diff];
  const cellsToRemove = 81 - clues;

  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (grid[row][col]!== 0) {
      grid[row][col] = 0;
      removed++;
    }
  }

  // Mark fixed cells
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c]!== 0) fixed[r][c] = 1;
    }
  }
}

function newGame() {
  difficultyScreen.style.display = 'flex';
}

function startGame(diff) {
  difficulty = diff;
  difficultyEl.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
  generateSudoku(diff);
  selectedCell = null;
  mistakes = 0;
  mistakesEl.textContent = mistakes;
  startTime = Date.now();
  updateTimer();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  difficultyScreen.style.display = 'none';
  winScreen.style.display = 'none';
  draw();
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');
  timeEl.textContent = `${mins}:${secs}`;
}

function selectCell(row, col) {
  selectedCell = { row, col };
  draw();
}

function inputNumber(num) {
  if (!selectedCell || gameOver) return;
  const { row, col } = selectedCell;

  if (fixed[row][col]) return;

  if (notesMode && num!== 0) {
    if (notes[row][col].has(num)) {
      notes[row][col].delete(num);
    } else {
      notes[row][col].add(num);
    }
    draw();
    return;
  }

  if (num === 0) {
    grid[row][col] = 0;
    notes[row][col].clear();
  } else {
    if (solution[row][col]!== num) {
      mistakes++;
      mistakesEl.textContent = mistakes;
      if (mistakes >= maxMistakes) {
        gameOver = true;
        clearInterval(timerInterval);
        alert('Game Over! Too many mistakes.');
        return;
      }
    }
    grid[row][col] = num;
    notes[row][col].clear();
    checkWin();
  }
  draw();
}

function checkWin() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0 || grid[r][c]!== solution[r][c]) return;
    }
  }
  clearInterval(timerInterval);
  finalTimeEl.textContent = timeEl.textContent;
  finalDiffEl.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  winScreen.style.display = 'flex';
}

function giveHint() {
  if (gameOver) return;
  const emptyCells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return;
  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  grid[r][c] = solution[r][c];
  fixed[r][c] = 1;
  draw();
  checkWin();
}

function solvePuzzle() {
  grid = solution.map(row => [...row]);
  notes = createEmptyGrid().map(row => row.map(() => new Set()));
  draw();
}

function draw() {
  const size = canvas.width;
  const cellSize = size / 9;

  ctx.clearRect(0, 0, size, size);

  // Draw cells
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = c * cellSize;
      const y = r * cellSize;

      // Cell background
      if (selectedCell && selectedCell.row === r && selectedCell.col === c) {
        ctx.fillStyle = '#bbdefb';
      } else if (selectedCell && (selectedCell.row === r || selectedCell.col === c ||
          (Math.floor(selectedCell.row / 3) === Math.floor(r / 3) &&
           Math.floor(selectedCell.col / 3) === Math.floor(c / 3)))) {
        ctx.fillStyle = '#e3f2fd';
      } else {
        ctx.fillStyle = '#fff';
      }
      ctx.fillRect(x, y, cellSize, cellSize);

      // Draw number
      if (grid[r][c]!== 0) {
        ctx.fillStyle = fixed[r][c]? '#2c3e50' : '#667eea';
        ctx.font = `bold ${cellSize * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(grid[r][c], x + cellSize / 2, y + cellSize / 2);
      } else if (notes[r][c].size > 0) {
        // Draw pencil marks
        ctx.fillStyle = '#7f8c8d';
        ctx.font = `${cellSize * 0.2}px Arial`;
        let noteStr = '';
        for (let n = 1; n <= 9; n++) {
          noteStr += notes[r][c].has(n)? n : ' ';
          if (n % 3 === 0) noteStr += '\n';
        }
        const lines = noteStr.trim().split('\n');
        lines.forEach((line, i) => {
          ctx.fillText(line, x + cellSize / 2, y + cellSize * 0.3 + i * cellSize * 0.25);
        });
      }
    }
  }

  // Draw grid lines
  ctx.strokeStyle = '#bdc3c7';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 9; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(size, i * cellSize);
    ctx.stroke();
  }

  // Draw 3x3 box lines
  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 3;
  for (let i = 0; i <= 9; i += 3) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(size, i * cellSize);
    ctx.stroke();
  }
}

// Canvas click
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const cellSize = canvas.width / 9;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  if (row >= 0 && row < 9 && col >= 0 && col < 9) {
    selectCell(row, col);
  }
});

// Buttons
newGameBtn.addEventListener('click', newGame);
solveBtn.addEventListener('click', solvePuzzle);
hintBtn.addEventListener('click', giveHint);
notesBtn.addEventListener('click', () => {
  notesMode =!notesMode;
  notesBtn.classList.toggle('active');
  notesBtn.textContent = `Notes: ${notesMode? 'On' : 'Off'}`;
});
newGameWinBtn.addEventListener('click', newGame);

numBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    inputNumber(parseInt(btn.dataset.num));
  });
});

diffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    startGame(btn.dataset.diff);
  });
});

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key >= '1' && e.key <= '9') inputNumber(parseInt(e.key));
  if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') inputNumber(0);
  if (e.key === 'n' || e.key === 'N') notesMode =!notesMode;
});

// Init
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); draw(); });
newGame();