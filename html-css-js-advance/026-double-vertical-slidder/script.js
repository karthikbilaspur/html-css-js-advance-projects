const sliderContainer = document.querySelector('.slider-container');
const slideLeft = document.querySelector('.left-slide');
const slideRight = document.querySelector('.right-slide');
const upButton = document.querySelector('.up-button');
const downButton = document.querySelector('.down-button');
const slidesLength = slideRight.querySelectorAll('.slide-img').length;

let activeSlideIndex = 0;

upButton.addEventListener('click', () => changeSlide('up'));
downButton.addEventListener('click', () => changeSlide('down'));

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') changeSlide('up');
    if (e.key === 'ArrowDown') changeSlide('down');
});

let touchStartY = 0;
sliderContainer.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
});

sliderContainer.addEventListener('touchend', e => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > 50) {
        if (diff > 0) changeSlide('down');
        else changeSlide('up');
    }
});

function changeSlide(direction) {
    const sliderHeight = sliderContainer.clientHeight;
    
    if (direction === 'up') {
        activeSlideIndex++;
        if (activeSlideIndex > slidesLength - 1) activeSlideIndex = 0;
    } else if (direction === 'down') {
        activeSlideIndex--;
        if (activeSlideIndex < 0) activeSlideIndex = slidesLength - 1;
    }

    slideRight.style.transform = `translateY(-${activeSlideIndex * sliderHeight}px)`;
    slideLeft.style.transform = `translateY(${activeSlideIndex * sliderHeight}px)`;
}

window.addEventListener('resize', () => {
    const sliderHeight = sliderContainer.clientHeight;
    slideRight.style.transform = `translateY(-${activeSlideIndex * sliderHeight}px)`;
    slideLeft.style.transform = `translateY(${activeSlideIndex * sliderHeight}px)`;
});