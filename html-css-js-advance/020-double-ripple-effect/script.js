const buttons = document.querySelectorAll('.ripple');

buttons.forEach(button => {
  button.addEventListener('click', function (e) {
    const x = e.clientX;
    const y = e.clientY;

    const buttonTop = e.target.getBoundingClientRect().top;
    const buttonLeft = e.target.getBoundingClientRect().left;

    const xInside = x - buttonLeft;
    const yInside = y - buttonTop;

    // First ripple
    const circle = document.createElement('span');
    circle.classList.add('circle');
    circle.style.top = yInside + 'px';
    circle.style.left = xInside + 'px';

    // Second ripple with delay
    const circle2 = document.createElement('span');
    circle2.classList.add('circle', 'second');
    circle2.style.top = yInside + 'px';
    circle2.style.left = xInside + 'px';

    this.appendChild(circle);
    this.appendChild(circle2);

    // Cleanup after animation
    setTimeout(() => circle.remove(), 600);
    setTimeout(() => circle2.remove(), 750);
  });
});

console.log('Double Ripple Effect loaded - KarthikCodingSolutions ⚡ Bundle 4 Complete');
