// JavaScript for Code 16
const coin = document.getElementById('coin');
const result = document.getElementById('result');
const flipBtn = document.getElementById('flipBtn');

let isFlipping = false;

function flipCoin() {
  if (isFlipping) return;
  
  isFlipping = true;
  flipBtn.disabled = true;
  
  // Random boolean: true = heads, false = tails
  const isHeads = Math.random() < 0.5;
  
  // Remove class to reset, then force reflow
  coin.classList.remove('flip');
  void coin.offsetWidth; // triggers reflow so animation restarts
  
  // Add flip animation
  coin.classList.add('flip');
  
  // Update result after animation finishes
  setTimeout(() => {
    if (isHeads) {
      coin.style.transform = 'rotateY(0deg)';
      result.textContent = 'Heads';
    } else {
      coin.style.transform = 'rotateY(180deg)';
      result.textContent = 'Tails';
    }
    isFlipping = false;
    flipBtn.disabled = false;
  }, 1000);
}

flipBtn.addEventListener('click', flipCoin);