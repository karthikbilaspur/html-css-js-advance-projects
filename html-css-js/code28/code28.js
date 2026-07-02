// JavaScript for Code 28
const passwordOutput = document.getElementById('passwordOutput');
const copyBtn = document.getElementById('copyBtn');
const lengthRange = document.getElementById('lengthRange');
const lengthValue = document.getElementById('lengthValue');
const generateBtn = document.getElementById('generateBtn');
const infoText = document.getElementById('infoText');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');

// Checkboxes
const uppercaseCheck = document.getElementById('uppercase');
const lowercaseCheck = document.getElementById('lowercase');
const numbersCheck = document.getElementById('numbers');
const symbolsCheck = document.getElementById('symbols');
const excludeSimilarCheck = document.getElementById('excludeSimilar');

// Charset strings
const charsets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

const similarChars = 'il1Lo0O';

function updateLength() {
  lengthValue.textContent = lengthRange.value;
}

function calculateStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 16) score++;

  strengthBar.classList.remove('weak', 'medium', 'strong');
  if (score <= 2) {
    strengthBar.classList.add('weak');
    strengthText.textContent = 'Strength: Weak';
  } else if (score <= 4) {
    strengthBar.classList.add('medium');
    strengthText.textContent = 'Strength: Medium';
  } else {
    strengthBar.classList.add('strong');
    strengthText.textContent = 'Strength: Strong';
  }
}

function generatePassword() {
  const length = parseInt(lengthRange.value);
  let charset = '';
  let password = '';

  // Build charset string based on checked boxes
  if (uppercaseCheck.checked) charset += charsets.uppercase;
  if (lowercaseCheck.checked) charset += charsets.lowercase;
  if (numbersCheck.checked) charset += charsets.numbers;
  if (symbolsCheck.checked) charset += charsets.symbols;

  if (charset === '') {
    infoText.textContent = 'Please select at least one character type';
    passwordOutput.value = '';
    return;
  }

  // Remove similar characters if checked
  if (excludeSimilarCheck.checked) {
    for (let char of similarChars) {
      charset = charset.split(char).join('');
    }
  }

  // Loop to build password character by character
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  passwordOutput.value = password;
  calculateStrength(password);
  infoText.textContent = `Generated ${length} character password`;
}

function copyPassword() {
  if (!passwordOutput.value) return;

  navigator.clipboard.writeText(passwordOutput.value).then(() => {
    copyBtn.textContent = '✓';
    copyBtn.classList.add('copied');
    infoText.textContent = 'Copied to clipboard!';
    setTimeout(() => {
      copyBtn.textContent = '📋';
      copyBtn.classList.remove('copied');
    }, 2000);
  });
}

// Event listeners
lengthRange.addEventListener('input', updateLength);
generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyPassword);

// Auto-generate on checkbox change
[uppercaseCheck, lowercaseCheck, numbersCheck, symbolsCheck, excludeSimilarCheck].forEach(checkbox => {
  checkbox.addEventListener('change', generatePassword);
});

// Init
updateLength();
generatePassword();