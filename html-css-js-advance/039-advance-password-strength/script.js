const passwordInput = document.getElementById('passwordInput');
const toggleBtn = document.getElementById('toggleBtn');
const copyBtn = document.getElementById('copyBtn');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const strengthScore = document.getElementById('strengthScore');
const crackTime = document.getElementById('crackTime');
const onlineTime = document.getElementById('onlineTime');
const offlineTime = document.getElementById('offlineTime');
const entropyBits = document.getElementById('entropyBits');
const entropyCircle = document.getElementById('entropyCircle');
const entropyDesc = document.getElementById('entropyDesc');
const warningsList = document.getElementById('warningsList');
const suggestions = document.getElementById('suggestions');
const strengthMeter = document.querySelector('.strength-meter');

// Top 100 common passwords - expanded list
const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'letmein', 'dragon',
    'baseball', 'iloveyou', 'trustno1', '1234567', 'sunshine', 'master', '123123',
    'welcome', 'shadow', 'ashley', 'football', 'jesus', 'michael', 'ninja', 'mustang',
    'password1', 'admin', '1234', '12345', '123456789', 'hello', 'freedom', 'whatever',
    'qazwsx', 'princess', 'solo', 'starwars', 'login', 'admin123', 'flower', 'passw0rd'
];

const commonPatterns = [
    /1234/, /abcd/i, /qwerty/i, /asdf/i, /zxcv/i,
    /password/i, /admin/i, /login/i, /welcome/i,
    /(.)\1{2,}/, // 3+ repeating chars
    /01234/, /98765/, /09876/,
    /^[0-9]+$/, // only numbers
    /^[a-zA-Z]+$/, // only letters
    /^\d{4}$/, // 4 digit PIN
    /^\d{6}$/, // 6 digit PIN
    /19\d{2}|20\d{2}/, // years
];

const keyboardPatterns = [
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    'qwertzuiop', 'qazwsxedc', '1234567890'
];

let isVisible = false;
let debounceTimer = null;

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
    isVisible =!isVisible;
    passwordInput.type = isVisible? 'text' : 'password';
    toggleBtn.setAttribute('aria-label', isVisible? 'Hide password' : 'Show password');
});

// Copy password
copyBtn.addEventListener('click', async () => {
    const password = passwordInput.value;
    if (!password) return;

    try {
        await navigator.clipboard.writeText(password);
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
});

// Analyze password with debounce
passwordInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        analyzePassword(e.target.value);
    }, 150);
});

function analyzePassword(password) {
    if (!password) {
        resetDisplay();
        return;
    }

    const analysis = calculateStrength(password);
    updateUI(analysis, password);
}

function calculateStrength(password) {
    let score = 0;
    let entropy = 0;
    const warnings = [];
    const checks = {
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /[0-9]/.test(password),
        symbols: /[^A-Za-z0-9]/.test(password),
        unique: true
    };

    // Length scoring - more granular
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;
    if (password.length >= 24) score += 5;

    // Character variety
    if (checks.uppercase) score += 10;
    if (checks.lowercase) score += 10;
    if (checks.numbers) score += 10;
    if (checks.symbols) score += 15;

    // Check for common passwords
    if (commonPasswords.includes(password.toLowerCase())) {
        score = 5;
        warnings.push('This is one of the most common passwords');
        checks.unique = false;
    }

    // Check patterns
    for (const pattern of commonPatterns) {
        if (pattern.test(password)) {
            score -= 15;
            warnings.push('Contains common patterns or sequences');
            checks.unique = false;
            break;
        }
    }

    // Check keyboard patterns
    const lower = password.toLowerCase();
    for (const pattern of keyboardPatterns) {
        if (lower.includes(pattern) || lower.includes(pattern.split('').reverse().join(''))) {
            score -= 20;
            warnings.push('Contains keyboard patterns like "qwerty"');
            checks.unique = false;
            break;
        }
    }

    // Check for dates
    if (/(19|20)\d{2}/.test(password)) {
        score -= 10;
        warnings.push('Contains a year - common in passwords');
    }

    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
        score -= 15;
        warnings.push('Contains repeating characters');
        checks.unique = false;
    }

    // Check for sequential chars
    if (hasSequentialChars(password)) {
        score -= 10;
        warnings.push('Contains sequential characters');
        checks.unique = false;
    }

    // Length warnings
    if (password.length < 8) {
        warnings.push('Password is too short - use at least 12 characters');
    } else if (password.length < 12) {
        warnings.push('Consider using 12+ characters for better security');
    }

    // Variety warnings
    if (!checks.uppercase &&!checks.lowercase) {
        warnings.push('Add both uppercase and lowercase letters');
    }
    if (!checks.numbers &&!checks.symbols) {
        warnings.push('Add numbers or symbols');
    }

    // Calculate entropy more accurately
    let poolSize = 0;
    if (checks.lowercase) poolSize += 26;
    if (checks.uppercase) poolSize += 26;
    if (checks.numbers) poolSize += 10;
    if (checks.symbols) poolSize += 32; // common symbols

    // Penalize entropy for patterns
    let effectiveLength = password.length;
    if (!checks.unique) {
        effectiveLength *= 0.7; // Reduce effective length if patterns found
    }

    entropy = Math.log2(Math.pow(Math.max(poolSize, 1), effectiveLength));

    // Bonus for very long passwords
    if (password.length >= 20) score += 5;
    if (password.length >= 30) score += 5;

    // Cap score
    score = Math.max(0, Math.min(100, score));

    return { score, entropy, warnings, checks, poolSize };
}

