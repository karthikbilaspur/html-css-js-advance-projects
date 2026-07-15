// Dynamic loading text
const loaderText = document.querySelector('.loader-container h1');
const messages = ['Loading...', 'Almost there...', 'Just a moment...', 'Preparing...'];
let messageIndex = 0;

// Change loading text every 2 seconds
setInterval(() => {
  messageIndex = (messageIndex + 1) % messages.length;
  loaderText.style.opacity = '0';

  setTimeout(() => {
    loaderText.textContent = messages[messageIndex];
    loaderText.style.opacity = '1';
  }, 300);
}, 2000);

console.log('Kinetic Loader loaded - KarthikCodingSolutions ⚡ Pure CSS animation');

// Optional: Simulate loading complete after 8 seconds
// setTimeout(() => {
// document.querySelector('.loader-container').style.display = 'none';
// document.body.innerHTML += '<h1 style="color: #f1f5f9;">Content Loaded!</h1>';
// }, 8000);