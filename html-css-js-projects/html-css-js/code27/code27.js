// JavaScript for Code 27
/ Array of objects - each quote has text, author, category
const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivation" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "motivation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "success" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "wisdom" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb", category: "wisdom" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", category: "life" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "motivation" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "motivation" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins", category: "success" },
  { text: "Do not watch the clock. Do what it does. Keep going.", author: "Sam Levenson", category: "success" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama", category: "life" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky", category: "success" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford", category: "wisdom" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison", category: "wisdom" },
  { text: "The mind is everything. What you think you become.", author: "Buddha", category: "wisdom" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan", category: "motivation" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis", category: "life" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller", category: "success" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama", category: "life" }
];

const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteCategory = document.getElementById('quoteCategory');
const quoteCard = document.getElementById('quoteCard');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const favBtn = document.getElementById('favBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const favoritesList = document.getElementById('favoritesList');
const favCount = document.getElementById('favCount');

let currentQuote = null;
let currentCategory = 'all';
let favorites = JSON.parse(localStorage.getItem('quoteFavorites')) || [];

function getFilteredQuotes() {
  if (currentCategory === 'all') return quotes;
  return quotes.filter(q => q.category === currentCategory);
}

function getRandomIndex(max) {
  // Random index: Math.floor(Math.random() * max)
  return Math.floor(Math.random() * max);
}

function displayQuote(quote) {
  currentQuote = quote;
  quoteCard.style.animation = 'none';
  setTimeout(() => {
    quoteCard.style.animation = 'fadeIn 0.5s ease';
  }, 10);
  
  quoteText.textContent = quote.text;
  quoteAuthor.textContent = `— ${quote.author}`;
  quoteCategory.textContent = quote.category;
  
  // Check if favorited
  const isFav = favorites.some(f => f.text === quote.text);
  favBtn.classList.toggle('active', isFav);
  favBtn.textContent = isFav ? '♥' : '♡';
}

function generateQuote() {
  const filteredQuotes = getFilteredQuotes();
  const randomIndex = getRandomIndex(filteredQuotes.length);
  displayQuote(filteredQuotes[randomIndex]);
}

function toggleFavorite() {
  if (!currentQuote) return;
  
  const index = favorites.findIndex(f => f.text === currentQuote.text);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(currentQuote);
  }
  
  localStorage.setItem('quoteFavorites', JSON.stringify(favorites));
  updateFavoritesDisplay();
  favBtn.classList.toggle('active');
  favBtn.textContent = favBtn.classList.contains('active') ? '♥' : '♡';
}

function updateFavoritesDisplay() {
  favCount.textContent = favorites.length;
  favoritesList.innerHTML = favorites.map((fav, idx) => `
    <div class="fav-item">
      <p>${fav.text}</p>
      <div class="author">— ${fav.author}</div>
      <button class="remove-btn" onclick="removeFavorite(${idx})">×</button>
    </div>
  `).join('');
}

function removeFavorite(idx) {
  favorites.splice(idx, 1);
  localStorage.setItem('quoteFavorites', JSON.stringify(favorites));
  updateFavoritesDisplay();
  if (currentQuote && !favorites.some(f => f.text === currentQuote.text)) {
    favBtn.classList.remove('active');
    favBtn.textContent = '♡';
  }
}

function copyQuote() {
  if (!currentQuote) return;
  const text = `"${currentQuote.text}" — ${currentQuote.author}`;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = '✓';
    setTimeout(() => copyBtn.textContent = '📋', 1500);
  });
}

function shareQuote() {
  if (!currentQuote) return;
  const text = `"${currentQuote.text}" — ${currentQuote.author}`;
  if (navigator.share) {
    navigator.share({ text });
  } else {
    copyQuote();
    alert('Quote copied to clipboard!');
  }
}

// Category filter
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    generateQuote();
  });
});

newQuoteBtn.addEventListener('click', generateQuote);
favBtn.addEventListener('click', toggleFavorite);
copyBtn.addEventListener('click', copyQuote);
shareBtn.addEventListener('click', shareQuote);

// Init
updateFavoritesDisplay();
generateQuote();

// Make removeFavorite global for onclick
window.removeFavorite = removeFavorite;