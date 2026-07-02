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

    resultEl.value = generatePassword(hasLower, hasUpper, hasNumber, hasSymbol, length);
    updateStrength();
});

// Copy to clipboard
clipboardBtn.addEventListener('click', () => {
    const password = resultEl.value;

    if (!password) return;

    navigator.clipboard.writeText(password).then(() => {
        showToast();
    });
});

function generatePassword(lower, upper, number, symbol, length) {
    let generatedPassword = '';
    const typesCount = lower + upper + number + symbol;
    const typesArr = [{ lower }, { upper }, { number }, { symbol }].filter(item => Object.values(item)[0]);

    if (typesCount === 0) {
        return '';
    }

    // Create password
    for (let i = 0; i < length; i += typesCount) {
        typesArr.forEach(type => {
            const funcName = Object.keys(type)[0];
            generatedPassword += randomFunc[funcName]();
        });
    }

    const finalPassword = generatedPassword.slice(0, length);
    return finalPassword;
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
    if (typesCount === 4 && length >= 12) strength++;

    strengthBar.className = 'strength-bar';

    if (strength <= 2) {
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

function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Generate initial password
generateBtn.click();