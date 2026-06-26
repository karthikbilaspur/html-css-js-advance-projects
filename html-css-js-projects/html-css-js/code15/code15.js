// JavaScript for Code 15
const diceImage = document.getElementById('diceImage');
const rollResult = document.getElementById('rollResult');
const rollBtn = document.getElementById('rollBtn');

function rollDice() {
  // Math.random gives 0 to 0.999..., *6 gives 0 to 5.999..., +1 gives 1 to 6.999...
  // Math.floor rounds down to get integers 1 through 6
  const roll = Math.floor(Math.random() * 6) + 1;
  
  // Image swap: change src to dice1.png through dice6.png
  diceImage.src = `dice${roll}.png`;
  rollResult.textContent = roll;
  
  // Add rolling animation
  diceImage.classList.add('rolling');
  setTimeout(() => {
    diceImage.classList.remove('rolling');
  }, 200);
}

rollBtn.addEventListener('click', rollDice);