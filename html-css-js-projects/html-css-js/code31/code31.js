// JavaScript for Code 31
const playerScore = document.getElementById('playerScore');
const computerScore = document.getElementById('computerScore');
const playerStreak = document.getElementById('playerStreak');
const computerStreak = document.getElementById('computerStreak');
const playerChoiceEl = document.getElementById('playerChoice');
const computerChoiceEl = document.getElementById('computerChoice');
const resultText = document.getElementById('resultText');
const choiceBtns = document.querySelectorAll('.choice-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const resetBtn = document.getElementById('resetBtn');
const historyList = document.getElementById('historyList');
const totalGames = document.getElementById('totalGames');
const winRate = document.getElementById('winRate');
const bestStreak = document.getElementById('bestStreak');

const choices = {
  rock: { emoji: '🪨', beats: 'scissors' },
  paper: { emoji: '📄', beats: 'rock' },
  scissors: { emoji: '✂️', beats: 'paper' }
};

let scores = { player: 0, computer: 0 };
let streaks = { player: 0, computer: 0, best: 0 };
let gameMode = '∞';
let roundHistory = [];
let playerMoves = [];
let isPlaying = false;

// Load stats
function loadStats() {
  const saved = localStorage.getItem('rpsStats');
  if (saved) {
    const data = JSON.parse(saved);
    streaks.best = data.bestStreak || 0;
    roundHistory = data.history || [];
    updateStats();
    renderHistory();
  }
}

function saveStats() {
  localStorage.setItem('rpsStats', JSON.stringify({
    bestStreak: streaks.best,
    history: roundHistory.slice(-10)
  }));
}

// If/else logic: determine winner
function getWinner(player, computer) {
  if (player === computer) return 'draw';
  else if (choices[player].beats === computer) return 'player';
  else return 'computer';
}

// Simple AI: track player patterns
function getComputerChoice() {
  const options = ['rock', 'paper', 'scissors'];

  // If player has history, try to counter their most frequent move
  if (playerMoves.length >= 3) {
    const lastThree = playerMoves.slice(-3);
    const freq = {};
    lastThree.forEach(m => freq[m] = (freq[m] || 0) + 1);
    const mostUsed = Object.keys(freq).reduce((a, b) => freq[a] > freq[b]? a : b);
    // Counter it
    if (mostUsed === 'rock') return 'paper';
    if (mostUsed === 'paper') return 'scissors';
    if (mostUsed === 'scissors') return 'rock';
  }

  // Random fallback
  return options[Math.floor(Math.random() * options.length)];
}

function playRound(playerChoice) {
  if (isPlaying) return;
  isPlaying = true;

  choiceBtns.forEach(btn => btn.disabled = true);

  const computerChoice = getComputerChoice();
  playerMoves.push(playerChoice);

  // Animate choices
  playerChoiceEl.querySelector('.choice-icon').textContent = choices[playerChoice].emoji;
  computerChoiceEl.querySelector('.choice-icon').textContent = choices[computerChoice].emoji;

  playerChoiceEl.classList.remove('winner', 'loser');
  computerChoiceEl.classList.remove('winner', 'loser');
  resultText.classList.remove('win', 'lose', 'draw');

  setTimeout(() => {
    // If/else logic for scoring
    const winner = getWinner(playerChoice, computerChoice);

    if (winner === 'player') {
      scores.player++;
      streaks.player++;
      streaks.computer = 0;
      playerChoiceEl.classList.add('winner');
      computerChoiceEl.classList.add('loser');
      resultText.textContent = 'You Win!';
      resultText.classList.add('win');
      if (streaks.player > streaks.best) streaks.best = streaks.player;
    } else if (winner === 'computer') {
      scores.computer++;
      streaks.computer++;
      streaks.player = 0;
      computerChoiceEl.classList.add('winner');
      playerChoiceEl.classList.add('loser');
      resultText.textContent = 'You Lose!';
      resultText.classList.add('lose');
    } else {
      resultText.textContent = 'Draw!';
      resultText.classList.add('draw');
    }

    // Update displays
    playerScore.textContent = scores.player;
    computerScore.textContent = scores.computer;
    playerStreak.textContent = streaks.player > 1? `🔥 ${streaks.player}` : '';
    computerStreak.textContent = streaks.computer > 1? `🔥 ${streaks.computer}` : '';

    // Add to history
    roundHistory.unshift({
      player: playerChoice,
      computer: computerChoice,
      winner,
      time: Date.now()
    });
    if (roundHistory.length > 10) roundHistory.pop();

    updateStats();
    renderHistory();
    saveStats();

    // Check game over for Best of modes
    if (gameMode!== '∞') {
      const target = parseInt(gameMode);
      if (scores.player >= Math.ceil(target / 2) || scores.computer >= Math.ceil(target / 2)) {
        setTimeout(() => {
          const gameWinner = scores.player > scores.computer? 'You won the game!' : 'Computer won the game!';
          alert(gameWinner);
          resetGame();
        }, 500);
      }
    }

    setTimeout(() => {
      isPlaying = false;
      choiceBtns.forEach(btn => btn.disabled = false);
    }, 800);
  }, 300);
}

function updateStats() {
  const total = scores.player + scores.computer;
  const wins = scores.player;
  totalGames.textContent = total;
  winRate.textContent = total > 0? Math.round((wins / total) * 100) + '%' : '0%';
  bestStreak.textContent = streaks.best;
}

function renderHistory() {
  historyList.innerHTML = roundHistory.map(round => `
    <div class="history-item ${round.winner}">
      <span>${choices[round.player].emoji} vs ${choices[round.computer].emoji}</span>
      <span>${round.winner === 'player'? '✓ Win' : round.winner === 'computer'? '✗ Loss' : '= Draw'}</span>
    </div>
  `).join('');
}

function resetGame() {
  scores = { player: 0, computer: 0 };
  streaks.player = 0;
  streaks.computer = 0;
  playerScore.textContent = '0';
  computerScore.textContent = '0';
  playerStreak.textContent = '';
  computerStreak.textContent = '';
  playerChoiceEl.querySelector('.choice-icon').textContent = '❓';
  computerChoiceEl.querySelector('.choice-icon').textContent = '❓';
  resultText.textContent = 'Choose your move!';
  resultText.className = 'result-text';
  playerChoiceEl.classList.remove('winner', 'loser');
  computerChoiceEl.classList.remove('winner', 'loser');
}

// Event listeners
choiceBtns.forEach(btn => {
  btn.addEventListener('click', () => playRound(btn.dataset.choice));
});

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gameMode = btn.dataset.mode;
    resetGame();
  });
});

resetBtn.addEventListener('click', resetGame);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') playRound('rock');
  if (e.key === 'p' || e.key === 'P') playRound('paper');
  if (e.key === 's' || e.key === 'S') playRound('scissors');
});

// Init
loadStats();