// Array of questions with radio button options
const questionBank = [
  {
    question: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
    answer: 0,
    category: "html",
    difficulty: "easy",
    explanation: "HTML stands for Hyper Text Markup Language, the standard markup language for web pages."
  },
  {
    question: "Which method adds an element to the end of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    answer: 0,
    category: "javascript",
    difficulty: "easy",
    explanation: "push() adds one or more elements to the end of an array and returns the new length."
  },
  {
    question: "What is the correct way to declare a variable in JavaScript ES6?",
    options: ["var x = 5", "variable x = 5", "let x = 5", "x := 5"],
    answer: 2,
    category: "javascript",
    difficulty: "easy",
    explanation: "let and const were introduced in ES6 for block-scoped variables. var is function-scoped."
  },
  {
    question: "Which CSS property changes text color?",
    options: ["font-color", "text-color", "color", "fgcolor"],
    answer: 2,
    category: "html",
    difficulty: "easy",
    explanation: "The 'color' property sets the color of text content in CSS."
  },
  {
    question: "What does === operator check in JavaScript?",
    options: ["Only value", "Only type", "Value and type", "Assignment"],
    answer: 2,
    category: "javascript",
    difficulty: "medium",
    explanation: "=== is the strict equality operator. It checks both value and type without coercion."
  },
  {
    question: "Which HTTP status code means 'Not Found'?",
    options: ["200", "301", "404", "500"],
    answer: 2,
    category: "general",
    difficulty: "easy",
    explanation: "404 is the standard HTTP status code for a resource that cannot be found on the server."
  },
  {
    question: "What is a closure in JavaScript?",
    options: ["A function with no parameters", "A function with access to outer scope", "A loop that never ends", "An object property"],
    answer: 1,
    category: "javascript",
    difficulty: "hard",
    explanation: "A closure is a function that retains access to its lexical scope even when executed outside that scope."
  },
  {
    question: "Which tag is used for the largest heading in HTML?",
    options: ["<heading>", "<h6>", "<h1>", "<head>"],
    answer: 2,
    category: "html",
    difficulty: "easy",
    explanation: "h1 represents the highest level heading, h6 the lowest. h1 should be used for main page titles."
  },
  {
    question: "What does CSS stand for?",
    options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
    answer: 1,
    category: "html",
    difficulty: "easy",
    explanation: "CSS stands for Cascading Style Sheets, used to style HTML documents."
  },
  {
    question: "Which array method creates a new array with filtered elements?",
    options: ["map()", "filter()", "reduce()", "forEach()"],
    answer: 1,
    category: "javascript",
    difficulty: "medium",
    explanation: "filter() creates a new array with all elements that pass the test implemented by the provided function."
  }
];

const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const reviewScreen = document.getElementById('reviewScreen');
const categorySelect = document.getElementById('categorySelect');
const difficultySelect = document.getElementById('difficultySelect');
const questionCountSelect = document.getElementById('questionCount');
const startBtn = document.getElementById('startBtn');
const highScoreEl = document.getElementById('highScore');
const questionCounter = document.getElementById('questionCounter');
const timer = document.getElementById('timer');
const progressFill = document.getElementById('progressFill');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const categoryBadge = document.getElementById('categoryBadge');
const difficultyBadge = document.getElementById('difficultyBadge');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const reviewBtn = document.getElementById('reviewBtn');
const restartBtn = document.getElementById('restartBtn');
const backToResultBtn = document.getElementById('backToResultBtn');

let questions = [];
let currentQuestion = 0;
let userAnswers = [];
let quizStartTime = 0;
let questionStartTime = 0;
let timerInterval = null;
let timeElapsed = 0;

function loadHighScore() {
  const score = localStorage.getItem('quizHighScore') || 0;
  highScoreEl.textContent = score;
}

function startQuiz() {
  // Filter questions by category and difficulty
  let filtered = questionBank.filter(q => {
    const catMatch = categorySelect.value === 'all' || q.category === categorySelect.value;
    const diffMatch = difficultySelect.value === 'all' || q.difficulty === difficultySelect.value;
    return catMatch && diffMatch;
  });

  if (filtered.length === 0) {
    alert('No questions match your criteria');
    return;
  }

  // Shuffle and limit questions
  questions = shuffleArray(filtered).slice(0, parseInt(questionCountSelect.value));
  currentQuestion = 0;
  userAnswers = new Array(questions.length).fill(null);
  quizStartTime = Date.now();
  timeElapsed = 0;

  startScreen.classList.remove('active');
  quizScreen.classList.add('active');
  startTimer();
  displayQuestion();
}

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeElapsed = Math.floor((Date.now() - quizStartTime) / 1000);
    const mins = Math.floor(timeElapsed / 60);
    const secs = timeElapsed % 60;
    timer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, 1000);
}

