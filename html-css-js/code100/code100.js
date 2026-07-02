// DOM Ready - Code 1
console.log('Code 100 Dashboard Loaded 🚀');
document.getElementById('status').textContent = 'JavaScript is running!';

// 1. Alert - Code 1
document.getElementById('alertBtn').addEventListener('click', () => {
  alert('Hello from Code 100! You completed all 10 projects 🎉');
});

// 2. Change Text - Code 2
document.getElementById('changeBtn').addEventListener('click', () => {
  const text = document.getElementById('demoText');
  text.textContent = 'Text changed! DOM manipulation works ✨';
});

// 3. Theme Toggle - Code 3
const themeBtn = document.getElementById('themeBtn');
const icon = themeBtn.querySelector('.icon');
const btnText = themeBtn.querySelector('.btn-text');

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  icon.textContent = isDark ? '☀️' : '🌙';
  btnText.textContent = isDark ? 'Light Mode' : 'Dark Mode';
});

// 4. Character Counter - Code 4
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const maxChars = 100;

textInput.addEventListener('input', () => {
  const count = textInput.value.length;
  charCount.textContent = `Characters: ${count} / ${maxChars}`;
  
  charCount.className = count > 90 ? 'danger' : count > 70 ? 'warning' : 'safe';
});

// 5. Password Toggle - Code 5
const passwordField = document.getElementById('passwordField');
const toggleBtn = document.getElementById('toggleBtn');

toggleBtn.addEventListener('click', () => {
  const type = passwordField.type === 'password' ? 'text' : 'password';
  passwordField.type = type;
  toggleBtn.textContent = type === 'password' ? 'Show' : 'Hide';
});

// 6. Random Color - Code 6
const colorBtn = document.getElementById('colorBtn');
const colorValue = document.getElementById('colorValue');
const colorCard = document.getElementById('colorCard');

colorBtn.addEventListener('click', () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  const rgb = `rgb(${r}, ${g}, ${b})`;
  
  colorCard.style.backgroundColor = rgb;
  colorValue.textContent = rgb;
});

// 7. Digital Clock - Code 7
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// 8. Calculator - Code 8
const display = document.getElementById('display');

function appendToDisplay(value) {
  display.value += value;
}

function calculate() {
  try {
    display.value = eval(display.value) || '';
  } catch {
    display.value = 'Error';
  }
}

function clearDisplay() {
  display.value = '';
}

// 9. Image Zoom - Handled by CSS hover

// 10. Accordion - Code 10
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    answer.classList.toggle('active');
  });
});