function hasSequentialChars(str) {
    const s = str.toLowerCase();
    for (let i = 0; i < s.length - 2; i++) {
        const char1 = s.charCodeAt(i);
        const char2 = s.charCodeAt(i + 1);
        const char3 = s.charCodeAt(i + 2);
        if (char2 === char1 + 1 && char3 === char2 + 1) return true;
        if (char2 === char1 - 1 && char3 === char2 - 1) return true;
    }
    return false;
}

function updateUI(analysis, password) {
    const { score, entropy, warnings, checks, poolSize } = analysis;

    // Update strength bar
    strengthBar.className = 'strength-bar';
    strengthMeter.setAttribute('aria-valuenow', score);

    let strengthLabel = 'Very Weak';
    if (score >= 80) {
        strengthBar.classList.add('strong');
        strengthLabel = 'Strong';
    } else if (score >= 60) {
        strengthBar.classList.add('good');
        strengthLabel = 'Good';
    } else if (score >= 40) {
        strengthBar.classList.add('fair');
        strengthLabel = 'Fair';
    } else if (score >= 20) {
        strengthBar.classList.add('weak');
        strengthLabel = 'Weak';
    } else {
        strengthBar.classList.add('very-weak');
    }

    strengthText.textContent = strengthLabel;
    strengthScore.textContent = `${score}/100`;

    // Update checks
    Object.keys(checks).forEach(key => {
        const item = document.querySelector(`[data-check="${key}"]`);
        if (item) {
            item.classList.toggle('pass', checks[key]);
            item.querySelector('.check-icon').textContent = checks[key]? '✓' : '✗';
        }
    });

    // Crack time estimates - assume MD5 for offline, throttled for online
    const combinations = Math.pow(poolSize, password.length);
    const guessesPerSecond = {
        online: 1000, // Online throttled
        offline: 10000000000 // 10 billion/sec - modern GPU
    };

    const onlineSeconds = combinations / (2 * guessesPerSecond.online);
    const offlineSeconds = combinations / (2 * guessesPerSecond.offline);

    onlineTime.textContent = formatTime(onlineSeconds);
    offlineTime.textContent = formatTime(offlineSeconds);
    crackTime.querySelector('.time-value').textContent = formatTime(offlineSeconds);

    // Entropy
    entropyBits.textContent = Math.round(entropy);
    const entropyPercent = Math.min(100, (entropy / 128) * 100);
    const offset = 283 - (283 * entropyPercent / 100);
    entropyCircle.style.strokeDashoffset = offset;

    if (entropy < 28) {
        entropyDesc.textContent = 'Very weak - crackable instantly';
        entropyCircle.style.stroke = '#ff4757';
    } else if (entropy < 36) {
        entropyDesc.textContent = 'Weak - crackable in hours';
        entropyCircle.style.stroke = '#ff6348';
    } else if (entropy < 60) {
        entropyDesc.textContent = 'Reasonable - crackable in years';
        entropyCircle.style.stroke = '#ffa502';
    } else if (entropy < 128) {
        entropyDesc.textContent = 'Strong - crackable in centuries';
        entropyCircle.style.stroke = '#5cdb95';
    } else {
        entropyDesc.textContent = 'Very strong - practically uncrackable';
        entropyCircle.style.stroke = '#00d2d3';
    }

    // Warnings
    if (warnings.length > 0) {
        warningsList.innerHTML = warnings.map(w => `<li>${w}</li>`).join('');
    } else {
        warningsList.innerHTML = '<li style="color: #5cdb95;">No major issues detected</li>';
    }

    // Suggestions
    if (score < 60) {
        suggestions.classList.add('show');
        suggestions.innerHTML = `
            <h4>💡 Suggestions to improve:</h4>
            <p>${getSuggestions(checks, password.length)}</p>
        `;
    } else {
        suggestions.classList.remove('show');
    }
}

function formatTime(seconds) {
    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return `${Math.round(seconds)} second${seconds === 1? '' : 's'}`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minute${Math.round(seconds / 60) === 1? '' : 's'}`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hour${Math.round(seconds / 3600) === 1? '' : 's'}`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} day${Math.round(seconds / 86400) === 1? '' : 's'}`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} year${Math.round(seconds / 31536000) === 1? '' : 's'}`;
    if (seconds < 31536000000000) return `${Math.round(seconds / 31536000000)} centuries`;
    return 'Millennia+';
}

function getSuggestions(checks, length) {
    const tips = [];
    if (length < 12) tips.push('Use at least 12 characters (16+ is better)');
    if (!checks.uppercase) tips.push('Add uppercase letters (A-Z)');
    if (!checks.lowercase) tips.push('Add lowercase letters (a-z)');
    if (!checks.numbers) tips.push('Add numbers (0-9)');
    if (!checks.symbols) tips.push('Add symbols like!@#$%^&*');
    if (!checks.unique) tips.push('Avoid common words, patterns, or repeats');
    if (tips.length === 0) tips.push('Consider using a passphrase: 4+ random words');
    return tips.join('. ') + '.';
}

function resetDisplay() {
    strengthBar.className = 'strength-bar';
    strengthBar.style.width = '0%';
    strengthText.textContent = 'Enter a password';
    strengthScore.textContent = '0/100';
    entropyBits.textContent = '0';
    entropyCircle.style.strokeDashoffset = '283';
    entropyCircle.style.stroke = '#5cdb95';
    entropyDesc.textContent = 'Higher entropy = harder to crack';
    warningsList.innerHTML = '<li>Type a password to see analysis</li>';
    suggestions.classList.remove('show');
    crackTime.querySelector('.time-value').textContent = 'Instantly';
    onlineTime.textContent = 'Instant';
    offlineTime.textContent = 'Instant';
    strengthMeter.setAttribute('aria-valuenow', '0');

    document.querySelectorAll('.check-item').forEach(item => {
        item.classList.remove('pass');
        item.querySelector('.check-icon').textContent = '✗';
    });
}

// Init
resetDisplay();