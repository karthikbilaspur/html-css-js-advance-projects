const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links a');
const smellOutput = document.getElementById('smell-output');

const smells = {
    cheese: '🧀 Pee-yew! Aged cheese!',
    fish: '🐟 Smells like old fish!',
    socks: '🧦 Who wore these socks?!',
    trash: '🗑️ Garbage day was last week!'
};

// Mobile nav toggle
burger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
});

// Stinky hover effects
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        const smellType = link.getAttribute('data-smell');
        showSmell(smells[smellType]);

        // Random rotation for extra stink
        const randomRotate = Math.random() * 20 - 10;
        link.style.transform = `rotate(${randomRotate}deg) scale(1.2)`;
    });

    link.addEventListener('mouseleave', () => {
        link.style.transform = '';
    });
});

function showSmell(text) {
    const cloud = document.createElement('div');
    cloud.textContent = text;
    cloud.classList.add('stink-cloud');
    smellOutput.innerHTML = '';
    smellOutput.appendChild(cloud);
}

// Random logo wobble
setInterval(() => {
    const logo = document.querySelector('.logo');
    const randomDeg = Math.random() * 10 - 5;
    logo.style.transform = `rotate(${randomDeg}deg)`;
}, 2000);