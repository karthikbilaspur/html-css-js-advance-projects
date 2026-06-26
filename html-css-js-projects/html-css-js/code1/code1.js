// Code 1 - Beginner: Hello JS Alert
// Concepts: alert(), console.log(), DOMContentLoaded

console.log('Code 1: JavaScript file loaded successfully!');

// Wait for DOM to be fully loaded before running code
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM is ready! You can now safely access HTML elements.');
  
  // 1. Update text using DOM manipulation
  const status = document.getElementById('status');
  status.textContent = 'JavaScript is running!';
  status.style.color = '#16a34a';
  
  // 2. Add click event for alert
  const btn = document.getElementById('alertBtn');
  btn.addEventListener('click', () => {
    alert('Hello from JavaScript! This is Code 1.');
    console.log('Alert button was clicked');
  });
  
  console.log('Code 1 setup complete. Try clicking the button.');
});