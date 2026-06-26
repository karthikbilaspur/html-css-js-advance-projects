const passwordInput = document.getElementById('passwordInput');
const toggleBtn = document.getElementById('toggleBtn');
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

const commonPasswords = ['password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'letmein', 'dragon', 'baseball', 'iloveyou'];
const commonPatterns = [/1234/, /abcd/, /qwerty/, /password/i, /(.)\1{2,}/];

let isVisible = false;

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
    isVisible =!isVisible;
    passwordInput.type = isVisible? 'text' : 'password';
});

// Analyze password
passwordInput.addEventListener('input', (e) => {
    analyzePassword(e.target.value);
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
        unique:!commonPatterns.some(p => p.test(password))
    };

    // Length scoring
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 15;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 5;

    // Character variety
    if (checks.uppercase) score += 10;
    if (checks.lowercase) score += 10;
    if (checks.numbers) score += 10;
    if (checks.symbols) score += 15;

    // Penalties
    if (commonPasswords.includes(password.toLowerCase())) {
        score = 0;
        warnings.push('This is a very common password');
    }

    if (/^[0-9]+$/.test(password)) {
        score -= 20;
        warnings.push('Only numbers - easy to crack');
    }

    if (/^[a-zA-Z]+$/.test(password)) {
        score -= 10;
        warnings.push('No numbers or symbols');
    }

    if (/(.)\1{2,}/.test(password)) {
        score -= 15;
        warnings.push('Contains repeating characters');
    }

    if (/12345|qwerty|password/i.test(password)) {
        score -= 20;
        warnings.push('Contains common patterns');
    }

    if (password.length < 8) {
        warnings.push('Password is too short');
    }

    // Calculate entropy
    let poolSize = 0;
    if (checks.lowercase) poolSize += 26;
    if (checks.uppercase) poolSize += 26;
    if (checks.numbers) poolSize += 10;
    if (checks.symbols) poolSize += 32;

    entropy = Math.log2(Math.pow(poolSize, password.length));

    // Cap score
    score = Math.max(0, Math.min(100, score));

    return { score, entropy, warnings, checks, poolSize };
}

function updateUI(analysis, password) {
    const { score, entropy, warnings, checks } = analysis;

    // Update strength bar
    strengthBar.className = 'strength-bar';
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

    // Crack time estimates
    const combinations = Math.pow(analysis.poolSize, password.length);
    const guessesPerSecond = {
        online: 1000,
        offline: 10000000000 // 10 billion
    };

    const onlineSeconds = combinations / (2 * guessesPerSecond.online);
    const offlineSeconds = combinations / (2 * guessesPerSecond.offline);

    onlineTime.textContent = formatTime(onlineSeconds);
    offlineTime.textContent = formatTime(offlineSeconds);
    crackTime.querySelector('.time-value').textContent = formatTime(offlineSeconds);

    // Entropy
    entropyBits.textContent = Math.round(entropy);
    const entropyPercent = Math.min(100, (entropy / 100) * 100);
    const offset = 283 - (283 * entropyPercent / 100);
    entropyCircle.style.strokeDashoffset = offset;

    if (entropy < 28) {
        entropyDesc.textContent = 'Very weak - crackable instantly';
    } else if (entropy < 36) {
        entropyDesc.textContent = 'Weak - crackable in hours';
    } else if (entropy < 60) {
        entropyDesc.textContent = 'Reasonable - crackable in years';
    } else if (entropy < 128) {
        entropyDesc.textContent = 'Strong - crackable in centuries';
    } else {
        entropyDesc.textContent = 'Very strong - practically uncrackable';
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
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} years`;
    return 'Centuries+';
}

function getSuggestions(checks, length) {
    const tips = [];
    if (length < 12) tips.push('Use at least 12 characters');
    if (!checks.uppercase) tips.push('Add uppercase letters');
    if (!checks.lowercase) tips.push('Add lowercase letters');
    if (!checks.numbers) tips.push('Add numbers');
    if (!checks.symbols) tips.push('Add symbols like!@#$%');
    if (!checks.unique) tips.push('Avoid repeating patterns');
    return tips.join('. ') + '.';
}

function resetDisplay() {
    strengthBar.className = 'strength-bar';
    strengthBar.style.width = '0%';
    strengthText.textContent = 'Enter a password';
    strengthScore.textContent = '0/100';
    entropyBits.textContent = '0';
    entropyCircle.style.strokeDashoffset = '283';
    warningsList.innerHTML = '<li>Type a password to see analysis</li>';
    suggestions.classList.remove('show');
    crackTime.querySelector('.time-value').textContent = 'Instantly';
    onlineTime.textContent = 'Instant';
    offlineTime.textContent = 'Instant';

    document.querySelectorAll('.check-item').forEach(item => {
        item.classList.remove('pass');
        item.querySelector('.check-icon').textContent = '✗';
    });
}

// Init
resetDisplay();