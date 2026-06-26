const codeInputs = document.querySelectorAll('.code-input');
const verifyBtn = document.getElementById('verifyBtn');
const errorMsg = document.getElementById('errorMsg');
const resendBtn = document.getElementById('resendBtn');
const countdownEl = document.getElementById('countdown');
const timerEl = document.getElementById('timer');
const successScreen = document.getElementById('successScreen');
const codeContainer = document.getElementById('codeContainer');

const CORRECT_CODE = '123456'; // Demo code
let timeLeft = 60;
let timerInterval;

// Auto-focus next input
codeInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        const value = e.target.value;

        // Only allow numbers
        if (!/^\d*$/.test(value)) {
            e.target.value = '';
            return;
        }

        if (value) {
            input.classList.add('filled');
            if (index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        } else {
            input.classList.remove('filled');
        }

        checkInputs();
    });

    input.addEventListener('keydown', (e) => {
        // Backspace
        if (e.key === 'Backspace' &&!input.value && index > 0) {
            codeInputs[index - 1].focus();
            codeInputs[index - 1].value = '';
            codeInputs[index - 1].classList.remove('filled');
            checkInputs();
        }

        // Arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            codeInputs[index - 1].focus();
        }
        if (e.key === 'ArrowRight' && index < codeInputs.length - 1) {
            codeInputs[index + 1].focus();
        }
    });

    // Paste support
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);

        if (!/^\d+$/.test(pastedData)) {
            showError('Please paste numbers only');
            return;
        }

        pastedData.split('').forEach((char, i) => {
            if (codeInputs[i]) {
                codeInputs[i].value = char;
                codeInputs[i].classList.add('filled');
            }
        });

        const lastIndex = Math.min(pastedData.length, codeInputs.length - 1);
        codeInputs[lastIndex].focus();
        checkInputs();
    });
});

function checkInputs() {
    const code = Array.from(codeInputs).map(input => input.value).join('');
    verifyBtn.disabled = code.length!== 6;
    errorMsg.textContent = '';
    codeContainer.classList.remove('error');
}

// Verify button
verifyBtn.addEventListener('click', () => {
    const code = Array.from(codeInputs).map(input => input.value).join('');

    if (code === CORRECT_CODE) {
        successScreen.classList.add('active');
    } else {
        showError('Invalid verification code. Try 123456 for demo');
        codeContainer.classList.add('error');
        codeInputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
        codeInputs[0].focus();
        verifyBtn.disabled = true;
    }
});

// Resend timer
function startTimer() {
    resendBtn.disabled = true;
    timerEl.classList.remove('hidden');
    timeLeft = 60;

    timerInterval = setInterval(() => {
        timeLeft--;
        countdownEl.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            resendBtn.disabled = false;
            timerEl.classList.add('hidden');
        }
    }, 1000);
}

resendBtn.addEventListener('click', () => {
    if (!resendBtn.disabled) {
        showError('');
        errorMsg.textContent = 'New code sent to your email';
        errorMsg.style.color = '#5cdb95';
        setTimeout(() => {
            errorMsg.textContent = '';
            errorMsg.style.color = '#ff4757';
        }, 3000);
        startTimer();
    }
});

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.color = '#ff4757';
}

// Continue button
document.getElementById('continueBtn').addEventListener('click', () => {
    alert('Redirecting to dashboard...');
});

// Init
startTimer();