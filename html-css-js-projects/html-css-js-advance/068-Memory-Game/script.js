const gameBoard = document.getElementById('game-board');
const movesEl = document.getElementById('moves');
const timeEl = document.getElementById('time');
const matchesEl = document.getElementById('matches');
const restartBtn = document.getElementById('restart');
const difficultySelect = document.getElementById('difficulty');
const winPopup = document.getElementById('win-popup');
const finalStatsEl = document.getElementById('final-stats');
const playAgainBtn = document.getElementById('play-again');

// Emoji set for cards
const cardIcons = ['🚀', '🎮', '🎯', '🎨', '🎭', '🎪', '🎲', '🎸', '🎺', '🎬', '🏆', '⚽', '🏀', '🎳', '🎰', '🎹', '🎧', '📱'];

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = null;
let seconds = 0;
let gameStarted = false;
let totalPairs = 8;

// Shuffle array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Create board
function createBoard() {
    gameBoard.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    gameStarted = false;

    clearInterval(timer);
    updateStats();

    totalPairs = parseInt(difficultySelect.value);

    // Set grid columns based on difficulty
    gameBoard.className = 'game-board';
    if (totalPairs === 12) gameBoard.classList.add('medium');
    if (totalPairs === 18) gameBoard.classList.add('hard');

    matchesEl.textContent = `0 / ${totalPairs}`;

    // Create pairs and shuffle
    const gameIcons = cardIcons.slice(0, totalPairs);
    const cardValues = shuffle([...gameIcons,...gameIcons]);

    cardValues.forEach((icon, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = icon;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="card-front">${icon}</div>
            <div class="card-back"></div>
        `;

        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
        cards.push(card);
    });
}

// Flip card
function flipCard(card) {
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    if (flippedCards.length < 2 &&!card.classList.contains('flipped') &&!card.classList.contains('matched')) {
        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            updateStats();
            checkMatch();
        }
    }
}

// Check for match
function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.icon === card2.dataset.icon) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        flippedCards = [];
        updateStats();

        if (matchedPairs === totalPairs) {
            endGame();
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 800);
    }
}

// Update stats display
function updateStats() {
    movesEl.textContent = moves;
    matchesEl.textContent = `${matchedPairs} / ${totalPairs}`;
}

// Timer
function startTimer() {
    timer = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        timeEl.textContent = `${mins}:${secs}`;
    }, 1000);
}

// End game
function endGame() {
    clearInterval(timer);
    setTimeout(() => {
        finalStatsEl.innerHTML = `
            You completed the game in <strong>${moves} moves</strong><br>
            Time: <strong>${timeEl.textContent}</strong><br>
            Difficulty: <strong>${difficultySelect.options[difficultySelect.selectedIndex].text}</strong>
        `;
        winPopup.classList.add('active');
    }, 500);
}

// Event listeners
restartBtn.addEventListener('click', createBoard);
playAgainBtn.addEventListener('click', () => {
    winPopup.classList.remove('active');
    createBoard();
});
difficultySelect.addEventListener('change', createBoard);

// Init game
createBoard();