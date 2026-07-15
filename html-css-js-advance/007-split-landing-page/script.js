const left = document.querySelector('.left');
const right = document.querySelector('.right');
const container = document.querySelector('.container');

// Mouse events
left.addEventListener('mouseenter', () => addHover('left'));
left.addEventListener('mouseleave', () => removeHover('left'));

right.addEventListener('mouseenter', () => addHover('right'));
right.addEventListener('mouseleave', () => removeHover('right'));

// Keyboard accessibility
left.addEventListener('focus', () => addHover('left'));
left.addEventListener('blur', () => removeHover('left'));

right.addEventListener('focus', () => addHover('right'));
right.addEventListener('blur', () => removeHover('right'));

// Touch support for mobile
left.addEventListener('touchstart', () => addHover('left'), { passive: true });
right.addEventListener('touchstart', () => addHover('right'), { passive: true });

function addHover(side) {
  container.classList.remove('hover-left', 'hover-right');
  container.classList.add(`hover-${side}`);
}

function removeHover(side) {
  container.classList.remove(`hover-${side}`);
}