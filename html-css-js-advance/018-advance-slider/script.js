const body = document.body;
const slides = document.querySelectorAll('.slide');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');

let activeSlide = 0;

setBgToBody();

rightBtn.addEventListener('click', () => {
  activeSlide++;
  if (activeSlide > slides.length - 1) {
    activeSlide = 0;
  }
  setBgToBody();
  setActiveSlide();
});

leftBtn.addEventListener('click', () => {
  activeSlide--;
  if (activeSlide < 0) {
    activeSlide = slides.length - 1;
  }
  setBgToBody();
  setActiveSlide();
});

function setBgToBody() {
  body.style.backgroundImage = slides[activeSlide].style.backgroundImage;
}

function setActiveSlide() {
  slides.forEach((slide) => slide.classList.remove('active'));
  slides[activeSlide].classList.add('active');
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') rightBtn.click();
  if (e.key === 'ArrowLeft') leftBtn.click();
});

// Auto advance every 5s - remove if you don't want it
let autoSlide = setInterval(() => rightBtn.click(), 5000);

// Pause on hover
document.querySelector('.slider-container').addEventListener('mouseenter', () => {
  clearInterval(autoSlide);
});

document.querySelector('.slider-container').addEventListener('mouseleave', () => {
  autoSlide = setInterval(() => rightBtn.click(), 5000);
});

console.log('Background Slider loaded - KarthikCodingSolutions ⚡');
