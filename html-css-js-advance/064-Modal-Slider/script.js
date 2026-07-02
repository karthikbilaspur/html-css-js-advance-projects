// Create array with 64 menu items
const menuItems = Array.from({ length: 64 }, (_, i) => ({
    id: i + 1,
    title: `Menu Item ${i + 1}`,
    desc: `This is a longer description for menu item ${i + 1}. It contains more details so the slider feels substantial. You can put links, actions, or any content here. Perfect for dashboards, settings, or product lists.`,
    tag: i % 3 === 0? 'Featured' : i % 3 === 1? 'New' : 'Popular'
}));

let currentSlide = 0;
const slider = document.getElementById('slider');
const counter = document.getElementById('counter');
const dotsContainer = document.getElementById('dots');

// Build all 64 slides from array
menuItems.forEach((item, index) => {
    // Create slide
    const slide = document.createElement('div');
    slide.className = 'slide';
    if (index === 0) slide.classList.add('active');

    slide.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        <span class="tag">${item.tag}</span>
    `;
    slider.appendChild(slide);

    // Create dot for first 10 only to keep it clean
    if (index < 10) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    }
});

const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

// Modal controls
const modal = document.getElementById('modal');
document.getElementById('openModal').onclick = () => modal.classList.add('active');
document.querySelector('.close').onclick = () => modal.classList.remove('active');
window.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
};

// Slider controls
document.querySelector('.next').onclick = () => changeSlide(1);
document.querySelector('.prev').onclick = () => changeSlide(-1);

function changeSlide(direction) {
    slides[currentSlide].classList.remove('active');
    if (currentSlide < 10) dots[currentSlide].classList.remove('active');

    currentSlide = (currentSlide + direction + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    if (currentSlide < 10) dots[currentSlide].classList.add('active');
    counter.textContent = `${currentSlide + 1} / 64`;
}

function goToSlide(n) {
    slides[currentSlide].classList.remove('active');
    if (currentSlide < 10) dots[currentSlide].classList.remove('active');

    currentSlide = n;

    slides[currentSlide].classList.add('active');
    if (currentSlide < 10) dots[currentSlide].classList.add('active');
    counter.textContent = `${currentSlide + 1} / 64`;
}

// Keyboard nav
document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'ArrowRight') changeSlide(1);
    if (e.key === 'ArrowLeft') changeSlide(-1);
    if (e.key === 'Escape') modal.classList.remove('active');
});