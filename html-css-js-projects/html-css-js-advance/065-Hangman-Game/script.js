// 65 words for the game
const wordList = [
    { word: "javascript", category: "Programming" },
    { word: "python", category: "Programming" },
    { word: "hangman", category: "Games" },
    { word: "keyboard", category: "Tech" },
    { word: "developer", category: "Jobs" },
    { word: "function", category: "Programming" },
    { word: "variable", category: "Programming" },
    { word: "constant", category: "Programming" },
    { word: "element", category: "Web" },
    { word: "browser", category: "Tech" },
    { word: "internet", category: "Tech" },
    { word: "website", category: "Web" },
    { word: "database", category: "Tech" },
    { word: "framework", category: "Programming" },
    { word: "library", category: "Programming" },
    { word: "algorithm", category: "CS" },
    { word: "computer", category: "Tech" },
    { word: "software", category: "Tech" },
    { word: "hardware", category: "Tech" },
    { word: "network", category: "Tech" },
    { word: "server", category: "Tech" },
    { word: "client", category: "Tech" },
    { word: "protocol", category: "Tech" },
    { word: "interface", category: "Programming" },
    { word: "component", category: "Web" },
    { word: "module", category: "Programming" },
    { word: "package", category: "Programming" },
    { word: "repository", category: "Git" },
    { word: "version", category: "Git" },
    { word: "terminal", category: "Tech" },
    { word: "console", category: "Programming" },
    { word: "debugger", category: "Programming" },
    { word: "compiler", category: "Programming" },
    { word: "syntax", category: "Programming" },
    { word: "object", category: "Programming" },
    { word: "string", category: "Programming" },
    { word: "number", category: "Programming" },
    { word: "boolean", category: "Programming" },
    { word: "integer", category: "Programming" },
    { word: "float", category: "Programming" },
    { word: "array", category: "Programming" },
    { word: "loop", category: "Programming" },
    { word: "condition", category: "Programming" },
    { word: "statement", category: "Programming" },
    { word: "parameter", category: "Programming" },
    { word: "argument", category: "Programming" },
    { word: "method", category: "Programming" },
    { word: "class", category: "Programming" },
    { word: "instance", category: "Programming" },
    { word: "inheritance", category: "Programming" },
    { word: "encapsulation", category: "Programming" },
    { word: "polymorphism", category: "Programming" },
    { word: "abstraction", category: "Programming" },
    { word: "responsive", category: "Web" },
    { word: "animation", category: "Web" },
    { word: "transition", category: "Web" },
    { word: "transform", category: "Web" },
    { word: "gradient", category: "Web" },
    { word: "flexbox", category: "Web" },
    { word: "grid", category: "Web" },
    { word: "cascade", category: "CSS" },
    { word: "selector", category: "CSS" },
    { word: "property", category: "CSS" },
    { word: "attribute", category: "HTML" },
    { word: "document", category: "Web" }
];

let selectedWord = '';
let correctLetters = [];
let wrongCount = 0;
const maxWrong = 6;

const wordDisplay = document.getElementById('word-display');
const keyboard = document.getElementById('keyboard');
const wrongCountSpan = document.getElementById('wrong-count');
const categorySpan = document.getElementById('category');
const bodyParts = document.querySelectorAll('.body-part');
const popup = document.getElementById('popup');
const popupText = document.getElementById('popup-text');
const popupWord = document.getElementById('popup-word');
const playAgainBtn = document.getElementById('play-again');

// Initialize game
function initGame() {
    correctLetters = [];
    wrongCount = 0;
    wrongCountSpan.textContent = wrongCount;

    // Pick random word
    const randomObj = wordList[Math.floor(Math.random() * wordList.length)];
    selectedWord = randomObj.word;
    categorySpan.textContent = randomObj.category;

    // Reset hangman drawing
    bodyParts.forEach(part => part.style.display = 'none');

    // Display word blanks
    wordDisplay.innerHTML = selectedWord
       .split('')
       .map(() => `<div class="letter"></div>`)
       .join('');

    // Create keyboard
    createKeyboard();
    popup.classList.remove('active');
}

function createKeyboard() {
    keyboard.innerHTML = '';
    for (let i = 97; i <= 122; i++) {
        const button = document.createElement('button');
        button.textContent = String.fromCharCode(i);
        button.addEventListener('click', () => handleGuess(button, button.textContent));
        keyboard.appendChild(button);
    }
}

function handleGuess(button, letter) {
    button.disabled = true;

    if (selectedWord.includes(letter)) {
        button.classList.add('correct');
        correctLetters.push(letter);
        updateWordDisplay();
        checkWin();
    } else {
        button.classList.add('wrong');
        wrongCount++;
        wrongCountSpan.textContent = wrongCount;
        updateHangman();
        checkLoss();
    }
}

function updateWordDisplay() {
    const letters = wordDisplay.querySelectorAll('.letter');
    selectedWord.split('').forEach((letter, index) => {
        if (correctLetters.includes(letter)) {
            letters[index].textContent = letter;
        }
    });
}

function updateHangman() {
    if (wrongCount <= bodyParts.length) {
        bodyParts[wrongCount - 1].style.display = 'block';
    }
}

function checkWin() {
    const wordComplete = selectedWord.split('').every(letter => correctLetters.includes(letter));
    if (wordComplete) {
        showPopup(true);
    }
}

function checkLoss() {
    if (wrongCount === maxWrong) {
        showPopup(false);
    }
}

function showPopup(won) {
    popupText.textContent = won? 'You Won!' : 'Game Over!';
    popupWord.textContent = `The word was: ${selectedWord.toUpperCase()}`;
    popup.classList.add('active');

    // Disable all keyboard buttons
    keyboard.querySelectorAll('button').forEach(btn => btn.disabled = true);
}

// Event listeners
playAgainBtn.addEventListener('click', initGame);

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (popup.classList.contains('active')) {
        if (e.key === 'Enter') initGame();
        return;
    }

    const key = e.key.toLowerCase();
    if (key >= 'a' && key <= 'z') {
        const button = Array.from(keyboard.children).find(btn => btn.textContent === key);
        if (button &&!button.disabled) {
            handleGuess(button, key);
        }
    }
});

// Start game
initGame();