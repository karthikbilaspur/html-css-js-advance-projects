// JavaScript for Code 70
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status-text');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');
const resetBtn = document.getElementById('reset-btn');
const resetScoresBtn = document.getElementById('reset-scores');
const winnerModal = document.getElementById('winner-modal');
const winnerText = document.getElementById('winner-text');
const playAgainBtn = document.getElementById('play-again');

// Game state
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = { X: 0, O: 0, draw: 0 };

// Win conditions: all possible 3-in-a-row combinations
const WIN_CONDITIONS = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal \
    [2, 4, 6] // Diagonal /
];

// Load scores from localStorage
function loadScores() {
    const saved = localStorage.getItem('tictactoe_70_scores');
    if (saved) {
        scores = JSON.parse(saved);
        updateScoreDisplay();
    }
}

function saveScores() {
    localStorage.setItem('tictactoe_70_scores', JSON.stringify(scores));
}

function updateScoreDisplay() {
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreDrawEl.textContent = scores.draw;
}

// Cell click handler
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

function handleCellClick(e) {
    const index = parseInt(e.target.dataset.index);

    // Check if cell is empty and game is active
    if (gameBoard[index]!== '' ||!gameActive) {
        return;
    }

    // Make move
    makeMove(index);
}

function makeMove(index) {
    gameBoard[index] = currentPlayer;
    cells[index].textContent = currentPlayer;
    cells[index].classList.add(currentPlayer.toLowerCase());

    // Check for win
    if (checkWin()) {
        endGame(false);
        return;
    }

    // Check for draw
    if (checkDraw()) {
        endGame(true);
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X'? 'O' : 'X';
    statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function checkWin() {
    for (let condition of WIN_CONDITIONS) {
        const [a, b, c] = condition;
        if (gameBoard[a] &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[a] === gameBoard[c]) {

            // Highlight winning cells
            cells[a].classList.add('winner');
            cells[b].classList.add('winner');
            cells[c].classList.add('winner');

            return true;
        }
    }
    return false;
}

function checkDraw() {
    return gameBoard.every(cell => cell!== '');
}

function endGame(isDraw) {
    gameActive = false;

    if (isDraw) {
        scores.draw++;
        statusText.textContent = "It's a draw!";
        winnerText.textContent = "It's a Draw!";
    } else {
        scores[currentPlayer]++;
        statusText.textContent = `Player ${currentPlayer} wins!`;
        winnerText.textContent = `Player ${currentPlayer} Wins! 🎉`;
    }

    saveScores();
    updateScoreDisplay();

    // Show modal after animation
    setTimeout(() => {
        winnerModal.classList.add('show');
    }, 800);
}

function resetGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;

    statusText.textContent = `Player ${currentPlayer}'s turn`;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner');
    });

    winnerModal.classList.remove('show');
}

function resetScores() {
    scores = { X: 0, O: 0, draw: 0 };
    saveScores();
    updateScoreDisplay();
    resetGame();
}

// Event listeners
resetBtn.addEventListener('click', resetGame);
resetScoresBtn.addEventListener('click', resetScores);
playAgainBtn.addEventListener('click', () => {
    winnerModal.classList.remove('show');
    resetGame();
});

// Keyboard support: 1-9 for cells
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;

    const keyMap = {
        '1': 6, '2': 7, '3': 8,
        '4': 3, '5': 4, '6': 5,
        '7': 0, '8': 1, '9': 2
    };

    if (keyMap[e.key]!== undefined) {
        const index = keyMap[e.key];
        if (gameBoard[index] === '') {
            makeMove(index);
        }
    }

    if (e.key === 'r' || e.key === 'R') {
        resetGame();
    }
});

// Init
loadScores();