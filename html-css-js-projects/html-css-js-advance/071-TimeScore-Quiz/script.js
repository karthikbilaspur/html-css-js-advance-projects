// Array of question objects - easy to add more
const questionBank = [
    {
        question: "Which method adds an element to the end of an array?",
        options: ["push()", "pop()", "shift()", "unshift()"],
        answer: 0,
        category: "arrays"
    },
    {
        question: "What does DOM stand for?",
        options: ["Document Object Model", "Data Object Method", "Digital Ordinance Model", "Desktop Oriented Mode"],
        answer: 0,
        category: "dom"
    },
    {
        question: "Which keyword declares a block-scoped variable?",
        options: ["var", "let", "const", "Both let and const"],
        answer: 3,
        category: "basics"
    },
    {
        question: "What does `querySelector('#id')` return?",
        options: ["All elements", "First matching element", "NodeList", "HTMLCollection"],
        answer: 1,
        category: "dom"
    },
    {
        question: "Which array method returns a new array?",
        options: ["forEach()", "map()", "sort()", "reverse()"],
        answer: 1,
        category: "arrays"
    },
    {
        question: "What is the result of `typeof null`?",
        options: ["null", "undefined", "object", "number"],
        answer: 2,
        category: "basics"
    },
    {
        question: "Which event fires when DOM is fully loaded?",
        options: ["load", "DOMContentLoaded", "ready", "init"],
        answer: 1,
        category: "dom"
    },
    {
        question: "What does `Array.isArray([])` return?",
        options: ["false", "true", "undefined", "Error"],
        answer: 1,
        category: "arrays"
    }
];

let questions = [];
let currentQuestion = 0;
let score = 0;
let timeLeft = 30;
let timerInterval = null;
let selectedAnswer = null;
let userAnswers = [];

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const reviewBtn = document.getElementById('review-btn');

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const currentQEl = document.getElementById('current-q');
const totalQEl = document.getElementById('total-q');
const scoreEl = document.getElementById('score');
const timeLeftEl = document.getElementById('time-left');
const timerCircle = document.getElementById('timer-circle');
const categorySelect = document.getElementById('category-select');

function startQuiz() {
    // Filter questions by category
    const category = categorySelect.value;
    questions = category === 'all'
       ? [...questionBank]
        : questionBank.filter(q => q.category === category);

    // Shuffle and pick 5 questions
    questions = questions.sort(() => Math.random() - 0.5).slice(0, 5);

    if (questions.length === 0) {
        alert('No questions in this category');
        return;
    }

    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    totalQEl.textContent = questions.length;
    scoreEl.textContent = score;

    startScreen.classList.remove('active');
    quizScreen.classList.add('active');

    loadQuestion();
}

function loadQuestion() {
    clearInterval(timerInterval);
    selectedAnswer = null;
    nextBtn.disabled = true;
    timeLeft = 30;
    updateTimerDisplay();

    const q = questions[currentQuestion];
    questionEl.textContent = q.question;
    currentQEl.textContent = currentQuestion + 1;

    optionsEl.innerHTML = '';
    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option';
        btn.textContent = option;
        btn.onclick = () => selectAnswer(index);
        optionsEl.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    const circumference = 2 * Math.PI * 25; // r=25
    timerCircle.style.strokeDasharray = circumference;

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        const offset = circumference - (timeLeft / 30) * circumference;
        timerCircle.style.strokeDashoffset = offset;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

function updateTimerDisplay() {
    timeLeftEl.textContent = timeLeft;
    if (timeLeft <= 10) {
        timeLeftEl.style.color = '#e41e3f';
        timerCircle.style.stroke = '#e41e3f';
    } else {
        timeLeftEl.style.color = '#667eea';
        timerCircle.style.stroke = '#667eea';
    }
}

function selectAnswer(index) {
    if (selectedAnswer!== null) return;

    selectedAnswer = index;
    clearInterval(timerInterval);

    const q = questions[currentQuestion];
    const options = optionsEl.querySelectorAll('.option');

    options.forEach((btn, i) => {
        btn.classList.add('disabled');
        if (i === index) btn.classList.add('selected');
    });

    userAnswers.push({
        question: q.question,
        selected: index,
        correct: q.answer,
        isCorrect: index === q.answer
    });

    setTimeout(() => showAnswer(), 500);
}

function showAnswer() {
    const q = questions[currentQuestion];
    const options = optionsEl.querySelectorAll('.option');

    options.forEach((btn, i) => {
        if (i === q.answer) {
            btn.classList.add('correct');
        } else if (i === selectedAnswer) {
            btn.classList.add('wrong');
        }
    });

    if (selectedAnswer === q.answer) {
        score++;
        scoreEl.textContent = score;
    }

    nextBtn.disabled = false;
}

function handleTimeout() {
    const q = questions[currentQuestion];
    userAnswers.push({
        question: q.question,
        selected: null,
        correct: q.answer,
        isCorrect: false
    });

    const options = optionsEl.querySelectorAll('.option');
    options.forEach((btn, i) => {
        btn.classList.add('disabled');
        if (i === q.answer) btn.classList.add('correct');
    });

    nextBtn.disabled = false;
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');

    const percentage = Math.round((score / questions.length) * 100);
    document.getElementById('final-score').textContent = score;
    document.getElementById('percentage').textContent = `${percentage}%`;
    document.getElementById('correct-count').textContent = `${score}/${questions.length}`;

    const feedbackEl = document.getElementById('feedback');
    if (percentage === 100) {
        feedbackEl.textContent = 'Perfect! You are a JS master!';
        feedbackEl.style.color = '#31a24c';
    } else if (percentage >= 80) {
        feedbackEl.textContent = 'Great job! Almost perfect!';
        feedbackEl.style.color = '#31a24c';
    } else if (percentage >= 60) {
        feedbackEl.textContent = 'Good work! Keep practicing!';
        feedbackEl.style.color = '#667eea';
    } else {
        feedbackEl.textContent = 'Keep studying and try again!';
        feedbackEl.style.color = '#e41e3f';
    }
}

function showReview() {
    const reviewSection = document.getElementById('review-section');
    reviewSection.innerHTML = '<h3>Answer Review</h3>';

    userAnswers.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `review-item ${item.isCorrect? 'correct' : 'wrong'}`;
        div.innerHTML = `
            <div class="review-q">${index + 1}. ${item.question}</div>
            <div class="review-a">
                Your answer: ${item.selected!== null? questions[index].options[item.selected] : 'No answer'}<br>
                Correct: ${questions[index].options[item.correct]}
            </div>
        `;
        reviewSection.appendChild(div);
    });

    reviewSection.classList.toggle('active');
}

function restartQuiz() {
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
    document.getElementById('review-section').classList.remove('active');
}

// Event listeners
startBtn.onclick = startQuiz;
nextBtn.onclick = nextQuestion;
restartBtn.onclick = restartQuiz;
reviewBtn.onclick = showReview;