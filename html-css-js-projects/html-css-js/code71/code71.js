// JavaScript for Code 71
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const scorePlayerEl = document.getElementById('score-player');
const scoreAiEl = document.getElementById('score-ai');
const scoreDrawEl = document.getElementById('score-draw');
const difficultySelect = document.getElementById('difficulty');
const newGameBtn = document.getElementById('new-game');
const resetScoresBtn = document.getElementById('reset-scores');
const aiThinking = document.getElementById('ai-thinking');

const HUMAN = 'X';
const AI = 'O';
const WIN_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6] // diagonals
];

let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = { player: 0, ai: 0, draw: 0 };

// Load scores
function loadScores() {
    const saved = localStorage.getItem('tictactoe_71_scores');
    if (saved) {
        scores = JSON.parse(saved);
        updateScoreDisplay();
    }
}

function saveScores() {
    localStorage.setItem('tictactoe_71_scores', JSON.stringify(scores));
}

function updateScoreDisplay() {
    scorePlayerEl.textContent = scores.player;
    scoreAiEl.textContent = scores.ai;
    scoreDrawEl.textContent = scores.draw;
}

// Cell click
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

function handleCellClick(e) {
    const index = parseInt(e.target.dataset.index);

    if (gameBoard[index]!== '' ||!gameActive) {
        return;
    }

    makeMove(index, HUMAN);

    if (checkGameEnd()) return;

    // AI move with delay for UX
    aiThinking.classList.add('show');
    setTimeout(() => {
        aiMove();
        aiThinking.classList.remove('show');
        checkGameEnd();
    }, 500);
}

function makeMove(index, player) {
    gameBoard[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
}

function aiMove() {
    const difficulty = difficultySelect.value;
    let move;

    if (difficulty === 'easy') {
        move = getRandomMove();
    } else if (difficulty === 'medium') {
        move = Math.random() < 0.5? getBestMove() : getRandomMove();
    } else {
        move = getBestMove();
    }

    if (move!== -1) {
        makeMove(move, AI);
    }
}

function getRandomMove() {
    const available = gameBoard
      .map((cell, idx) => cell === ''? idx : null)
      .filter(val => val!== null);
    return available.length > 0? available[Math.floor(Math.random() * available.length)] : -1;
}

// Minimax Algorithm - Unbeatable AI
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = AI;
            let score = minimax(gameBoard, 0, false);
            gameBoard[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    const winner = checkWinner(board);

    if (winner === AI) return 10 - depth;
    if (winner === HUMAN) return depth - 10;
    if (board.every(cell => cell!== '')) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = AI;
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = HUMAN;
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkWinner(board = gameBoard) {
    for (let combo of WIN_COMBINATIONS) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function checkGameEnd() {
    const winner = checkWinner();

    if (winner) {
        gameActive = false;
        highlightWin();

        if (winner === HUMAN) {
            scores.player++;
            statusEl.textContent = 'You win! 🎉';
        } else {
            scores.ai++;
            statusEl.textContent = 'AI wins!';
        }

        saveScores();
        updateScoreDisplay();
        return true;
    }

    if (gameBoard.every(cell => cell!== '')) {
        gameActive = false;
        scores.draw++;
        statusEl.textContent = "It's a draw!";
        saveScores();
        updateScoreDisplay();
        return true;
    }

    statusEl.textContent = gameBoard.filter(c => c!== '').length % 2 === 0
      ? 'Your turn - You are X'
        : 'AI thinking...';
    return false;
}

function highlightWin() {
    for (let combo of WIN_CONDITIONS) {
        const [a, b, c] = combo;
        if (gameBoard[a] &&
            gameBoard[a] === gameBoard[b] &&
            gameBoard[a] === gameBoard[c]) {
            cells[a].classList.add('winner');
            cells[b].classList.add('winner');
            cells[c].classList.add('winner');
            break;
        }
    }
}

function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    statusEl.textContent = 'Your turn - You are X';

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner');
    });
}

function resetScores() {
    scores = { player: 0, ai: 0, draw: 0 };
    saveScores();
    updateScoreDisplay();
    resetGame();
}

// Event listeners
newGameBtn.addEventListener('click', resetGame);
resetScoresBtn.addEventListener('click', resetScores);

// Init
loadScores();