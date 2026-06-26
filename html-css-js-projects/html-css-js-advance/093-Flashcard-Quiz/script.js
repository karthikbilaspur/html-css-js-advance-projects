const deckSelect = document.getElementById('deckSelect');
const flashcard = document.getElementById('flashcard');
const cardFront = document.getElementById('cardFront');
const cardBack = document.getElementById('cardBack');
const cardCounter = document.getElementById('cardCounter');
const flipCardBtn = document.getElementById('flipCardBtn');
const prevCardBtn = document.getElementById('prevCardBtn');
const nextCardBtn = document.getElementById('nextCardBtn');
const diffBtns = document.querySelectorAll('.diff-btn');

const startQuizBtn = document.getElementById('startQuizBtn');
const nextQBtn = document.getElementById('nextQBtn');
const retryQuizBtn = document.getElementById('retryQuizBtn');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const currentQEl = document.getElementById('currentQ');
const totalQEl = document.getElementById('totalQ');
const quizScoreEl = document.getElementById('quizScore');
const quizResults = document.getElementById('quizResults');
const finalScoreEl = document.getElementById('finalScore');
const resultDetailsEl = document.getElementById('resultDetails');

const deckNameInput = document.getElementById('deckNameInput');
const createDeckBtn = document.getElementById('createDeckBtn');
const questionInput = document.getElementById('questionInput');
const answerInput = document.getElementById('answerInput');
const addCardBtn = document.getElementById('addCardBtn');
const currentDeckName = document.getElementById('currentDeckName');
const decksContainer = document.getElementById('decksContainer');

const modeBtns = document.querySelectorAll('.mode-btn');
const studyMode = document.getElementById('studyMode');
const quizMode = document.getElementById('quizMode');
const createMode = document.getElementById('createMode');

const deckCountEl = document.getElementById('deckCount');
const cardCountEl = document.getElementById('cardCount');
const masteredCountEl = document.getElementById('masteredCount');
const streakEl = document.getElementById('streak');

// Data structure - from 2048's localStorage pattern
let decks = JSON.parse(localStorage.getItem('flashquiz093') || '[]');
let currentDeck = null;
let currentCardIndex = 0;
let isFlipped = false;

// Quiz state
let quizCards = [];
let currentQuizIndex = 0;
let quizScore = 0;
let answered = false;

// Spaced repetition - SRS algorithm
let cardProgress = JSON.parse(localStorage.getItem('cardProgress093') || '{}');

function saveData() {
  localStorage.setItem('flashquiz093', JSON.stringify(decks));
  localStorage.setItem('cardProgress093', JSON.stringify(cardProgress));
  updateStats();
}

function updateStats() {
  deckCountEl.textContent = decks.length;
  const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0);
  cardCountEl.textContent = totalCards;

  const mastered = Object.values(cardProgress).filter(p => p >= 2).length;
  masteredCountEl.textContent = mastered;

  const streak = parseInt(localStorage.getItem('studyStreak093') || '0');
  streakEl.textContent = streak;
}

// MODE SWITCHING
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const mode = btn.dataset.mode;
    studyMode.style.display = mode === 'study'? 'block' : 'none';
    quizMode.style.display = mode === 'quiz'? 'block' : 'none';
    createMode.style.display = mode === 'create'? 'block' : 'none';
  });
});

