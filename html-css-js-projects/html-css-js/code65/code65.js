// JavaScript for Code 65
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const highScoreEl = document.getElementById('high-score');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const gameBoard = document.getElementById('game-board');
const holes = document.querySelectorAll('.hole');
const gameOverModal = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const newHighScoreEl = document.getElementById('new-high-score');
const playAgainBtn = document.getElementById('play-again');

const STORAGE_KEY = 'whack_high_score_65';
const GAME_TIME = 30;

let score = 0;
let timeLeft = GAME_TIME;
let highScore = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
let gameActive = false;
let gameTimer = null;
let moleTimer = null;
let lastHole = null;

// Init
highScoreEl.textContent = highScore;

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', () => {
    gameOverModal.classList.remove('show');
    startGame();
});

// Click moles
holes.forEach(hole => {
    hole.addEventListener('click', () => whack(hole));
});

function startGame() {
    if (gameActive) return;

    gameActive = true;
    score = 0;
    timeLeft = GAME_TIME;
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;

    startBtn.disabled = true;
    gameOverModal.classList.remove('show');

    // Start game timer
    gameTimer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Start popping moles
    popMole();
}

function popMole() {
    if (!gameActive) return;

    const time = randomTime(600, 1200);
    const hole = randomHole(holes);
    const mole = hole.querySelector('.mole');

    mole.classList.add('up');

    // Mole stays up for random time
    const hideTime = randomTime(700, 1500);
    setTimeout(() => {
        if (!mole.classList.contains('hit')) {
            mole.classList.remove('up');
        }
    }, hideTime);

    // Pop next mole
    moleTimer = setTimeout(popMole, time);
}

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];

    // Don't use same hole twice in a row
    if (hole === lastHole) {
        return randomHole(holes);
    }

    lastHole = hole;
    return hole;
}

function whack(hole) {
    if (!gameActive) return;

    const mole = hole.querySelector('.mole');

    if (mole.classList.contains('up')) {
        score++;
        scoreEl.textContent = score;

        mole.classList.remove('up');
        mole.classList.add('hit');

        setTimeout(() => {
            mole.classList.remove('hit');
        }, 200);
    }
}

function endGame() {
    gameActive = false;
    clearInterval(gameTimer);
    clearTimeout(moleTimer);

    startBtn.disabled = false;

    // Hide all moles
    document.querySelectorAll('.mole').forEach(mole => {
        mole.classList.remove('up');
    });

    // Check high score
    const isNewHigh = score > highScore;
    if (isNewHigh) {
        highScore = score;
        localStorage.setItem(STORAGE_KEY, highScore);
        highScoreEl.textContent = highScore;
        newHighScoreEl.classList.remove('hidden');
    } else {
        newHighScoreEl.classList.add('hidden');
    }

    finalScoreEl.textContent = score;
    gameOverModal.classList.add('show');
}

function resetGame() {
    gameActive = false;
    clearInterval(gameTimer);
    clearTimeout(moleTimer);

    score = 0;
    timeLeft = GAME_TIME;
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;

    startBtn.disabled = false;

    document.querySelectorAll('.mole').forEach(mole => {
        mole.classList.remove('up', 'hit');
    });
}