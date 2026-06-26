// JavaScript for Code 30
const difficultyBtns = document.querySelectorAll('.diff-btn');
const rangeDisplay = document.getElementById('rangeDisplay');
const attemptsLeft = document.getElementById('attemptsLeft');
const maxAttempts = document.getElementById('maxAttempts');
const bestScore = document.getElementById('bestScore');
const hintText = document.getElementById('hintText');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const feedback = document.getElementById('feedback');
const guessList = document.getElementById('guessList');
const newGameBtn = document.getElementById('newGameBtn');

let secretNumber = 0;
let currentAttempts = 0;
let maxAttemptsNum = 5;
let maxRange = 10;
let gameOver = false;
let guesses = [];

// Math.random generates number between 0-1, multiply by range + 1 for 1-max
function generateSecretNumber(max) {
  return Math.floor(Math.random() * max) + 1;
}

function startNewGame() {
  secretNumber = generateSecretNumber(maxRange);
  currentAttempts = 0;
  gameOver = false;
  guesses = [];
  
  attemptsLeft.textContent = maxAttemptsNum;
  maxAttempts.textContent = maxAttemptsNum;
  rangeDisplay.textContent = `1 - ${maxRange}`;
  guessInput.min = 1;
  guessInput.max = maxRange;
  guessInput.value = '';
  guessInput.disabled = false;
  guessBtn.disabled = false;
  
  hintText.textContent = `I'm thinking of a number between 1 and ${maxRange}...`;
  feedback.classList.remove('show');
  guessList.innerHTML = '';
  
  // Load best score
  const best = localStorage.getItem(`bestScore_${maxRange}`);
  bestScore.textContent = best ? `${best} attempts` : '-';
  
  console.log('Secret:', secretNumber); // Remove in production
}

function makeGuess() {
  if (gameOver) return;
  
  const guess = parseInt(guessInput.value);
  
  if (isNaN(guess) || guess < 1 || guess > maxRange) {
    showFeedback(`Please enter a number between 1 and ${maxRange}`, 'cold');
    return;
  }
  
  if (guesses.includes(guess)) {
    showFeedback('You already guessed that number!', 'cold');
    return;
  }
  
  currentAttempts++;
  attemptsLeft.textContent = maxAttemptsNum - currentAttempts;
  guesses.push(guess);
  addGuessChip(guess);
  
  // Check guess
  if (guess === secretNumber) {
    winGame();
  } else if (currentAttempts >= maxAttemptsNum) {
    loseGame();
  } else {
    // Give hint: hot if close, cold if far
    const diff = Math.abs(guess - secretNumber);
    const range = maxRange;
    
    if (diff <= range * 0.1) {
      showFeedback(`🔥 Very Hot! ${guess} is very close!`, 'hot');
    } else if (diff <= range * 0.25) {
      showFeedback(`🌡️ Warm! ${guess} is getting closer`, 'hot');
    } else {
      showFeedback(guess < secretNumber ? `❄️ Cold! Try higher than ${guess}` : `❄️ Cold! Try lower than ${guess}`, 'cold');
    }
  }
  
  guessInput.value = '';
  guessInput.focus();
}

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `feedback show ${type}`;
}

function addGuessChip(guess) {
  const chip = document.createElement('div');
  chip.className = 'guess-chip';
  
  if (guess === secretNumber) {
    chip.classList.add('correct');
    chip.textContent = `${guess} ✓`;
  } else if (guess < secretNumber) {
    chip.classList.add('low');
    chip.textContent = `${guess} ↑`;
  } else {
    chip.classList.add('high');
    chip.textContent = `${guess} ↓`;
  }
  
  guessList.appendChild(chip);
}

function winGame() {
  gameOver = true;
  showFeedback(`🎉 Correct! You got it in ${currentAttempts} attempts!`, 'win');
  hintText.textContent = `The number was ${secretNumber}!`;
  guessInput.disabled = true;
  guessBtn.disabled = true;
  
  // Save best score
  const currentBest = localStorage.getItem(`bestScore_${maxRange}`);
  if (!currentBest || currentAttempts < parseInt(currentBest)) {
    localStorage.setItem(`bestScore_${maxRange}`, currentAttempts);
    bestScore.textContent = `${currentAttempts} attempts`;
  }
}

function loseGame() {
  gameOver = true;
  showFeedback(`💀 Game Over! The number was ${secretNumber}`, 'lose');
  hintText.textContent = 'Better luck next time!';
  guessInput.disabled = true;
  guessBtn.disabled = true;
}

// Difficulty selection
difficultyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    difficultyBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    maxRange = parseInt(btn.dataset.max);
    maxAttemptsNum = parseInt(btn.dataset.attempts);
    startNewGame();
  });
});

guessBtn.addEventListener('click', makeGuess);
newGameBtn.addEventListener('click', startNewGame);

guessInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') makeGuess();
});

// Init
startNewGame();