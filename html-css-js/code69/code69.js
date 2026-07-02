// JavaScript for Code 69
const gameBoard = document.getElementById('game-board');
const tileContainer = document.getElementById('tile-container');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const gameOverScreen = document.getElementById('game-over');
const gameWonScreen = document.getElementById('game-won');
const gameOverTitle = document.getElementById('game-over-title');
const tryAgainBtn = document.getElementById('try-again');
const keepPlayingBtn = document.getElementById('keep-playing');
const newGameBtn = document.getElementById('new-game');
const newGameMainBtn = document.getElementById('new-game-btn');

const SIZE = 4;
let board = [];
let score = 0;
let best = parseInt(localStorage.getItem('2048_best_69')) || 0;
let gameWon = false;
let gameOver = false;

bestEl.textContent = best;

class Tile {
    constructor(row, col, value) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.merged = false;
        this.element = this.createElement();
    }

    createElement() {
        const tile = document.createElement('div');
        tile.className = `tile tile-${this.value}`;
        tile.textContent = this.value;
        this.updatePosition(tile);
        return tile;
    }

    updatePosition(element = this.element) {
        const gap = 15;
        const size = (tileContainer.offsetWidth - gap * 3) / 4;
        element.style.left = `${this.col * (size + gap)}px`;
        element.style.top = `${this.row * (size + gap)}px`;
    }

    updateValue(value) {
        this.value = value;
        this.element.className = `tile tile-${value}`;
        this.element.textContent = value;
        this.element.classList.add('merged');
        setTimeout(() => this.element.classList.remove('merged'), 200);
    }
}

function initGame() {
    board = Array(SIZE).fill().map(() => Array(SIZE).fill(null));
    score = 0;
    gameWon = false;
    gameOver = false;
    updateScore();

    gameOverScreen.classList.add('hidden');
    gameWonScreen.classList.add('hidden');
    tileContainer.innerHTML = '';

    // Add 2 starting tiles
    addRandomTile();
    addRandomTile();
}

function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (!board[r][c]) {
                emptyCells.push({ r, c });
            }
        }
    }

    if (emptyCells.length === 0) return false;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9? 2 : 4;
    const tile = new Tile(r, c, value);
    board[r][c] = tile;
    tileContainer.appendChild(tile.element);
    return true;
}

function move(direction) {
    if (gameOver) return;

    let moved = false;
    const vectors = {
        'up': { r: -1, c: 0 },
        'down': { r: 1, c: 0 },
        'left': { r: 0, c: -1 },
        'right': { r: 0, c: 1 }
    };

    const vector = vectors[direction];

    // Reset merged flags
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c]) board[r][c].merged = false;
        }
    }

    // Traverse in correct order
    const traversals = buildTraversals(vector);

    traversals.r.forEach(r => {
        traversals.c.forEach(c => {
            const tile = board[r][c];
            if (tile) {
                const { newRow, newCol, merged } = findFarthestPosition(r, c, vector);

                if (merged) {
                    // Merge tiles
                    const targetTile = board[newRow][newCol];
                    const newValue = targetTile.value * 2;
                    score += newValue;

                    // Remove old tile
                    tile.element.remove();
                    board[r][c] = null;

                    // Update target tile
                    targetTile.updateValue(newValue);
                    targetTile.merged = true;

                    moved = true;

                    // Check win
                    if (newValue === 2048 &&!gameWon) {
                        gameWon = true;
                        setTimeout(() => showWin(), 300);
                    }
                } else if (newRow!== r || newCol!== c) {
                    // Move tile
                    board[r][c] = null;
                    board[newRow][newCol] = tile;
                    tile.row = newRow;
                    tile.col = newCol;
                    tile.updatePosition();
                    moved = true;
                }
            }
        });
    });

    if (moved) {
        updateScore();
        addRandomTile();

        if (!movesAvailable()) {
            setTimeout(() => showGameOver(), 300);
        }
    }
}

function buildTraversals(vector) {
    const traversals = { r: [], c: [] };
    for (let i = 0; i < SIZE; i++) {
        traversals.r.push(i);
        traversals.c.push(i);
    }

    // If moving down, traverse from bottom up
    if (vector.r === 1) traversals.r.reverse();
    // If moving right, traverse from right to left
    if (vector.c === 1) traversals.c.reverse();

    return traversals;
}

function findFarthestPosition(row, col, vector) {
    let prevRow = row;
    let prevCol = col;

    while (true) {
        const nextRow = prevRow + vector.r;
        const nextCol = prevCol + vector.c;

        // Out of bounds
        if (nextRow < 0 || nextRow >= SIZE || nextCol < 0 || nextCol >= SIZE) {
            break;
        }

        const nextCell = board[nextRow][nextCol];

        // Empty cell
        if (!nextCell) {
            prevRow = nextRow;
            prevCol = nextCol;
        }
        // Can merge
        else if (nextCell.value === board[row][col].value &&!nextCell.merged) {
            return { newRow: nextRow, newCol: nextCol, merged: true };
        }
        // Blocked
        else {
            break;
        }
    }

    return { newRow: prevRow, newCol: prevCol, merged: false };
}

function movesAvailable() {
    // Check for empty cells
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (!board[r][c]) return true;
        }
    }

    // Check for possible merges
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const tile = board[r][c];
            if (tile) {
                // Check right
                if (c < SIZE - 1 && board[r][c + 1] && board[r][c + 1].value === tile.value) {
                    return true;
                }
                // Check down
                if (r < SIZE - 1 && board[r + 1][c] && board[r + 1][c].value === tile.value) {
                    return true;
                }
            }
        }
    }

    return false;
}

function updateScore() {
    scoreEl.textContent = score;
    if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem('2048_best_69', best);
    }
}

function showWin() {
    gameWonScreen.classList.remove('hidden');
}

function showGameOver() {
    gameOver = true;
    gameOverScreen.classList.remove('hidden');
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (gameOver) return;

    const keyMap = {
        'ArrowUp': 'up', 'w': 'up', 'W': 'up',
        'ArrowDown': 'down', 's': 'down', 'S': 'down',
        'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
        'ArrowRight': 'right', 'd': 'right', 'D': 'right'
    };

    if (keyMap[e.key]) {
        e.preventDefault();
        move(keyMap[e.key]);
    }
});

// Touch support
let touchStartX = 0;
let touchStartY = 0;

gameBoard.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

gameBoard.addEventListener('touchend', (e) => {
    if (!touchStartX ||!touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) move('right');
        else if (dx < -30) move('left');
    } else {
        if (dy > 30) move('down');
        else if (dy < -30) move('up');
    }

    touchStartX = 0;
    touchStartY = 0;
});

tryAgainBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    initGame();
});

keepPlayingBtn.addEventListener('click', () => {
    gameWonScreen.classList.add('hidden');
});

newGameBtn.addEventListener('click', () => {
    gameWonScreen.classList.add('hidden');
    initGame();
});

newGameMainBtn.addEventListener('click', initGame);

// Start
initGame();