// JavaScript for Code 33
const questions = [
  {
    question: "Which keyword is used to declare a variable in JavaScript?",
    options: ["var", "int", "string", "declare"],
    correct: 0
  },
  {
    question: "What does DOM stand for?",
    options: ["Document Object Model", "Data Object Model", "Document Order Model", "Digital Object Manager"],
    correct: 0
  },
  {
    question: "Which method adds an element to the end of an array?",
    options: ["push()", "pop()", "shift()", "unshift()"],
    correct: 0
  },
  {
    question: "What is the result of '2' + 2 in JavaScript?",
    options: ["4", "'22'", "NaN", "Error"],
    correct: 1
  },
  {
    question: "Which operator is used for strict equality?",
    options: ["==", "===", "=", "!="],
    correct: 1
  },
  {
    question: "What does 'this' refer to in JavaScript?",
    options: ["Current function", "Global object", "Current object", "Depends on context"],
    correct: 3
  },
  {
    question: "Which method converts JSON string to object?",
    options: ["JSON.stringify()", "JSON.parse()", "JSON.toObject()", "JSON.convert()"],
    correct: 1
  },
  {
    question: "What is a closure in JavaScript?",
    options: ["A closed function", "Function with access to outer scope", "A loop", "An object"],
    correct: 1
  },
  {
    question: "Which array method creates a new array with filtered elements?",
    options: ["map()", "filter()", "reduce()", "forEach()"],
    correct: 1
  },
  {
    question: "What is the purpose of 'use strict'?",
    options: ["Enable strict mode", "Disable errors", "Speed up code", "Import modules"],
    correct: 0
  }
];

// Elements
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const reviewScreen = document.getElementById('reviewScreen');
const startBtn = document.getElementById('startBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const retryBtn = document.getElementById('retryBtn');
const reviewBtn = document.getElementById('reviewBtn');
const backToResultBtn = document.getElementById('backToResultBtn');

const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const questionCounter = document.getElementById('questionCounter');
const progressFill = document.getElementById('progressFill');
const timer = document.getElementById('timer');

let currentQuestion = 0;
let userAnswers = [];
let score = 0;
let timeLeft = 300; // 5 minutes
let timerInterval = null;
let startTime = null;

function startQuiz() {
  startScreen.style.display = 'none';
  quizScreen.style.display = 'block';
  currentQuestion = 0;
  userAnswers = new Array(questions.length).fill(null);
  score = 0;
  timeLeft = 300;
  startTime = Date.now();
  startTimer();
  loadQuestion();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timer.textContent = `⏱️ ${mins}:${String(secs).padStart(2, '0')}`;

    if (timeLeft <= 0) {
      finishQuiz();
    }
  }, 1000);
}

function loadQuestion() {
  const q = questions[currentQuestion];
  questionText.textContent = q.question;
  questionCounter.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  progressFill.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;

  optionsContainer.innerHTML = '';
  q.options.forEach((option, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = option;
    if (userAnswers[currentQuestion] === idx) {
      btn.classList.add('selected');
    }
    btn.onclick = () => selectAnswer(idx);
    optionsContainer.appendChild(btn);
  });

  prevBtn.disabled = currentQuestion === 0;
  nextBtn.textContent = currentQuestion === questions.length - 1? 'Finish' : 'Next →';
}

function selectAnswer(idx) {
  userAnswers[currentQuestion] = idx;
  document.querySelectorAll('.option').forEach((btn, i) => {
    btn.classList.toggle('selected', i === idx);
  });
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    loadQuestion();
  } else {
    finishQuiz();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
  }
}

function finishQuiz() {
  clearInterval(timerInterval);
  calculateScore();
  showResults();
}

function calculateScore() {
  score = 0;
  userAnswers.forEach((answer, idx) => {
    if (answer === questions[idx].correct) score++;
  });
}

function showResults() {
  quizScreen.style.display = 'none';
  resultScreen.style.display = 'block';

  const percent = Math.round((score / questions.length) * 100);
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  document.getElementById('scorePercent').textContent = percent + '%';
  document.getElementById('scoreDetail').textContent = `You scored ${score} out of ${questions.length}`;
  document.getElementById('correctCount').textContent = score;
  document.getElementById('wrongCount').textContent = questions.length - score;
  document.getElementById('timeTaken').textContent = `${mins}:${String(secs).padStart(2, '0')}`;

  // Animate score circle
  const offset = 408 - (408 * percent / 100);
  setTimeout(() => {
    document.getElementById('scoreProgress').style.strokeDashoffset = offset;
  }, 100);

  // Result icon
  const resultIcon = document.getElementById('resultIcon');
  const resultTitle = document.getElementById('resultTitle');
  if (percent >= 80) {
    resultIcon.textContent = '🏆';
    resultTitle.textContent = 'Excellent!';
  } else if (percent >= 60) {
    resultIcon.textContent = '🎉';
    resultTitle.textContent = 'Good Job!';
  } else {
    resultIcon.textContent = '💪';
    resultTitle.textContent = 'Keep Practicing!';
  }
}

function showReview() {
  resultScreen.style.display = 'none';
  reviewScreen.style.display = 'block';

  const reviewList = document.getElementById('reviewList');
  reviewList.innerHTML = questions.map((q, idx) => {
    const userAns = userAnswers[idx];
    const isCorrect = userAns === q.correct;
    return `
      <div class="review-item ${isCorrect? 'correct' : 'wrong'}">
        <div class="review-question">Q${idx + 1}. ${q.question}</div>
        <div class="review-answer your-answer">Your answer: ${userAns!== null? q.options[userAns] : 'Not answered'}</div>
        ${!isCorrect? `<div class="review-answer correct-answer">Correct: ${q.options[q.correct]}</div>` : ''}
      </div>
    `;
  }).join('');
}

function retryQuiz() {
  resultScreen.style.display = 'none';
  reviewScreen.style.display = 'none';
  startScreen.style.display = 'block';
}

// Event listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', prevQuestion);
retryBtn.addEventListener('click', retryQuiz);
reviewBtn.addEventListener('click', showReview);
backToResultBtn.addEventListener('click', () => {
  reviewScreen.style.display = 'none';
  resultScreen.style.display = 'block';
});