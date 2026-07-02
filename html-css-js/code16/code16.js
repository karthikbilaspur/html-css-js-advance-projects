    const coin = document.getElementById('coin');
    const flipBtn = document.getElementById('flipBtn');
    const result = document.getElementById('result');
    let isFlipping = false;

    flipBtn.addEventListener('click', () => {
      if (isFlipping) return;
      
      isFlipping = true;
      flipBtn.disabled = true;
      result.textContent = 'Flipping...';

      // Random outcome
      const random = Math.random();
      const isHeads = random < 0.5;
      
      // Remove old animation class to restart
      coin.classList.remove('flip');
      void coin.offsetWidth; // Trigger reflow
      
      // Add rotation + final position
      const spins = 5; // Full 360 spins
      const finalRotation = isHeads ? spins * 360 : spins * 360 + 180;
      coin.style.transform = `rotateY(${finalRotation}deg)`;
      coin.classList.add('flip');

      // Update result after animation
      setTimeout(() => {
        result.textContent = isHeads ? 'Heads' : 'Tails';
        isFlipping = false;
        flipBtn.disabled = false;
      }, 2000);
    });