// STUDY MODE
function loadDecks() {
  deckSelect.innerHTML = '<option value="">Select a deck...</option>';
  decks.forEach((deck, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${deck.name} (${deck.cards.length} cards)`;
    deckSelect.appendChild(option);
  });
}

deckSelect.addEventListener('change', () => {
  const idx = deckSelect.value;
  if (idx === '') {
    currentDeck = null;
    return;
  }
  currentDeck = decks[idx];
  currentCardIndex = 0;
  isFlipped = false;
  flashcard.classList.remove('flipped');
  displayCard();
});

function displayCard() {
  if (!currentDeck || currentDeck.cards.length === 0) {
    cardFront.textContent = 'No cards in this deck';
    cardBack.textContent = '';
    cardCounter.textContent = '0 / 0';
    return;
  }

  const card = currentDeck.cards[currentCardIndex];
  cardFront.textContent = card.question;
  cardBack.textContent = card.answer;
  cardCounter.textContent = `${currentCardIndex + 1} / ${currentDeck.cards.length}`;
}

flashcard.addEventListener('click', flipCard);
flipCardBtn.addEventListener('click', flipCard);

function flipCard() {
  if (!currentDeck) return;
  isFlipped =!isFlipped;
  flashcard.classList.toggle('flipped');
}

prevCardBtn.addEventListener('click', () => {
  if (!currentDeck || currentCardIndex === 0) return;
  currentCardIndex--;
  isFlipped = false;
  flashcard.classList.remove('flipped');
  displayCard();
});

nextCardBtn.addEventListener('click', () => {
  if (!currentDeck || currentCardIndex >= currentDeck.cards.length - 1) return;
  currentCardIndex++;
  isFlipped = false;
  flashcard.classList.remove('flipped');
  displayCard();
});

// Spaced repetition - Easy/Hard buttons
diffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!currentDeck) return;
    const diff = parseInt(btn.dataset.diff);
    const cardId = `${currentDeck.name}_${currentCardIndex}`;

    // SRS: 0=Again(1 day), 1=Hard(3 days), 2=Easy(7 days)
    cardProgress[cardId] = diff;
    saveData();

    // Auto-advance
    if (currentCardIndex < currentDeck.cards.length - 1) {
      currentCardIndex++;
      isFlipped = false;
      flashcard.classList.remove('flipped');
      displayCard();
    }

    // Update streak
    const today = new Date().toDateString();
    const lastStudy = localStorage.getItem('lastStudyDate093');
    if (lastStudy!== today) {
      const streak = parseInt(localStorage.getItem('studyStreak093') || '0') + 1;
      localStorage.setItem('studyStreak093', streak);
      localStorage.setItem('lastStudyDate093', today);
      updateStats();
    }
  });
});

// QUIZ MODE
startQuizBtn.addEventListener('click', () => {
  if (!currentDeck || currentDeck.cards.length < 4) {
    alert('Need at least 4 cards for quiz mode');
    return;
  }

  quizCards = [...currentDeck.cards].sort(() => Math.random() - 0.5).slice(0, 10);
  currentQuizIndex = 0;
  quizScore = 0;
  quizResults.style.display = 'none';
  startQuizBtn.style.display = 'none';
  nextQBtn.style.display = 'none';

  totalQEl.textContent = quizCards.length;
  quizScoreEl.textContent = '0';
  displayQuestion();
});

function displayQuestion() {
  if (currentQuizIndex >= quizCards.length) {
    showQuizResults();
    return;
  }

  answered = false;
  const card = quizCards[currentQuizIndex];
  currentQEl.textContent = currentQuizIndex + 1;

  questionText.textContent = card.question;

  // Generate options - 1 correct + 3 random wrong answers
  const correctAnswer = card.answer;
  const wrongAnswers = currentDeck.cards
     .filter(c => c.answer!== correctAnswer)
     .sort(() => Math.random() - 0.5)
     .slice(0, 3)
     .map(c => c.answer);

  const options = [correctAnswer,...wrongAnswers].sort(() => Math.random() - 0.5);

  optionsContainer.innerHTML = '';
  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => selectAnswer(btn, option === correctAnswer));
    optionsContainer.appendChild(btn);
  });
}

function selectAnswer(btn, isCorrect) {
  if (answered) return;
  answered = true;

  const allBtns = optionsContainer.querySelectorAll('.option-btn');
  allBtns.forEach(b => {
    b.classList.add('disabled');
    if (b.textContent === quizCards[currentQuizIndex].answer) {
      b.classList.add('correct');
    }
  });

  if (isCorrect) {
    btn.classList.add('correct');
    quizScore++;
    quizScoreEl.textContent = quizScore;
  } else {
    btn.classList.add('wrong');
  }

  nextQBtn.style.display = 'block';
}

nextQBtn.addEventListener('click', () => {
  currentQuizIndex++;
  nextQBtn.style.display = 'none';
  displayQuestion();
});

function showQuizResults() {
  const percentage = Math.round((quizScore / quizCards.length) * 100);
  finalScoreEl.textContent = percentage + '%';
  resultDetailsEl.textContent = `You got ${quizScore} out of ${quizCards.length} correct`;
  quizResults.style.display = 'block';
  questionText.textContent = '';
  optionsContainer.innerHTML = '';
}

retryQuizBtn.addEventListener('click', () => {
  startQuizBtn.style.display = 'block';
  quizResults.style.display = 'none';
});

// CREATE MODE
createDeckBtn.addEventListener('click', () => {
  const name = deckNameInput.value.trim();
  if (!name) return;

  decks.push({ name, cards: [] });
  deckNameInput.value = '';
  saveData();
  loadDecks();
  renderDeckList();
});

addCardBtn.addEventListener('click', () => {
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (!currentDeck) {
    alert('Select or create a deck first');
    return;
  }
  if (!question ||!answer) return;

  currentDeck.cards.push({ question, answer });
  questionInput.value = '';
  answerInput.value = '';
  saveData();
  renderDeckList();
  loadDecks();
});

function renderDeckList() {
  decksContainer.innerHTML = '';
  decks.forEach((deck, i) => {
    const item = document.createElement('div');
    item.className = 'deck-item';
    item.innerHTML = `
      <div class="deck-info">
        <div class="deck-name">${deck.name}</div>
        <div class="deck-stats">${deck.cards.length} cards</div>
      </div>
      <div class="deck-actions">
        <button onclick="selectDeckForEdit(${i})">Edit</button>
        <button onclick="deleteDeck(${i})">Delete</button>
      </div>
    `;
    decksContainer.appendChild(item);
  });
}

window.selectDeckForEdit = (i) => {
  currentDeck = decks[i];
  currentDeckName.textContent = currentDeck.name;
  deckSelect.value = i;
  displayCard();
};

window.deleteDeck = (i) => {
  if (confirm('Delete this deck?')) {
    decks.splice(i, 1);
    saveData();
    loadDecks();
    renderDeckList();
  }
};

// Init
loadDecks();
renderDeckList();
updateStats();