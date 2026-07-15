const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links a');
const smellOutput = document.getElementById('smell-output');
const logo = document.querySelector('.logo');

const smells = {
    cheese: '🧀 Pee-yew! Aged cheese!',
    fish: '🐟 Smells like old fish!',
    socks: '🧦 Who wore these socks?!',
    trash: '🗑 Garbage day was last week!'
};

// Mobile nav toggle
burger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
    burger.classList.toggle('toggle');
    
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded',!expanded);
});

// Close mobile nav when link clicked
links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('nav-active');
        burger.classList.remove('toggle');
        burger.setAttribute('aria-expanded', 'false');
    });
});

// Stinky hover effects
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        const smellType = link.getAttribute('data-smell');
        if (smellType && smells[smellType]) {
            showSmell(smells[smellType]);
        }
    });
});

function showSmell(text) {
    const cloud = document.createElement('div');
    cloud.textContent = text;
    cloud.classList.add('stink-cloud');
    smellOutput.appendChild(cloud);
    
    // Auto-remove after animation so clouds can stack
    setTimeout(() => cloud.remove(), 1000);
}

// Random logo wobble
setInterval(() => {
    const randomDeg = Math.random() * 10 - 5;
    logo.style.transform = `rotate(${randomDeg}deg)`;
}, 2000);