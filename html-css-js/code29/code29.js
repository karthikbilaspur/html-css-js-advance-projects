// JavaScript for Code 29
const textInput = document.getElementById('textInput');
const checkBtn = document.getElementById('checkBtn');
const exampleBtn = document.getElementById('exampleBtn');
const clearBtn = document.getElementById('clearBtn');
const ignoreCase = document.getElementById('ignoreCase');
const ignorePunct = document.getElementById('ignorePunct');
const resultBox = document.getElementById('resultBox');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const comparison = document.getElementById('comparison');
const resultDetail = document.getElementById('resultDetail');
const historyList = document.getElementById('historyList');
const totalChecked = document.getElementById('totalChecked');
const palindromeCount = document.getElementById('palindromeCount');
const accuracy = document.getElementById('accuracy');

const examples = [
  "A man a plan a canal Panama",
  "Madam",
  "Racecar",
  "Was it a car or a cat I saw",
  "No lemon no melon",
  "Never odd or even",
  "12321",
  "Step on no pets"
];

let stats = {
  total: parseInt(localStorage.getItem('palindromeTotal')) || 0,
  palindromes: parseInt(localStorage.getItem('palindromeCount')) || 0,
  history: JSON.parse(localStorage.getItem('palindromeHistory')) || []
};

function cleanText(text, ignoreCaseOpt, ignorePunctOpt) {
  let cleaned = text;
  if (ignoreCaseOpt) cleaned = cleaned.toLowerCase();
  if (ignorePunctOpt) cleaned = cleaned.replace(/[^a-z0-9]/gi, '');
  return cleaned;
}

function isPalindrome(text) {
  // Core logic: split, reverse, join
  const cleaned = cleanText(text, ignoreCase.checked, ignorePunct.checked);
  const reversed = cleaned.split('').reverse().join('');
  return { isPalin: cleaned === reversed, cleaned, reversed };
}

function highlightComparison(original, reversed) {
  let html = '<div class="original">Forward: ';
  for (let i = 0; i < original.length; i++) {
    const cls = original[i] === reversed[i]? 'match' : 'diff';
    html += `<span class="${cls}">${original[i]}</span>`;
  }
  html += '</div><div class="reversed">Reverse: ';
  for (let i = 0; i < reversed.length; i++) {
    const cls = original[i] === reversed[i]? 'match' : 'diff';
    html += `<span class="${cls}">${reversed[i]}</span>`;
  }
  html += '</div>';
  return html;
}

function checkPalindrome() {
  const text = textInput.value.trim();
  if (!text) {
    alert('Please enter some text');
    return;
  }

  const { isPalin, cleaned, reversed } = isPalindrome(text);

  stats.total++;
  if (isPalin) stats.palindromes++;

  resultBox.classList.remove('yes', 'no', 'show');
  setTimeout(() => {
    resultBox.classList.add('show');
    resultBox.classList.add(isPalin? 'yes' : 'no');
    resultIcon.textContent = isPalin? '✓' : '✗';
    resultTitle.textContent = isPalin? 'It\'s a Palindrome!' : 'Not a Palindrome';
    comparison.innerHTML = highlightComparison(cleaned, reversed);
    resultDetail.textContent = `Processed: "${cleaned}" | Reversed: "${reversed}"`;
  }, 10);

  // Add to history
  stats.history.unshift({ text, isPalin, date: Date.now() });
  if (stats.history.length > 10) stats.history.pop();

  saveStats();
  updateStats();
  renderHistory();
}

function saveStats() {
  localStorage.setItem('palindromeTotal', stats.total);
  localStorage.setItem('palindromeCount', stats.palindromes);
  localStorage.setItem('palindromeHistory', JSON.stringify(stats.history));
}

function updateStats() {
  totalChecked.textContent = stats.total;
  palindromeCount.textContent = stats.palindromes;
  const acc = stats.total > 0? Math.round((stats.palindromes / stats.total) * 100) : 0;
  accuracy.textContent = acc + '%';
}

function renderHistory() {
  historyList.innerHTML = stats.history.map(item => `
    <div class="history-item ${item.isPalin? 'palindrome' : 'not-palindrome'}">
      <span class="history-text">${item.text}</span>
      <span class="history-icon">${item.isPalin? '✓' : '✗'}</span>
    </div>
  `).join('');
}

function loadExample() {
  const randomIndex = Math.floor(Math.random() * examples.length);
  textInput.value = examples[randomIndex];
  checkPalindrome();
}

function clearAll() {
  textInput.value = '';
  resultBox.classList.remove('show');
}

checkBtn.addEventListener('click', checkPalindrome);
exampleBtn.addEventListener('click', loadExample);
clearBtn.addEventListener('click', clearAll);

textInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' &&!e.shiftKey) {
    e.preventDefault();
    checkPalindrome();
  }
});

// Init
updateStats();
renderHistory();