function displayQuestion() {
  const q = questions[currentQuestion];
  questionCounter.textContent = `Question ${currentQuestion + 1}/${questions.length}`;
  progressFill.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  categoryBadge.textContent = q.category.toUpperCase();
  difficultyBadge.textContent = q.difficulty.toUpperCase();
  difficultyBadge.className = `difficulty-badge ${q.difficulty}`;
  questionText.textContent = q.question;

  // Create radio buttons for options
  optionsContainer.innerHTML = q.options.map((option, idx) => `
    <div class="option ${userAnswers[currentQuestion] === idx? 'selected' : ''}">
      <input type="radio" name="answer" id="opt${idx}" value="${idx}" ${userAnswers[currentQuestion] === idx? 'checked' : ''}>
      <label for="opt${idx}">${option}</label>
    </div>
  `).join('');

  // Add event listeners to options
  document.querySelectorAll('.option').forEach((opt, idx) => {
    opt.addEventListener('click', () => selectAnswer(idx));
  });

  prevBtn.disabled = currentQuestion === 0;
  nextBtn.style.display = currentQuestion === questions.length - 1? 'none' : 'block';
  submitBtn.style.display = currentQuestion === questions.length - 1? 'block' : 'none';
}

function selectAnswer(idx) {
  userAnswers[currentQuestion] = idx;
  displayQuestion();
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    displayQuestion();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    displayQuestion();
  }
}

function submitQuiz() {
  clearInterval(timerInterval);
  const correct = userAnswers.filter((ans, idx) => ans === questions[idx].answer).length;
  const score = Math.round((correct / questions.length) * 100);

  // Save high score
  const highScore = parseInt(localStorage.getItem('quizHighScore') || 0);
  if (score > highScore) {
    localStorage.setItem('quizHighScore', score);
  }

  quizScreen.classList.remove('active');
  resultScreen.classList.add('active');

  // Animate score circle
  const scoreCircle = document.getElementById('scoreCircle');
  const offset = 408 - (408 * score / 100);
  setTimeout(() => {
    scoreCircle.style.strokeDashoffset = offset;
  }, 100);

  document.getElementById('scorePercent').textContent = score + '%';
  document.getElementById('scoreFraction').textContent = `${correct}/${questions.length}`;
  document.getElementById('correctCount').textContent = correct;
  document.getElementById('wrongCount').textContent = questions.length - correct;
  document.getElementById('timeTaken').textContent = timer.textContent;

  const resultIcon = document.getElementById('resultIcon');
  const resultTitle = document.getElementById('resultTitle');
  if (score >= 80) {
    resultIcon.textContent = '🏆';
    resultTitle.textContent = 'Excellent!';
  } else if (score >= 60) {
    resultIcon.textContent = '👍';
    resultTitle.textContent = 'Good Job!';
  } else {
    resultIcon.textContent = '📚';
    resultTitle.textContent = 'Keep Practicing!';
  }
}

function showReview() {
  resultScreen.classList.remove('active');
  reviewScreen.classList.add('active');

  const reviewList = document.getElementById('reviewList');
  reviewList.innerHTML = questions.map((q, idx) => {
    const userAns = userAnswers[idx];
    const isCorrect = userAns === q.answer;
    return `
      <div class="review-item ${isCorrect? 'correct' : 'wrong'}">
        <div class="review-question">Q${idx + 1}: ${q.question}</div>
        <div class="review-answer ${userAns === q.answer? 'correct' : 'wrong'}">
          Your answer: ${userAns!== null? q.options[userAns] : 'Not answered'}
        </div>
        ${!isCorrect? `<div class="review-answer correct">Correct: ${q.options[q.answer]}</div>` : ''}
        <div class="review-explanation">${q.explanation}</div>
      </div>
    `;
  }).join('');
}

function restartQuiz() {
  resultScreen.classList.remove('active');
  reviewScreen.classList.remove('active');
  startScreen.classList.add('active');
  loadHighScore();
}

// Event listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', prevQuestion);
submitBtn.addEventListener('click', submitQuiz);
reviewBtn.addEventListener('click', showReview);
restartBtn.addEventListener('click', restartQuiz);
backToResultBtn.addEventListener('click', () => {
  reviewScreen.classList.remove('active');
  resultScreen.classList.add('active');
});

// Init
loadHighScore();