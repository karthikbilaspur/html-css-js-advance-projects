const resultEl = document.getElementById('result');
const lengthEl = document.getElementById('length');
const lengthValueEl = document.getElementById('lengthValue');
const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');
const generateBtn = document.getElementById('generate');
const clipboardBtn = document.getElementById('clipboard');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const toast = document.getElementById('toast');

const randomFunc = {
    lower: getRandomLower,
    upper: getRandomUpper,
    number: getRandomNumber,
    symbol: getRandomSymbol
};

// Update length display
lengthEl.addEventListener('input', (e) => {
    lengthValueEl.textContent = e.target.value;
    updateStrength();
});

// Update strength when checkboxes change
[uppercaseEl, lowercaseEl, numbersEl, symbolsEl].forEach(el => {
    el.addEventListener('change', updateStrength);
});

// Generate password on button click
generateBtn.addEventListener('click', () => {
    const length = +lengthEl.value;
    const hasLower = lowercaseEl.checked;
    const hasUpper = uppercaseEl.checked;
    const hasNumber = numbersEl.checked;
    const hasSymbol = symbolsEl.checked;

    const password = generatePassword(hasLower, hasUpper, hasNumber, hasSymbol, length);

    if (!password) {
        showToast('Select at least one option!', true);
        return;
    }

    resultEl.value = password;
    updateStrength();
});

// Copy to clipboard
clipboardBtn.addEventListener('click', () => {
    const password = resultEl.value;
    if (!password) {
        showToast('Generate a password first', true);
        return;
    }

    navigator.clipboard.writeText(password).then(() => {
        showToast('Copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy', true);
    });
});

function generatePassword(lower, upper, number, symbol, length) {
    const typesCount = lower + upper + number + symbol;
    if (typesCount === 0) return '';

    const typesArr = [];
    if (lower) typesArr.push('lower');
    if (upper) typesArr.push('upper');
    if (number) typesArr.push('number');
    if (symbol) typesArr.push('symbol');

    let generatedPassword = '';

    // Ensure at least one of each selected type
    typesArr.forEach(type => {
        generatedPassword += randomFunc[type]();
    });

    // Fill rest randomly
    for (let i = generatedPassword.length; i < length; i++) {
        const randomType = typesArr[Math.floor(Math.random() * typesArr.length)];
        generatedPassword += randomFunc[randomType]();
    }

    // Shuffle the password so guaranteed chars aren't always at start
    return shuffleString(generatedPassword);
}

function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

function getRandomLower() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}

function getRandomUpper() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}

function getRandomNumber() {
    return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}

function getRandomSymbol() {
    const symbols = '!@#$%^&*(){}[]=<>/,.';
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function updateStrength() {
    const length = +lengthEl.value;
    const typesCount = uppercaseEl.checked + lowercaseEl.checked + numbersEl.checked + symbolsEl.checked;

    let strength = 0;
    if (length >= 8) strength++;
    if (length >= 12) strength++;
    if (typesCount >= 2) strength++;
    if (typesCount >= 3) strength++;
    if (typesCount === 4 && length >= 16) strength++;

    strengthBar.className = 'strength-bar';

    if (typesCount === 0) {
        strengthText.textContent = 'Strength: None';
    } else if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Strength: Weak';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Strength: Medium';
    } else {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Strength: Strong';
    }
}

function showToast(message = 'Copied to clipboard!', isError = false) {
    toast.textContent = message;
    toast.style.backgroundColor = isError? '#e53e3e' : '#48bb78';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Generate initial password and set strength
resultEl.value = generatePassword(true, true, true, true, +lengthEl.value);
updateStrength();