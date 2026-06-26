const passwordOutput = document.getElementById('passwordOutput');
const copyBtn = document.getElementById('copyBtn');
const refreshBtn = document.getElementById('refreshBtn');
const generateBtn = document.getElementById('generateBtn');
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const strengthScore = document.getElementById('strengthScore');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

const uppercase = document.getElementById('uppercase');
const lowercase = document.getElementById('lowercase');
const numbers = document.getElementById('numbers');
const symbols = document.getElementById('symbols');
const excludeSimilar = document.getElementById('excludeSimilar');

let passwordHistory = JSON.parse(localStorage.getItem('passwordHistory')) || [];

// Character sets
const chars = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: '0O1lI'
};

// Init
renderHistory();
generatePassword();

// Event Listeners
lengthSlider.addEventListener('input', (e) => {
    lengthValue.textContent = e.target.value;
    generatePassword();
});

[uppercase, lowercase, numbers, symbols, excludeSimilar].forEach(checkbox => {
    checkbox.addEventListener('change', generatePassword);
});

generateBtn.addEventListener('click', generatePassword);
refreshBtn.addEventListener('click', generatePassword);

copyBtn.addEventListener('click', async () => {
    const password = passwordOutput.value;
    if (!password) return;

    try {
        await navigator.clipboard.writeText(password);
        showCopied();
        addToHistory(password);
    } catch (err) {
        // Fallback for older browsers
        passwordOutput.select();
        document.execCommand('copy');
        showCopied();
        addToHistory(password);
    }
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all password history?')) {
        passwordHistory = [];
        localStorage.removeItem('passwordHistory');
        renderHistory();
    }
});

function generatePassword() {
    const length = parseInt(lengthSlider.value);
    let charset = '';

    if (uppercase.checked) charset += chars.uppercase;
    if (lowercase.checked) charset += chars.lowercase;
    if (numbers.checked) charset += chars.numbers;
    if (symbols.checked) charset += chars.symbols;

    if (excludeSimilar.checked) {
        charset = charset.split('').filter(char =>!chars.similar.includes(char)).join('');
    }

    if (charset === '') {
        passwordOutput.value = '';
        updateStrength(0);
        return;
    }

    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }

    passwordOutput.value = password;
    updateStrength(password);
}

function updateStrength(password) {
    if (!password) {
        strengthFill.className = 'strength-fill';
        strengthText.textContent = 'Very Weak';
        strengthScore.textContent = '0/5';
        return;
    }

    let score = 0;

    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // Character variety
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Entropy calculation (simplified)
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score++;

    // Normalize to 5
    score = Math.min(5, Math.floor(score * 5 / 8));

    const strengthLevels = [
        { class: 'very-weak', text: 'Very Weak' },
        { class: 'weak', text: 'Weak' },
        { class: 'medium', text: 'Medium' },
        { class: 'strong', text: 'Strong' },
        { class: 'very-strong', text: 'Very Strong' }
    ];

    const level = strengthLevels[Math.max(0, score - 1)] || strengthLevels[0];

    strengthFill.className = `strength-fill ${level.class}`;
    strengthText.textContent = level.text;
    strengthScore.textContent = `${score}/5`;
}

function showCopied() {
    const copyIcon = document.getElementById('copyIcon');
    const checkIcon = document.getElementById('checkIcon');

    copyBtn.classList.add('copied');
    copyIcon.style.display = 'none';
    checkIcon.style.display = 'block';

    setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyIcon.style.display = 'block';
        checkIcon.style.display = 'none';
    }, 2000);
}

function addToHistory(password) {
    // Don't add duplicates
    if (passwordHistory.some(item => item.password === password)) return;

    passwordHistory.unshift({
        password: password,
        timestamp: Date.now()
    });

    // Keep only last 10
    if (passwordHistory.length > 10) {
        passwordHistory = passwordHistory.slice(0, 10);
    }

    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    renderHistory();
}

function renderHistory() {
    if (passwordHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-state"><p>No passwords generated yet</p></div>';
        return;
    }

    historyList.innerHTML = passwordHistory.map((item, index) => `
        <div class="history-item">
            <div class="history-password">${escapeHtml(item.password)}</div>
            <div class="history-actions">
                <button class="history-btn" onclick="copyHistoryPassword(${index})" title="Copy">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="history-btn" onclick="deleteHistoryPassword(${index})" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function copyHistoryPassword(index) {
    const password = passwordHistory[index].password;
    navigator.clipboard.writeText(password);
    passwordOutput.value = password;
    updateStrength(password);
}

function deleteHistoryPassword(index) {
    passwordHistory.splice(index, 1);
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    renderHistory();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName!== 'INPUT' && e.target.tagName!== 'TEXTAREA') {
        e.preventDefault();
        generatePassword();
    }
});