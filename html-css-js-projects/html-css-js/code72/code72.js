// JavaScript for Code 72
const wordsDisplay = document.getElementById('words-display');
const inputField = document.getElementById('input-field');
const timerEl = document.getElementById('timer');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const cpmEl = document.getElementById('cpm');
const timeSelect = document.getElementById('time-select');
const difficultySelect = document.getElementById('difficulty');
const resetBtn = document.getElementById('reset-btn');
const resultsDiv = document.getElementById('results');
const retryBtn = document.getElementById('retry-btn');

// Word arrays by difficulty
const WORDS = {
    easy: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'],
    medium: ['quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'pack', 'my', 'box', 'with', 'five', 'dozen', 'liquor', 'jugs', 'sphinx', 'of', 'black', 'quartz', 'judge', 'my', 'vow', 'typing', 'speed', 'test', 'words', 'per', 'minute', 'accuracy', 'challenge', 'keyboard', 'practice', 'improve', 'skill', 'learn', 'type', 'faster', 'better', 'every', 'day', 'never', 'give', 'up', 'keep', 'going', 'strong', 'power', 'energy', 'focus'],
    hard: ['pneumonoultramicroscopicsilicovolcanoconiosis', 'pseudopseudohypoparathyroidism', 'floccinaucinihilipilification', 'antidisestablishmentarianism', 'supercalifragilisticexpialidocious', 'incomprehensibilities', 'electroencephalographically', 'immunoelectrophoretically', 'psychophysicotherapeutics', 'thyroparathyroidectomized', 'hepaticocholangiogastrostomy', 'spectrophotofluorometrically', 'pseudopseudohypoparathyroidism', 'disproportionableness', 'incomprehensibleness', 'overintellectualizations', 'counterrevolutionaries', 'interdenominational', 'photophosphorylation', 'deoxyribonucleoside']
};

let words = [];
let currentWordIndex = 0;
let currentCharIndex = 0;
let startTime = null;
let timer = null;
let timeLeft = 60;
let testDuration = 60;
let correctChars = 0;
let incorrectChars = 0;
let totalChars = 0;
let testActive = false;

// Init
function initTest() {
    const difficulty = difficultySelect.value;
    testDuration = parseInt(timeSelect.value);
    timeLeft = testDuration;

    // Generate words
    words = [];
    const wordList = WORDS[difficulty];
    for (let i = 0; i < 200; i++) {
        words.push(wordList[Math.floor(Math.random() * wordList.length)]);
    }

    currentWordIndex = 0;
    currentCharIndex = 0;
    correctChars = 0;
    incorrectChars = 0;
    totalChars = 0;
    testActive = false;
    startTime = null;

    clearInterval(timer);
    renderWords();
    updateStats();

    inputField.value = '';
    inputField.disabled = false;
    inputField.focus();
    resultsDiv.classList.add('hidden');
    timerEl.textContent = timeLeft;
}

function renderWords() {
    wordsDisplay.innerHTML = '';

    words.forEach((word, wordIdx) => {
        const wordEl = document.createElement('span');
        wordEl.className = 'word';
        if (wordIdx === currentWordIndex) {
            wordEl.classList.add('current');
        }

        [...word].forEach((char, charIdx) => {
            const charEl = document.createElement('span');
            charEl.className = 'char';
            charEl.textContent = char;

            if (wordIdx === currentWordIndex && charIdx === currentCharIndex) {
                charEl.classList.add('current');
            } else if (wordIdx < currentWordIndex) {
                charEl.classList.add('correct');
            }

            wordEl.appendChild(charEl);
        });

        wordsDisplay.appendChild(wordEl);
        wordsDisplay.appendChild(document.createTextNode(' '));
    });
}

function startTimer() {
    startTime = Date.now();
    testActive = true;

    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;

        updateStats();

        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

function updateStats() {
    if (!startTime) return;

    const timeElapsed = (testDuration - timeLeft) / 60; // in minutes
    const wpm = timeElapsed > 0? Math.round((correctChars / 5) / timeElapsed) : 0;
    const cpm = timeElapsed > 0? Math.round(correctChars / timeElapsed) : 0;
    const accuracy = totalChars > 0? Math.round((correctChars / totalChars) * 100) : 100;

    wpmEl.textContent = wpm;
    cpmEl.textContent = cpm;
    accuracyEl.textContent = accuracy + '%';
}

inputField.addEventListener('input', (e) => {
    if (!testActive && timeLeft > 0) {
        startTimer();
    }

    if (!testActive) return;

    const typed = e.target.value;
    const currentWord = words[currentWordIndex];

    // Update character highlighting
    const wordEls = wordsDisplay.querySelectorAll('.word');
    const currentWordEl = wordEls[currentWordIndex];
    const charEls = currentWordEl.querySelectorAll('.char');

    charEls.forEach((charEl, idx) => {
        charEl.classList.remove('correct', 'incorrect', 'current');

        if (idx < typed.length) {
            if (typed[idx] === currentWord[idx]) {
                charEl.classList.add('correct');
            } else {
                charEl.classList.add('incorrect');
            }
        } else if (idx === typed.length) {
            charEl.classList.add('current');
        }
    });

    // Check if word is complete (space pressed)
    if (typed.endsWith(' ')) {
        const typedWord = typed.trim();

        // Count characters
        totalChars += currentWord.length;

        // Check accuracy
        for (let i = 0; i < currentWord.length; i++) {
            if (i < typedWord.length && typedWord[i] === currentWord[i]) {
                correctChars++;
            } else {
                incorrectChars++;
            }
        }

        // Move to next word
        currentWordIndex++;
        currentCharIndex = 0;
        inputField.value = '';

        // Scroll if needed
        if (currentWordIndex > 0 && currentWordIndex % 10 === 0) {
            const scrollAmount = wordsDisplay.querySelector('.word').offsetHeight * 2;
            wordsDisplay.scrollTop += scrollAmount;
        }

        renderWords();
    }

    updateStats();
});

function endTest() {
    testActive = false;
    clearInterval(timer);
    inputField.disabled = true;

    // Final stats
    const timeElapsed = testDuration / 60;
    const finalWpm = Math.round((correctChars / 5) / timeElapsed);
    const finalAccuracy = totalChars > 0? Math.round((correctChars / totalChars) * 100) : 100;

    document.getElementById('final-wpm').textContent = finalWpm;
    document.getElementById('final-accuracy').textContent = finalAccuracy + '%';
    document.getElementById('final-chars').textContent = totalChars;
    document.getElementById('final-correct').textContent = correctChars;

    resultsDiv.classList.remove('hidden');
}

// Controls
resetBtn.addEventListener('click', initTest);
retryBtn.addEventListener('click', initTest);
timeSelect.addEventListener('change', initTest);
difficultySelect.addEventListener('change', initTest);

// Focus input on click
document.addEventListener('click', () => {
    if (!inputField.disabled) {
        inputField.focus();
    }
});

// Init
initTest();