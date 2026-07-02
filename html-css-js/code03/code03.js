// This is code3.js - normally you'd put this in a separate file
// For your project, copy this into code3.js

// 1. Get references to the elements we need using document.getElementById
const themeBtn = document.getElementById('themeBtn');
const body = document.body;
const btnText = themeBtn.querySelector('.btn-text');
const btnIcon = themeBtn.querySelector('.icon');

// 2. Add click event to the button using onclick
themeBtn.onclick = function() {
  // classList.toggle() is a JavaScript method that:
  // - Adds the class if it's NOT already on the element
  // - Removes the class if it IS already on the element
  // This is perfect for toggling between two states like dark/light mode
  body.classList.toggle('dark-mode');
  
  // 3. Check if dark mode is now active and update button text
  // classList.contains() returns true if the element has that class
  if (body.classList.contains('dark-mode')) {
    // textContent changes the text inside an element
    btnText.textContent = 'Light Mode';
    btnIcon.textContent = '☀️';
  } else {
    btnText.textContent = 'Dark Mode';
    btnIcon.textContent = '🌙';
  }
};

/* 
  OPTIONAL: Save user preference with localStorage
  Uncomment this code if you want the theme to persist on page reload
  
  // Check for saved theme on page load
  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    btnText.textContent = 'Light Mode';
    btnIcon.textContent = '☀️';
  }
  
  // Save theme when toggling
  themeBtn.addEventListener('click', function() {
    if (body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
*/
