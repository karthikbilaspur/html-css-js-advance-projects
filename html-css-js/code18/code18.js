// JavaScript for Code 18
const form = document.getElementById('signupForm');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const phone = document.getElementById('phone');

const usernameError = document.getElementById('usernameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const phoneError = document.getElementById('phoneError');
const successMsg = document.getElementById('successMsg');

// Regex patterns
const patterns = {
  username: /^[a-zA-Z0-9_]{3,16}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  phone: /^[6-9]\d{9}$/
};

function showError(input, errorElement, message) {
  input.classList.add('invalid');
  input.classList.remove('valid');
  errorElement.textContent = message;
}

function showSuccess(input, errorElement) {
  input.classList.add('valid');
  input.classList.remove('invalid');
  errorElement.textContent = '';
}

function validateUsername() {
  if (username.value.trim() === '') {
    showError(username, usernameError, 'Username is required');
    return false;
  } else if (!patterns.username.test(username.value)) {
    showError(username, usernameError, '3-16 chars, letters, numbers, _ only');
    return false;
  } else {
    showSuccess(username, usernameError);
    return true;
  }
}

function validateEmail() {
  if (email.value.trim() === '') {
    showError(email, emailError, 'Email is required');
    return false;
  } else if (!patterns.email.test(email.value)) {
    showError(email, emailError, 'Enter a valid email address');
    return false;
  } else {
    showSuccess(email, emailError);
    return true;
  }
}

function validatePassword() {
  if (password.value === '') {
    showError(password, passwordError, 'Password is required');
    return false;
  } else if (!patterns.password.test(password.value)) {
    showError(password, passwordError, 'Min 8 chars, at least 1 letter and 1 number');
    return false;
  } else {
    showSuccess(password, passwordError);
    return true;
  }
}

function validatePhone() {
  if (phone.value.trim() === '') {
    showError(phone, phoneError, 'Phone number is required');
    return false;
  } else if (!patterns.phone.test(phone.value)) {
    showError(phone, phoneError, 'Enter valid 10-digit Indian mobile number');
    return false;
  } else {
    showSuccess(phone, phoneError);
    return true;
  }
}

// Real-time validation on blur
username.addEventListener('blur', validateUsername);
email.addEventListener('blur', validateEmail);
password.addEventListener('blur', validatePassword);
phone.addEventListener('blur', validatePhone);

// Clear errors on input for better UX
[username, email, password, phone].forEach(input => {
  input.addEventListener('input', () => {
    if (input.classList.contains('invalid')) {
      input.classList.remove('invalid');
    }
  });
});

// Form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  successMsg.textContent = '';

  const isUsernameValid = validateUsername();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isPhoneValid = validatePhone();

  if (isUsernameValid && isEmailValid && isPasswordValid && isPhoneValid) {
    successMsg.textContent = 'Form submitted successfully!';
    form.reset();
    document.querySelectorAll('input').forEach(input => {
      input.classList.remove('valid', 'invalid');
    });
    
    // Clear success message after 3s
    setTimeout(() => {
      successMsg.textContent = '';
    }, 3000);
  }
});