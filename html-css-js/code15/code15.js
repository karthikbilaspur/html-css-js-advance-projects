// JavaScript for Code 15
document.addEventListener('DOMContentLoaded', () => {
    const diceImage = document.getElementById('diceImage');
    const rollResult = document.getElementById('rollResult');
    const rollBtn = document.getElementById('rollBtn');

    // Online dice images
    const diceImages = {
        1: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Alea_1.png",
        2: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Alea_2.png",
        3: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Alea_3.png",
        4: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Alea_4.png",
        5: "https://upload.wikimedia.org/wikipedia/commons/5/55/Alea_5.png",
        6: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Alea_6.png"
    };

    // Preload images
    Object.values(diceImages).forEach(url => {
        const img = new Image();
        img.src = url;
    });

    function rollDice() {
        rollBtn.disabled = true;

        const roll = Math.floor(Math.random() * 6) + 1;

        diceImage.classList.add('rolling');

        setTimeout(() => {
            diceImage.src = diceImages[roll];
            diceImage.alt = `Dice showing ${roll}`;
            rollResult.textContent = roll;
            diceImage.classList.remove('rolling');
            rollBtn.disabled = false;
        }, 200);
    }

    rollBtn.addEventListener('click', rollDice);

    rollBtn.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            rollDice();
        }
    });
});