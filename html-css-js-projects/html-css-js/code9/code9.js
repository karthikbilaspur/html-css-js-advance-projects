// JavaScript for Code 9
const image = document.getElementById('zoomImage');

// Zoom in on mouse over
image.addEventListener('mouseover', () => {
    image.style.transform = 'scale(1.2)';
});

// Zoom out on mouse leave
image.addEventListener('mouseout', () => {
    image.style.transform = 'scale(1)';
});