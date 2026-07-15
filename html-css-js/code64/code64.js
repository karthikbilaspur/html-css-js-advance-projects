// JavaScript for Code 64
const gameBoard = document.getElementById('game-board');
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');
const bestScoreEl = document.getElementById('best-score');
const difficultySelect = document.getElementById('difficulty');
const themeSelect = document.getElementById('theme');
const restartBtn = document.getElementById('restart-btn');
const winModal = document.getElementById('win-modal');
const playAgainBtn = document.getElementById('play-again');

const THEMES = {
    emoji: ['🎮', '🎯', '🎨', '🎭', '🎪', '🎲', '🎸', '🎺', '🎻', '🎹', '🎤', '🎧'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸'],
    food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🧇', '🥞', '🧈', '🥐'],
    shapes: ['⭐', '💎', '🔶', '🔷', '🔺', '🔻', '⚡', '💫', '✨', '🔥', '❄', '☀']
};

const DIFFICULTY = {
    easy: { rows: 3, cols: 4, pairs: 6 },
    medium: { rows: 4, cols: 4, pairs: 8 },
    hard: { rows: 4, cols: 6, pairs: 12 }
};

const STORAGE_KEY = 'memory_match_64_scores';

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval = null;
let gameStarted = false;
let canFlip = true;

// Init
window.addEventListener('DOMContentLoaded', () => {
    loadBestScore();
    initGame();
});

restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', () => {
    winModal.classList.remove('show');
    initGame();
});

difficultySelect.addEventListener('change', initGame);
themeSelect.addEventListener('change', initGame);

function initGame() {
    // Reset state
    clearInterval(timerInterval);
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timer = 0;
    gameStarted = false;
    canFlip = true;

    // Update UI
    movesEl.textContent = '0';
    timerEl.textContent = '00:00';
    loadBestScore(); // Added: update best score on difficulty/theme change

    // Get settings
    const diff = DIFFICULTY[difficultySelect.value];
    const theme = THEMES[themeSelect.value];

    // Create card pairs
    const selectedIcons = shuffleArray([...theme]).slice(0, diff.pairs);
    const cardPairs = [...selectedIcons,...selectedIcons];

    // Shuffle array - Fisher-Yates
    cards = shuffleArray(cardPairs).map((icon, index) => ({
        id: index,
        icon: icon,
        flipped: false,
        matched: false
    }));

    // Set board class
    gameBoard.className = `game-board ${difficultySelect.value}`;

    // Render cards
    renderBoard();
}

function renderBoard() {
    gameBoard.innerHTML = cards.map(card => `
        <div class="card ${card.flipped? 'flipped' : ''} ${card.matched? 'matched' : ''}"
             data-id="${card.id}">
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">${card.icon}</div>
            </div>
        </div>
    `).join('');

    // Add click listeners
    gameBoard.querySelectorAll('.card').forEach(cardEl => {
        cardEl.addEventListener('click', handleCardClick);
    });
}

function handleCardClick(e) {
    const cardEl = e.currentTarget;
    const cardId = parseInt(cardEl.dataset.id);
    const card = cards[cardId];

    if (!canFlip || card.flipped || card.matched) return;

    // Start timer on first flip
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }

    // Flip card
    flipCard(cardId);
    flippedCards.push(cardId);

    // Check for match when 2 cards flipped
    if (flippedCards.length === 2) {
        moves++;
        movesEl.textContent = moves;
        canFlip = false;
        checkMatch();
    }
}

function flipCard(id) {
    cards[id].flipped = true;
    renderBoard();
}

function checkMatch() {
    const [id1, id2] = flippedCards;
    const card1 = cards[id1]; // Fixed: was cards
    const card2 = cards[id2]; // Fixed: was cards

    if (card1.icon === card2.icon) {
        // Match found
        setTimeout(() => {
            cards[id1].matched = true; // Fixed: was cards.matched
            cards[id2].matched = true; // Fixed: was cards.matched
            matchedPairs++;

            flippedCards = [];
            canFlip = true;
            renderBoard();

            checkWin();
        }, 600);
    } else {
        // No match - flip back
        setTimeout(() => {
            cards[id1].flipped = false; // Fixed: was cards.flipped
            cards[id2].flipped = false; // Fixed: was cards.flipped
            flippedCards = [];
            canFlip = true;
            renderBoard();
        }, 1000);
    }
}

function checkWin() {
    const totalPairs = DIFFICULTY[difficultySelect.value].pairs;

    if (matchedPairs === totalPairs) {
        clearInterval(timerInterval);
        setTimeout(() => showWinModal(), 600);
    }
}

function showWinModal() {
    document.getElementById('win-time').textContent = formatTime(timer);
    document.getElementById('win-moves').textContent = moves;

    // Check for new record
    const key = `${difficultySelect.value}_${themeSelect.value}`;
    const scores = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    if (!scores[key] || timer < scores[key].time) {
        scores[key] = { time: timer, moves: moves };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
        document.getElementById('new-record').classList.remove('hidden');
        loadBestScore();
    } else {
        document.getElementById('new-record').classList.add('hidden');
    }

    winModal.classList.add('show');
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerEl.textContent = formatTime(timer);
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function loadBestScore() {
    const scores = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const key = `${difficultySelect.value}_${themeSelect.value}`;

    if (scores[key]) {
        bestScoreEl.textContent = formatTime(scores[key].time);
    } else {
        bestScoreEl.textContent = '--';
    }
}