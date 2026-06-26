// JavaScript for Code 6
// Function to generate a random number between 0 and 255
const getRandomInt = () => Math.floor(Math.random() * 256);

const changeBackground = () => {
    const r = getRandomInt();
    const g = getRandomInt();
    const b = getRandomInt();
    
    const rgbColor = `rgb(${r}, ${g}, ${b})`;
    
    // Apply as inline style
    document.body.style.backgroundColor = rgbColor;
    
    // Update the text to show the current code
    document.getElementById('colorValue').textContent = rgbColor;
};

// Add event listener once the DOM is ready (guaranteed by 'defer')
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('colorBtn').addEventListener('click', changeBackground);
});