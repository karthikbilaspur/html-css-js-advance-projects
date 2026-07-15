// Wave animation setup
const waveTexts = document.querySelectorAll('.wave-text');

waveTexts.forEach(waveText => {
  const text = waveText.textContent;
  waveText.innerHTML = text
    .split('')
    .map((letter, idx) => 
      `<span style="transition-delay:${idx * 50}ms">${letter}</span>`
    )
    .join('');
});

// Form validation
const form = document.querySelector('form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const togglePassword = document.querySelector('.toggle-password');

// Password visibility toggle
togglePassword.addEventListener('click', () => {
  const type = password.type === 'password' ? 'text' : 'password';
  password.type = type;
  togglePassword.innerHTML = type === 'password' 
    ? '<i class="fas fa-eye"></i>' 
    : '<i class="fas fa-eye-slash"></i>';
  togglePassword.setAttribute('aria-label', 
    type === 'password' ? 'Show password' : 'Hide password'
  );
});

// Validation on blur
email.addEventListener('blur', () => validateEmail());
password.addEventListener('blur', () => validatePassword());

// Clear errors on input
email.addEventListener('input', () => clearError(email));
password.addEventListener('input', () => clearError(password));

// Form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  
  if (isEmailValid && isPasswordValid) {
    // Simulate login
    const btn = form.querySelector('.btn');
    btn.textContent = 'Logging in...';
    btn.disabled = true;
    
    setTimeout(() => {
      btn.textContent = 'Success!';
      setTimeout(() => {
        form.reset();
        btn.textContent = 'Login';
        btn.disabled = false;
        [email, password].forEach(input => input.classList.remove('valid'));
      }, 1500);
    }, 1000);
  }
});

function validateEmail() {
  const value = email.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!value) {
    showError(email, 'Email is required');
    return false;
  } else if (!emailRegex.test(value)) {
    showError(email, 'Enter a valid email');
    return false;
  }
  
  showSuccess(email);
  return true;
}

function validatePassword() {
  const value = password.value;
  
  if (!value) {
    showError(password, 'Password is required');
    return false;
  } else if (value.length < 6) {
    showError(password, 'Password must be 6+ characters');
    return false;
  }
  
  showSuccess(password);
  return true;
}

function showError(input, message) {
  input.classList.add('invalid');
  input.classList.remove('valid');
  const errorMsg = input.parentElement.querySelector('.error-msg');
  errorMsg.textContent = message;
  errorMsg.classList.add('show');
}

function showSuccess(input) {
  input.classList.add('valid');
  input.classList.remove('invalid');
  const errorMsg = input.parentElement.querySelector('.error-msg');
  errorMsg.classList.remove('show');
}

function clearError(input) {
  if (input.classList.contains('invalid')) {
    input.classList.remove('invalid');
    const errorMsg = input.parentElement.querySelector('.error-msg');
    errorMsg.classList.remove('show');
  }
}